"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  UserRound,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import {
  getMyPujaBooking,
  completePujaBooking,
} from "@/action/teacher";

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

const formatFullDateTime = (value) => {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Dhaka",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
  }).format(new Date(value));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatFieldName = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
};

export default function TeacherSpecificPujaDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const loadBooking = async () => {
    try {
      setLoading(true);

      const { data } = await getMyPujaBooking(params.id);

      setBooking(data?.booking || null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load booking";

      toast.error(message);

      router.push("/teacher/specific-puja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      loadBooking();
    }
  }, [params?.id]);

  const handleComplete = async () => {
    if (!booking || completing) return;

    const confirmed = window.confirm(
      "Are you sure you want to mark this puja as completed?"
    );

    if (!confirmed) return;

    try {
      setCompleting(true);

      const { data } = await completePujaBooking(
        booking._id
      );

      setBooking(data?.booking || booking);

      toast.success("Puja booking completed successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to complete puja"
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-7 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-52 animate-pulse rounded-xl border border-gray-200 bg-white" />
          <div className="h-52 animate-pulse rounded-xl border border-gray-200 bg-white" />
        </div>

        <div className="h-44 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-14 text-center">
        <p className="text-sm font-medium text-gray-700">
          Booking not found
        </p>

        <Link
          href="/teacher/specific-puja"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={15} />
          Back to bookings
        </Link>
      </div>
    );
  }

  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="space-y-6 px-6 lg:px-10 py-8">
      {/* Page Header */}
      <div>
        <Link
          href="/teacher/specific-puja"
          className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={15} />
          Back to Specific Puja
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {booking.package?.name || "Specific Puja"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Booking #{booking._id.slice(-8)}
            </p>
          </div>

          <Badge
            variant={
              statusVariant[booking.status] || "neutral"
            }
          >
            {formatStatus(booking.status)}
          </Badge>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Customer Card */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Customer
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              Customer information for this booking
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <UserRound
                  size={17}
                  className="text-gray-600"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Customer Name
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {booking.user?.name || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Mail
                  size={17}
                  className="text-gray-600"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-gray-900">
                  {booking.user?.email || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Package Card */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Puja Package
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              Package selected by the customer
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <p className="text-xs text-gray-500">
                Package Name
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {booking.package?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Package Price
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatCurrency(booking.package?.price)}
              </p>
            </div>

            {booking.package?.description && (
              <div>
                <p className="text-xs text-gray-500">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {booking.package.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Schedule
          </h2>

          <p className="mt-0.5 text-sm text-gray-500">
            Date and time for the puja session
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <CalendarDays
                size={17}
                className="text-gray-600"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Scheduled Date & Time
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatFullDateTime(
                  booking.scheduledDateTime
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Clock3
                size={17}
                className="text-gray-600"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Booking Created
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(booking.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Information */}
      {booking.participantInfo &&
        Object.keys(booking.participantInfo).length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Participant Information
              </h2>

              <p className="mt-0.5 text-sm text-gray-500">
                Information provided during booking
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(
                booking.participantInfo
              ).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-gray-500">
                    {formatFieldName(key)}
                  </p>

                  <p className="mt-1 break-words text-sm font-medium text-gray-900">
                    {String(value || "—")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Live Session */}
      {booking.liveKitRoomId && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Live Puja Session
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              LiveKit session information for this booking
            </p>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Video
                    size={18}
                    className="text-gray-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    LiveKit Room Ready
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-gray-500">
                    {booking.liveKitRoomId}
                  </p>
                </div>
              </div>

              {booking.status === "confirmed" && (
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Connect this button to your LiveKit teacher room."
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Video size={16} />
                  Start Puja
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      {!isCompleted && !isCancelled && (
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/teacher/specific-puja"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={15} />
            Back to Bookings
          </Link>

          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={16} />

            {completing
              ? "Completing..."
              : "Mark as Completed"}
          </button>
        </div>
      )}

      {/* Completed footer */}
      {isCompleted && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-5">
          <Link
            href="/teacher/specific-puja"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={15} />
            Back to Bookings
          </Link>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <CheckCircle2
              size={17}
              className="text-green-600"
            />
            Puja Completed
          </div>
        </div>
      )}
    </div>
  );
}