"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import {
  getPujaBookings,
  updatePujaBooking,
  reschedulePujaBooking,
} from "@/action/admin";
import ConfirmPujaBookingModal from "@/components/admin/ConfirmPujaBookingModal";
import {
  formatPrice,
  formatDateTime,
  formatDuration,
  formatStatus,
  bookingStatusVariant,
} from "@/lib/pujaHelpers";

const PAGE_LIMIT = 20;

export default function PujaBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  // Reschedule-only modal
  const [modalBooking, setModalBooking] = useState(null);

  const reqRef = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  useEffect(() => {
    const reqId = ++reqRef.current;
    (async () => {
      try {
        setLoading(true);
        const { data } = await getPujaBookings({
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
        toast.error(
          err?.response?.data?.message || "Failed to load bookings"
        );
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [page, debouncedSearch, status]);

  const reload = async () => {
    try {
      setLoading(true);
      const { data } = await getPujaBookings({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch || undefined,
        status: status || undefined,
      });
      setBookings(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  const replaceBooking = (updated) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? { ...b, ...updated } : b))
    );
  };

  /* Admin can only: cancel (pending) or mark completed (confirmed).
     Confirm is intentionally blocked — the priest/teacher confirms. */
  const handleBookingStatus = async (id, nextStatus) => {
    if (nextStatus === "confirmed") {
      toast.error(
        "Only the assigned priest/teacher can confirm this booking."
      );
      return;
    }

    try {
      setUpdatingBookingId(id);
      const res = await updatePujaBooking(id, { status: nextStatus });
      replaceBooking(res.data?.booking || { _id: id, status: nextStatus });
      toast.success(`Booking ${nextStatus} successfully`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update booking"
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleRescheduleClick = (booking) => {
    setModalBooking(booking);
  };

  const handleModalSaved = (updatedBooking) => {
    if (updatedBooking) replaceBooking(updatedBooking);
    else reload();
    setModalBooking(null);
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <>
      <Topbar
        title="Puja Bookings"
        subtitle="Confirmed by the assigned priest/teacher — you can reschedule or manage status"
      />

      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Recent Bookings"
          description="Priests confirm bookings. Admins can reschedule confirmed sessions or mark them completed."
        />

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email…"
              className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-2 text-xs text-inkSoft hover:text-maroon px-2"
          >
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-inkSoft"
                    >
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
                      className="px-5 py-12 text-center text-inkSoft"
                    >
                      {search || status
                        ? "No bookings match your filters."
                        : "No bookings found."}
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
                        className="border-b border-border last:border-0"
                      >
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
                              booking.package?.durationMinutes
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={bookingStatusVariant(booking.status)}
                          >
                            {formatStatus(booking.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {/* Pending → admin can only Cancel (priest confirms) */}
                            {booking.status === "pending" && (
                              <button
                                type="button"
                                disabled={
                                  updatingBookingId === booking._id
                                }
                                onClick={() =>
                                  handleBookingStatus(
                                    booking._id,
                                    "cancelled"
                                  )
                                }
                                className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}

                            {/* Confirmed → admin can reschedule or complete */}
                            {booking.status === "confirmed" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRescheduleClick(booking)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface border border-border hover:bg-muted"
                                >
                                  <RefreshCw size={14} />
                                  Reschedule
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    updatingBookingId === booking._id
                                  }
                                  onClick={() =>
                                    handleBookingStatus(
                                      booking._id,
                                      "completed"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface border border-border hover:bg-muted disabled:opacity-50"
                                >
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

        {!loading && total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-inkSoft">
            <span>
              Page {page} of {maxPage} · {total} total
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
      </main>

      {/* Reschedule-only modal */}
      <ConfirmPujaBookingModal
        booking={modalBooking}
        mode="reschedule"
        onClose={() => setModalBooking(null)}
        onSaved={handleModalSaved}
        rescheduleFn={reschedulePujaBooking}
      />
    </>
  );
}