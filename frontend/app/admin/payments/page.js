"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import StatCard from "@/components/admin/StatCard";
import { Wallet, Gift, Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  getPayments,
  getPaymentDonations,
  getPaymentSummary,
} from "@/action/admin";

function formatCurrency(amount) {
  return `৳ ${Number(amount || 0).toLocaleString("en-IN")}`;
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
    case "success":
      return "success";

    case "pending":
      return "warning";

    case "failed":
      return "danger";

    default:
      return "neutral";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({
    courseRevenue: 0,
    donationTotal: 0,
    pujaRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const [paymentsRes, donationsRes, summaryRes] =
        await Promise.all([
          getPayments(),
          getPaymentDonations(),
          getPaymentSummary(),
        ]);

      setPayments(paymentsRes?.data?.payments || []);
      setDonations(donationsRes?.data?.donations || []);

      setSummary({
        courseRevenue: summaryRes?.data?.courseRevenue || 0,
        donationTotal: summaryRes?.data?.donationTotal || 0,
        pujaRevenue: summaryRes?.data?.pujaRevenue || 0,
      });
    } catch (err) {
      console.error("Failed to load payments:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load payment information."
      );

      toast.error(
        err?.response?.data?.message ||
          "Failed to load payment information."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert payments + donations into one transaction list.
   */
  const transactions = useMemo(() => {
    const paymentTransactions = payments.map((payment) => {
      let item = "—";

      if (payment.type === "subscription") {
        item = payment.course?.title || "Course Subscription";
      }

      if (payment.type === "specificPuja") {
        item =
          payment.pujaBooking?.package?.name ||
          "Specific Puja";
      }

      return {
        id: `payment-${payment._id}`,
        user: payment.user?.name || "Unknown User",
        type: formatPaymentType(payment.type),
        item,
        amount: payment.amount || 0,
        method: formatMethod(payment.method),
        date: payment.createdAt,
        status: payment.status,
      };
    });

    const donationTransactions = donations.map((donation) => ({
      id: `donation-${donation._id}`,
      user: donation.user?.name || "Anonymous",
      type: "Donation",
      item: donation.freeClass?.title
        ? `${donation.freeClass.title} (Free Class)`
        : "Free Class Donation",
      amount: donation.amount || 0,
      method: formatMethod(donation.method),
      date: donation.createdAt,
      status: donation.status,
    }));

    return [...paymentTransactions, ...donationTransactions].sort(
      (a, b) =>
        new Date(b.date || 0).getTime() -
        new Date(a.date || 0).getTime()
    );
  }, [payments, donations]);

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

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="text-red-500">{error}</p>

                <button
                  onClick={loadPayments}
                  className="mt-4 px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceMuted transition"
                >
                  Try Again
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-inkSoft">
                  No transactions found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-border">
                      <th className="px-5 py-3 font-medium">
                        User
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Type
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Item
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Amount
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Method
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                          {transaction.user}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {transaction.type}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft min-w-[220px]">
                          {transaction.item}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {formatCurrency(transaction.amount)}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {transaction.method}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {formatDate(transaction.date)}
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge
                            variant={getStatusVariant(
                              transaction.status
                            )}
                          >
                            {formatStatus(transaction.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}