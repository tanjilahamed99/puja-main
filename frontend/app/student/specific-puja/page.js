"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { browsePujaPackages, bookPujaPackage, getMyPujaBookings } from "@/action/student";

function formatPrice(price) {
  if (price === undefined || price === null) return "—";
  return `৳${Number(price).toLocaleString("en-IN")}`;
}

function formatScheduled(dateTime) {
  if (!dateTime) return "To be scheduled";
  return new Date(dateTime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const badgeVariant = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
};

const statusLabel = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function SpecificPujaPage() {
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [openForm, setOpenForm] = useState(null);
  const [method, setMethod] = useState("phonepe");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadBookings = async () => {
    const { data } = await getMyPujaBookings();
    setBookings(data.bookings || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [packagesRes] = await Promise.all([browsePujaPackages(), loadBookings()]);
        setPackages(packagesRes.data.packages || []);
      } catch (err) {
        setLoadError(
          err?.response?.data?.message || "Could not load specific puja packages. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openBookingForm = (pkg) => {
    setFormError("");
    setMethod("phonepe");
    setOpenForm(openForm === pkg._id ? null : pkg._id);
  };

  const handleBook = async (e, pkg) => {
    e.preventDefault();
    setFormError("");

    const form = new FormData(e.target);
    const participantInfo = {};
    pkg.requiredInfoFields.forEach((field) => {
      participantInfo[field] = form.get(field);
    });

    setSubmitting(true);
    try {
      const { data } = await bookPujaPackage(pkg._id, { method, participantInfo });
      if (!data.booking) {
        setFormError(data.message || "Could not book this puja. Please try again.");
        return;
      }
      await loadBookings();
      setOpenForm(null);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || "Could not book this puja. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Specific Puja" subtitle="A private, one-on-one puja booked just for you" />
      <main className="px-6 lg:px-10 py-8 space-y-10">
        <div>
          <PageHeader
            title="Available Puja Packages"
            description="After payment, this is scheduled individually and conducted in a private session for you."
          />

          {loading && <p className="text-sm text-inkSoft">Loading packages…</p>}
          {!loading && loadError && <p className="text-sm text-danger">{loadError}</p>}
          {!loading && !loadError && packages.length === 0 && (
            <p className="text-sm text-inkSoft">No puja packages are available right now.</p>
          )}

          {!loading && !loadError && packages.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-5">
              {packages.map((pkg) => (
                <div key={pkg._id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
                  <h3 className="font-display text-lg font-semibold">{pkg.name}</h3>
                  <p className="text-sm text-inkSoft">{pkg.teacher?.name || "Teacher TBD"}</p>
                  <p className="text-sm text-inkSoft">{pkg.description}</p>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{formatPrice(pkg.price)}</span>
                    <button
                      type="button"
                      onClick={() => openBookingForm(pkg)}
                      className="bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {openForm === pkg._id ? "Cancel" : "Book This Puja"}
                    </button>
                  </div>

                  {openForm === pkg._id && (
                    <form onSubmit={(e) => handleBook(e, pkg)} className="pt-3 border-t border-border space-y-3">
                      {(pkg.requiredInfoFields || []).map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-inkSoft mb-1">{field}</label>
                          <input name={field} type="text" required className="input" />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-medium text-inkSoft mb-1">Payment method</label>
                        <select
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                          className="input"
                        >
                          <option value="phonepe">PhonePe</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>

                      {formError && <p className="text-sm text-danger">{formError}</p>}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-maroon text-ivory px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                      >
                        {submitting ? "Processing…" : `Confirm & Pay ${formatPrice(pkg.price)}`}
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-4">My Bookings</h3>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Scheduled</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && bookings.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-inkSoft">
                        You haven&apos;t booked a specific puja yet.
                      </td>
                    </tr>
                  )}
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{b.package?.name || "Package removed"}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{formatScheduled(b.scheduledDateTime)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={badgeVariant[b.status] || "neutral"}>
                          {statusLabel[b.status] || b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}