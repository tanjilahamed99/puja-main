"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  CalendarClock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import {
  deletePujaPackage,
  getPujaBookings,
  getPujaPackages,
  updatePujaBooking,
  reschedulePujaBooking,
} from "@/action/admin";
import ConfirmPujaBookingModal from "@/components/admin/ConfirmPujaBookingModal";

/* ------------------------------ helpers ------------------------------ */

function formatPrice(price) {
  return `৳${Number(price || 0).toLocaleString("en-IN")}`;
}

function formatDateTime(date) {
  if (!date) return "Not scheduled";
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(minutes) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const packageStatusVariant = (status) =>
  ({ active: "success", draft: "neutral", archived: "warning" })[status] ||
  "neutral";

const bookingStatusVariant = (status) =>
  ({
    confirmed: "success",
    completed: "success",
    pending: "warning",
    cancelled: "danger",
  })[status] || "neutral";

/* ------------------------------ component ------------------------------ */

export default function SpecificPujaPage() {
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // modal state
  const [modalBooking, setModalBooking] = useState(null); // booking being confirmed
  const [modalMode, setModalMode] = useState("confirm"); // 'confirm' | 'reschedule'

  useEffect(() => {
    loadPackages();
    loadBookings();
  }, []);

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const res = await getPujaPackages();
      setPackages(res.data?.packages || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load puja packages",
      );
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await getPujaBookings();
      setBookings(res.data?.bookings || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this puja package?"))
      return;
    try {
      setDeletingId(id);
      await deletePujaPackage(id);
      setPackages((prev) => prev.filter((item) => item._id !== id));
      toast.success("Puja package deleted successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete puja package",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const replaceBooking = (updated) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? { ...b, ...updated } : b)),
    );
  };

  const handleBookingStatus = async (id, status) => {
    // Guard: cannot confirm without a datetime — use modal instead
    if (status === "confirmed") {
      const booking = bookings.find((b) => b._id === id);
      setModalMode("confirm");
      setModalBooking(booking);
      return;
    }

    try {
      setUpdatingBookingId(id);
      const res = await updatePujaBooking(id, { status });
      replaceBooking(res.data?.booking || { _id: id, status });
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update booking");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleRescheduleClick = (booking) => {
    setModalMode("reschedule");
    setModalBooking(booking);
  };

  const handleModalSaved = (updatedBooking) => {
    if (updatedBooking) {
      replaceBooking(updatedBooking);
    } else {
      loadBookings();
    }
    setModalBooking(null);
  };

  return (
    <>
      <Topbar
        title="Specific Puja"
        subtitle="One-on-one paid puja sessions booked by individual users"
      />

      <main className="px-6 lg:px-10 py-8 space-y-10">
        {/* ---------------- Packages ---------------- */}
        <section>
          <PageHeader
            title="Puja Packages"
            description="Each package is a private session for a single paying participant."
            actionLabel="Add Package"
            actionHref="/admin/specific-puja/new"
          />

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Teacher / Priest</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Fields</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPackages ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-inkSoft">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          Loading packages...
                        </div>
                      </td>
                    </tr>
                  ) : packages.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-inkSoft">
                        No puja packages found.
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr
                        key={pkg._id}
                        className="border-b border-border last:border-0">
                        <td className="px-5 py-3.5">
                          <div className="font-medium">{pkg.name}</div>
                          {pkg.description && (
                            <div className="text-xs text-inkSoft mt-1 max-w-xs truncate">
                              {pkg.description}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {pkg.teacher?.name || "Not assigned"}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatPrice(pkg.price)}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatDuration(pkg.durationMinutes)}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {pkg.requiredInfoFields?.length || 0}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={packageStatusVariant(pkg.status)}>
                            {formatStatus(pkg.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end items-center gap-2">
                            <Link
                              href={`/admin/specific-puja/${pkg._id}/edit`}
                              className="p-2 rounded-lg hover:bg-muted transition"
                              title="Edit package">
                              <Pencil size={17} className="text-inkSoft" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg._id)}
                              disabled={deletingId === pkg._id}
                              className="p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                              title="Delete package">
                              {deletingId === pkg._id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin text-red-500"
                                />
                              ) : (
                                <Trash2 size={17} className="text-red-500" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------------- Bookings ---------------- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">
                Recent Bookings
              </h3>
              <p className="text-sm text-inkSoft mt-1">
                Confirm the requested time or reschedule already-confirmed
                sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={loadBookings}
              className="inline-flex items-center gap-2 text-xs text-inkSoft hover:text-maroon">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Requested</th>
                    <th className="px-5 py-3 font-medium">Confirmed</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-inkSoft">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          Loading bookings...
                        </div>
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-inkSoft">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => {
                      const requestedTime =
                        booking.proposedDateTime || booking.scheduledDateTime;
                      const confirmedTime =
                        booking.confirmedDateTime ||
                        (booking.status === "confirmed"
                          ? booking.scheduledDateTime
                          : null);

                      return (
                        <tr
                          key={booking._id}
                          className="border-b border-border last:border-0">
                          <td className="px-5 py-3.5">
                            <div className="font-medium">
                              {booking.user?.name || "Unknown user"}
                            </div>
                            {booking.user?.email && (
                              <div className="text-xs text-inkSoft mt-1">
                                {booking.user.email}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-inkSoft">
                            {booking.package?.name || "Deleted package"}
                            <div className="text-xs mt-0.5">
                              {formatPrice(booking.package?.price)}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                            {formatDateTime(requestedTime)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {confirmedTime ? (
                              <span className="text-ink font-medium">
                                {formatDateTime(confirmedTime)}
                              </span>
                            ) : (
                              <span className="text-inkSoft">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-inkSoft">
                            {formatDuration(
                              booking.durationMinutes ||
                                booking.package?.durationMinutes,
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={bookingStatusVariant(booking.status)}>
                              {formatStatus(booking.status)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              {booking.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={updatingBookingId === booking._id}
                                    onClick={() =>
                                      handleBookingStatus(
                                        booking._id,
                                        "confirmed",
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50">
                                    <CalendarClock size={14} />
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updatingBookingId === booking._id}
                                    onClick={() =>
                                      handleBookingStatus(
                                        booking._id,
                                        "cancelled",
                                      )
                                    }
                                    className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                                    Cancel
                                  </button>
                                </>
                              )}

                              {booking.status === "confirmed" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRescheduleClick(booking)
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface border border-border hover:bg-muted">
                                    <RefreshCw size={14} />
                                    Reschedule
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updatingBookingId === booking._id}
                                    onClick={() =>
                                      handleBookingStatus(
                                        booking._id,
                                        "completed",
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface border border-border hover:bg-muted disabled:opacity-50">
                                    <CalendarClock size={14} />
                                    Complete
                                  </button>
                                </>
                              )}

                              {booking.status === "completed" && (
                                <span className="text-xs text-inkSoft">
                                  Completed
                                </span>
                              )}
                              {booking.status === "cancelled" && (
                                <span className="text-xs text-red-500">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Confirm / Reschedule modal */}
      <ConfirmPujaBookingModal
        booking={modalBooking}
        mode={modalMode}
        onClose={() => setModalBooking(null)}
        onSaved={handleModalSaved}
        rescheduleFn={reschedulePujaBooking}
      />
    </>
  );
}
