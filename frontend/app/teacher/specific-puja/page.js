"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  Flame,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import Badge from "@/components/admin/Badge";
import { getMyPujaPackages, getMyPujaBookings } from "@/action/teacher";

const PAGE_LIMIT = 20;

const statusVariant = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
  draft: "neutral",
  active: "success",
  archived: "warning",
};

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDuration = (minutes) => {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

/* ───────────── reusable pagination bar ───────────── */

function Pagination({ page, maxPage, total, onChange }) {
  if (!total) return null;
  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-inkSoft">
      <span>
        Page {page} of {maxPage} · {total} total
      </span>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors">
          <ChevronLeft size={14} />
          Prev
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(maxPage, page + 1))}
          disabled={page >= maxPage}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors">
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ───────────── PACKAGES SECTION ───────────── */

function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const reqRef = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, status]);

  useEffect(() => {
    const reqId = ++reqRef.current;
    (async () => {
      try {
        setLoading(true);
        const { data } = await getMyPujaPackages({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: status || undefined,
        });
        if (reqId !== reqRef.current) return;
        setPackages(data?.items || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        toast.error(
          err?.response?.data?.message || "Failed to load puja packages",
        );
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [page, debouncedSearch, status]);

  const maxPage = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">My Puja Packages</h2>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {total}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-inkSoft">
            Packages assigned to you — bookings from these will appear below.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages by name…"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-maroon sm:w-44">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {loading ? (
          <div className="py-12 text-center text-inkSoft">
            <Loader2 className="mx-auto animate-spin" size={20} />
          </div>
        ) : packages.length === 0 ? (
          <div className="py-12 text-center text-inkSoft">
            {search || status
              ? "No packages match your filters."
              : "No packages have been assigned to you yet."}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {packages.map((pkg) => (
                <div key={pkg._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">
                        {pkg.name}
                      </p>
                      {pkg.description && (
                        <p className="mt-0.5 text-xs text-inkSoft line-clamp-2">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={statusVariant[pkg.status] || "neutral"}>
                      {formatStatus(pkg.status)}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-xs">
                    <div>
                      <dt className="text-inkSoft">Price</dt>
                      <dd className="text-ink mt-0.5">
                        {formatCurrency(pkg.price)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-inkSoft">Duration</dt>
                      <dd className="text-ink mt-0.5">
                        {formatDuration(pkg.durationMinutes)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-inkSoft">Required info</dt>
                      <dd className="text-ink mt-0.5">
                        {pkg.requiredInfoFields?.length
                          ? pkg.requiredInfoFields.join(", ")
                          : "None"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-inkSoft">
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Fields</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr
                      key={pkg._id}
                      className="border-b border-border last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink">{pkg.name}</div>
                        {pkg.description && (
                          <div className="mt-0.5 max-w-xs truncate text-xs text-inkSoft">
                            {pkg.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-inkSoft">
                        {formatCurrency(pkg.price)}
                      </td>
                      <td className="px-5 py-3.5 text-inkSoft">
                        {formatDuration(pkg.durationMinutes)}
                      </td>
                      <td className="px-5 py-3.5 text-inkSoft">
                        {pkg.requiredInfoFields?.length || 0}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant[pkg.status] || "neutral"}>
                          {formatStatus(pkg.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Pagination
        page={page}
        maxPage={maxPage}
        total={total}
        onChange={setPage}
      />
    </section>
  );
}

/* ───────────── BOOKINGS SECTION ───────────── */

function BookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const reqRef = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, status]);

  useEffect(() => {
    const reqId = ++reqRef.current;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getMyPujaBookings({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: status || undefined,
        });
        if (reqId !== reqRef.current) return;
        setBookings(data?.items || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load puja bookings";
        setError(msg);
        toast.error(msg);
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [page, debouncedSearch, status]);

  const reload = () => {
    const reqId = ++reqRef.current;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getMyPujaBookings({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: status || undefined,
        });
        if (reqId !== reqRef.current) return;
        setBookings(data?.items || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        setError(
          err?.response?.data?.message || "Failed to load puja bookings",
        );
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">Puja Bookings</h2>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {total}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-inkSoft">
            Bookings assigned to your puja packages.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink transition hover:bg-muted disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or email…"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-maroon sm:w-44">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {loading ? (
          <div className="py-14 text-center text-inkSoft">
            <Loader2 className="mx-auto animate-spin" size={20} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-14 text-center text-inkSoft">
            {search || status
              ? "No bookings match your filters."
              : "No puja bookings found."}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {bookings.map((b) => (
                <div key={b._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">
                        {b.package?.name || "Unknown Puja"}
                      </p>
                      <p className="text-xs text-inkSoft">
                        Booking #{b._id.slice(-6)}
                      </p>
                    </div>
                    <Badge variant={statusVariant[b.status] || "neutral"}>
                      {formatStatus(b.status)}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-xs">
                    <div className="col-span-2">
                      <dt className="text-inkSoft">Customer</dt>
                      <dd className="text-ink mt-0.5 truncate">
                        {b.user?.name || "Unknown"}
                        {b.user?.email && (
                          <span className="text-inkSoft">
                            {" "}
                            · {b.user.email}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-inkSoft">Schedule</dt>
                      <dd className="text-ink mt-0.5">
                        {formatDateTime(b.scheduledDateTime)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-inkSoft">Amount</dt>
                      <dd className="text-ink mt-0.5">
                        {formatCurrency(b.package?.price)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/teacher/specific-puja/${b._id}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink">
                    <Eye size={15} />
                    View
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-inkSoft">
                    <th className="px-5 py-3 font-medium">Puja</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Schedule</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b._id}
                      className="border-b border-border last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-maroon/5">
                            <Video size={17} className="text-maroon" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">
                              {b.package?.name || "Unknown Puja"}
                            </p>
                            <p className="text-xs text-inkSoft">
                              #{b._id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <UserRound size={15} className="text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">
                              {b.user?.name || "Unknown"}
                            </p>
                            {b.user?.email && (
                              <p className="text-xs text-inkSoft truncate">
                                {b.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-inkSoft">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={15} className="text-inkSoft" />
                          {formatDateTime(b.scheduledDateTime)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink">
                        {formatCurrency(b.package?.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant[b.status] || "neutral"}>
                          {formatStatus(b.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/teacher/specific-puja/${b._id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-muted">
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Pagination
        page={page}
        maxPage={maxPage}
        total={total}
        onChange={setPage}
      />
    </section>
  );
}

/* ───────────── PAGE ───────────── */

export default function TeacherSpecificPujaPage() {
  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <header>
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-maroon" />
          <h1 className="text-2xl font-semibold text-ink">Specific Puja</h1>
        </div>
        <p className="mt-1 text-sm text-inkSoft">
          Your assigned packages and the bookings customers placed on them.
        </p>
      </header>

      <PackagesSection />
      <BookingsSection />
    </div>
  );
}
