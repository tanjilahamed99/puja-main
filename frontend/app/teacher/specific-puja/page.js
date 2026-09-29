"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  RefreshCw,
  UserRound,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { getMyPujaBookings } from "@/action/teacher";
import Badge from "@/components/admin/Badge";

const statusVariant = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function TeacherSpecificPujaPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await getMyPujaBookings();

      setBookings(data?.bookings || []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load puja bookings";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="space-y-6 px-6 lg:px-10 py-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Specific Puja
            </h1>

            {!loading && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {bookings.length}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            View and manage puja bookings assigned to you.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Card Header */}
        <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Puja Bookings
            </h2>

            <p className="text-sm text-gray-500">
              Bookings assigned to your puja packages
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Puja
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Schedule
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw
                        size={20}
                        className="animate-spin text-gray-400"
                      />

                      <p className="text-sm text-gray-500">
                        Loading puja bookings...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <CalendarDays
                        size={28}
                        className="mb-3 text-gray-300"
                      />

                      <p className="text-sm font-medium text-gray-700">
                        No puja bookings found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        New bookings assigned to you will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Puja */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Video
                            size={17}
                            className="text-gray-600"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {booking.package?.name ||
                              "Unknown Puja"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            Booking #{booking._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <UserRound
                            size={15}
                            className="text-gray-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {booking.user?.name || "Unknown"}
                          </p>

                          {booking.user?.email && (
                            <p className="truncate text-xs text-gray-500">
                              {booking.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="text-sm text-gray-600">
                          {formatDateTime(
                            booking.scheduledDateTime
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.package?.price)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          statusVariant[booking.status] ||
                          "neutral"
                        }
                      >
                        {formatStatus(booking.status)}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/teacher/specific-puja/${booking._id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}