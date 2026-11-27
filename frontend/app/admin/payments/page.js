"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import StatCard from "@/components/admin/StatCard";
import {
  Wallet,
  Gift,
  Flame,
  Loader2,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  getPayments,
  getPaymentDonations,
  getPaymentSummary,
} from "@/action/admin";

/* ───────── formatting helpers (unchanged) ───────── */

function formatCurrency(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
}
function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatPaymentType(type) {
  if (type === "subscription") return "Subscription";
  if (type === "specificPuja") return "Specific Puja";
  if (type === "donation") return "Donation";
  return type || "—";
}
function formatMethod(method) {
  if (!method) return "—";
  if (method === "phonepe") return "PhonePe";
  if (method === "paypal") return "PayPal";
  return method;
}
function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
function getStatusVariant(status) {
  switch (status) {
    case "success": return "success";
    case "pending": return "warning";
    case "failed": return "danger";
    default: return "neutral";
  }
}

const EMPTY_FILTERS = {
  search: "",
  type: "",
  status: "",
  method: "",
  from: "",
  to: "",
};

const PAGE_LIMIT = 20;

/* ───────── main component ───────── */

export default function PaymentsPage() {
  const [summary, setSummary] = useState({
    courseRevenue: 0,
    donationTotal: 0,
    pujaRevenue: 0,
  });

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [payments, setPayments] = useState([]);
  const [donations, setDonations] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [donationsTotal, setDonationsTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const reqRef = useRef(0); // stale-response guard

  /* Debounce search */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search.trim()), 400);
    return () => clearTimeout(id);
  }, [filters.search]);

  /* Reset to page 1 whenever any filter (incl. debounced search) changes */
  useEffect(() => {
    setPage(1);
  }, [
    filters.type,
    filters.status,
    filters.method,
    filters.from,
    filters.to,
    debouncedSearch,
  ]);

  /* Summary (once) */
  useEffect(() => {
    (async () => {
      try {
        setLoadingSummary(true);
        const { data } = await getPaymentSummary();
        setSummary({
          courseRevenue: data?.courseRevenue || 0,
          donationTotal: data?.donationTotal || 0,
          pujaRevenue: data?.pujaRevenue || 0,
        });
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to load summary."
        );
      } finally {
        setLoadingSummary(false);
      }
    })();
  }, []);

  /* Main fetch — runs on filters/page change */
  useEffect(() => {
    const reqId = ++reqRef.current;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const baseParams = {
          status: filters.status || undefined,
          method: filters.method || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          search: debouncedSearch || undefined,
          page,
          limit: PAGE_LIMIT,
        };

        const wantPayments = filters.type !== "donation";
        const wantDonations = filters.type !== "subscription" && filters.type !== "specificPuja";

        const paymentsParams = {
          ...baseParams,
          type:
            filters.type === "subscription" || filters.type === "specificPuja"
              ? filters.type
              : undefined,
        };

        const promises = [
          wantPayments
            ? getPayments(paymentsParams)
            : Promise.resolve({ data: { items: [], total: 0 } }),
          wantDonations
            ? getPaymentDonations(baseParams)
            : Promise.resolve({ data: { items: [], total: 0 } }),
        ];

        const [pRes, dRes] = await Promise.all(promises);
        if (reqId !== reqRef.current) return; // stale

        setPayments(pRes?.data?.items || []);
        setDonations(dRes?.data?.items || []);
        setPaymentsTotal(pRes?.data?.total || 0);
        setDonationsTotal(dRes?.data?.total || 0);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        const msg =
          err?.response?.data?.message ||
          "Failed to load payment information.";
        setError(msg);
        toast.error(msg);
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [
    filters.type,
    filters.status,
    filters.method,
    filters.from,
    filters.to,
    debouncedSearch,
    page,
  ]);

  /* Merge for display */
  const transactions = useMemo(() => {
    const p = payments.map((payment) => {
      let item = "—";
      if (payment.type === "subscription") {
        item = payment.course?.title || "Course Subscription";
      }
      if (payment.type === "specificPuja") {
        item =
          payment.pujaBooking?.package?.name || "Specific Puja";
      }
      return {
        id: `payment-${payment._id}`,
        user: payment.user?.name || "Unknown User",
        typeLabel: formatPaymentType(payment.type),
        item,
        amount: payment.amount || 0,
        methodLabel: formatMethod(payment.method),
        date: payment.createdAt,
        status: payment.status,
      };
    });

    const d = donations.map((donation) => ({
      id: `donation-${donation._id}`,
      user: donation.user?.name || "Anonymous",
      typeLabel: "Donation",
      item: donation.freeClass?.title
        ? `${donation.freeClass.title} (Free Class)`
        : "Free Class Donation",
      amount: donation.amount || 0,
      methodLabel: formatMethod(donation.method),
      date: donation.createdAt,
      status: donation.status,
    }));

    return [...p, ...d].sort(
      (a, b) =>
        new Date(b.date || 0).getTime() -
        new Date(a.date || 0).getTime()
    );
  }, [payments, donations]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.type) n++;
    if (filters.status) n++;
    if (filters.method) n++;
    if (filters.from) n++;
    if (filters.to) n++;
    return n;
  }, [filters]);

  /* Combined page controls — total across both sources */
  const totalCount = paymentsTotal + donationsTotal;
  const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <>
      <Topbar
        title="Payments & Donations"
        subtitle="All transactions across courses, free-class donations, and specific puja"
      />

      <main className="px-6 lg:px-10 py-8 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Course Revenue (month)"
            value={formatCurrency(summary.courseRevenue)}
            icon={Wallet}
          />
          <StatCard
            label="Donations (month)"
            value={formatCurrency(summary.donationTotal)}
            icon={Gift}
          />
          <StatCard
            label="Specific Puja Revenue"
            value={formatCurrency(summary.pujaRevenue)}
            icon={Flame}
          />
        </div>

        {/* Transactions */}
        <div>
          <PageHeader
            title="Recent Transactions"
            description="Includes subscriptions, free-class donations, and specific puja bookings."
          />

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
              />
              <input
                type="text"
                value={filters.search}
                onChange={setFilter("search")}
                placeholder="Search user or item…"
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-inkSoft hover:border-maroon hover:text-maroon transition-colors"
            >
              <Filter size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-semibold text-ivory bg-maroon rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-inkSoft hover:text-maroon px-2"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-inkSoft block mb-1.5">
                    Payment Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={setFilter("type")}
                    className="w-full bg-ivory border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-maroon"
                  >
                    <option value="">All types</option>
                    <option value="subscription">Subscription</option>
                    <option value="specificPuja">Specific Puja</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-inkSoft block mb-1.5">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={setFilter("status")}
                    className="w-full bg-ivory border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-maroon"
                  >
                    <option value="">All statuses</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-inkSoft block mb-1.5">
                    Method
                  </label>
                  <select
                    value={filters.method}
                    onChange={setFilter("method")}
                    className="w-full bg-ivory border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-maroon"
                  >
                    <option value="">All methods</option>
                    <option value="paypal">PayPal</option>
                    <option value="phonepe">PhonePe</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-inkSoft block mb-1.5">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.from}
                      onChange={setFilter("from")}
                      className="w-full bg-ivory border border-border rounded-lg px-2 py-2 text-xs text-ink outline-none focus:border-maroon"
                    />
                    <span className="text-inkSoft text-xs">to</span>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={setFilter("to")}
                      className="w-full bg-ivory border border-border rounded-lg px-2 py-2 text-xs text-ink outline-none focus:border-maroon"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-inkSoft">
                  {activeFilterCount === 0
                    ? "No transactions found."
                    : "No transactions match your filters."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceMuted transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-border">
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Item</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Method</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                          {tx.user}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {tx.typeLabel}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft min-w-[220px]">
                          {tx.item}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {tx.methodLabel}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusVariant(tx.status)}>
                            {formatStatus(tx.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalCount > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-inkSoft">
              <span>
                Page {page} of {maxPage} · {totalCount} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page >= maxPage}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}