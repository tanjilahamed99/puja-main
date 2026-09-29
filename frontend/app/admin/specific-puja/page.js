"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { deletePujaPackage, getPujaBookings, getPujaPackages, updatePujaBooking } from "@/action/admin";


export default function SpecificPujaPage() {
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

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
      console.error("Failed to load packages:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load puja packages"
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
      console.error("Failed to load bookings:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDeletePackage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this puja package?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deletePujaPackage(id);

      setPackages((prev) =>
        prev.filter((item) => item._id !== id)
      );

      toast.success("Puja package deleted successfully");
    } catch (error) {
      console.error("Delete package error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete puja package"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleBookingStatus = async (id, status) => {
    try {
      setUpdatingBookingId(id);

      const res = await updatePujaBooking(id, {
        status,
      });

      const updatedBooking = res.data?.booking;

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                ...updatedBooking,
              }
            : booking
        )
      );

      toast.success(
        `Booking ${status} successfully`
      );
    } catch (error) {
      console.error("Booking update error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update booking"
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const formatPrice = (price) => {
    return `৳${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const formatDateTime = (date) => {
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
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const packageStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "success";

      case "draft":
        return "neutral";

      case "archived":
        return "warning";

      default:
        return "neutral";
    }
  };

  const bookingStatusVariant = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "success";

      case "pending":
        return "warning";

      case "cancelled":
        return "danger";

      default:
        return "neutral";
    }
  };

  return (
    <>
      <Topbar
        title="Specific Puja"
        subtitle="One-on-one paid puja sessions booked by individual users"
      />

      <main className="px-6 lg:px-10 py-8 space-y-10">
        {/* Packages */}
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
                    <th className="px-5 py-3 font-medium">
                      Package
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Teacher / Priest
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Price
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Required Fields
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loadingPackages ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-inkSoft"
                      >
                        <div className="flex justify-center items-center gap-2">
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Loading packages...
                        </div>
                      </td>
                    </tr>
                  ) : packages.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-inkSoft"
                      >
                        No puja packages found.
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr
                        key={pkg._id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium">
                            {pkg.name}
                          </div>

                          {pkg.description && (
                            <div className="text-xs text-inkSoft mt-1 max-w-xs truncate">
                              {pkg.description}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft">
                          {pkg.teacher?.name ||
                            "Not assigned"}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatPrice(pkg.price)}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft">
                          {pkg.requiredInfoFields?.length ||
                            0}
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge
                            variant={packageStatusVariant(
                              pkg.status
                            )}
                          >
                            {formatStatus(pkg.status)}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex justify-end items-center gap-2">
                            <Link
                              href={`/admin/specific-puja/${pkg._id}/edit`}
                              className="p-2 rounded-lg hover:bg-muted transition"
                              title="Edit package"
                            >
                              <Pencil
                                size={17}
                                className="text-inkSoft"
                              />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePackage(
                                  pkg._id
                                )
                              }
                              disabled={
                                deletingId === pkg._id
                              }
                              className="p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                              title="Delete package"
                            >
                              {deletingId === pkg._id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin text-red-500"
                                />
                              ) : (
                                <Trash2
                                  size={17}
                                  className="text-red-500"
                                />
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

        {/* Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">
                Recent Bookings
              </h3>

              <p className="text-sm text-inkSoft mt-1">
                Manage private puja bookings and their
                scheduled sessions.
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">
                      User
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Package
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Price
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Scheduled
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loadingBookings ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-inkSoft"
                      >
                        <div className="flex justify-center items-center gap-2">
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Loading bookings...
                        </div>
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-inkSoft"
                      >
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium">
                            {booking.user?.name ||
                              "Unknown user"}
                          </div>

                          {booking.user?.email && (
                            <div className="text-xs text-inkSoft mt-1">
                              {booking.user.email}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft">
                          {booking.package?.name ||
                            "Deleted package"}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatPrice(
                            booking.package?.price
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {formatDateTime(
                            booking.scheduledDateTime
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge
                            variant={bookingStatusVariant(
                              booking.status
                            )}
                          >
                            {formatStatus(
                              booking.status
                            )}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    updatingBookingId ===
                                    booking._id
                                  }
                                  onClick={() =>
                                    handleBookingStatus(
                                      booking._id,
                                      "confirmed"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
                                >
                                  {updatingBookingId ===
                                  booking._id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : null}
                                  Confirm
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    updatingBookingId ===
                                    booking._id
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
                              </>
                            )}

                            {booking.status ===
                              "confirmed" && (
                              <button
                                type="button"
                                disabled={
                                  updatingBookingId ===
                                  booking._id
                                }
                                onClick={() =>
                                  handleBookingStatus(
                                    booking._id,
                                    "completed"
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface border border-border hover:bg-muted disabled:opacity-50"
                              >
                                <CalendarClock
                                  size={14}
                                />
                                Complete
                              </button>
                            )}

                            {booking.status ===
                              "completed" && (
                              <span className="text-xs text-inkSoft">
                                Completed
                              </span>
                            )}

                            {booking.status ===
                              "cancelled" && (
                              <span className="text-xs text-red-500">
                                Cancelled
                              </span>
                            )}
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
      </main>
    </>
  );
}