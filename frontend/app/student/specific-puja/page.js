"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import JoinPujaButton from "@/components/JoinPujaButton";
import {
  browsePujaPackages,
  bookPujaPackage,
  getMyPujaBookings,
  getPujaPackageSlots,
  getPujaBookingLiveKitToken,
} from "@/action/student";

/* ------------------------------ helpers ------------------------------ */

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

function formatDuration(minutes) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function groupSlotsByDay(slots) {
  const map = new Map();
  for (const iso of slots) {
    const d = new Date(iso);
    const key = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(iso);
  }
  return Array.from(map.entries()).map(([day, times]) => ({ day, times }));
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

/* ------------------------------ component ------------------------------ */

export default function SpecificPujaPage() {
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // form state
  const [openForm, setOpenForm] = useState(null);
  const [method, setMethod] = useState("phonepe");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // per-package slot state
  const [slots, setSlots] = useState({});
  const [slotsLoading, setSlotsLoading] = useState({});
  const [slotsError, setSlotsError] = useState({});
  const [selectedSlot, setSelectedSlot] = useState({});
  const [customMode, setCustomMode] = useState({});
  const [selectedDay, setSelectedDay] = useState({});

  /* --------------------------- data loading --------------------------- */

  const loadBookings = async () => {
    const { data } = await getMyPujaBookings();
    setBookings(data.bookings || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [packagesRes] = await Promise.all([
          browsePujaPackages(),
          loadBookings(),
        ]);
        setPackages(packagesRes.data.packages || []);
      } catch (err) {
        setLoadError(
          err?.response?.data?.message ||
            "Could not load specific puja packages. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* --------------------------- slot loading --------------------------- */

  const fetchSlots = async (pkgId) => {
    setSlotsLoading((s) => ({ ...s, [pkgId]: true }));
    setSlotsError((s) => ({ ...s, [pkgId]: "" }));
    try {
      const { data } = await getPujaPackageSlots(pkgId);
      setSlots((s) => ({ ...s, [pkgId]: data.slots || [] }));
    } catch (err) {
      setSlots((s) => ({ ...s, [pkgId]: [] }));
      setSlotsError((s) => ({
        ...s,
        [pkgId]:
          err?.response?.data?.message ||
          "Could not load available slots. You can still pick a custom time.",
      }));
    } finally {
      setSlotsLoading((s) => ({ ...s, [pkgId]: false }));
    }
  };

  const openBookingForm = async (pkg) => {
    setFormError("");
    setMethod("phonepe");
    const next = openForm === pkg._id ? null : pkg._id;
    setOpenForm(next);

    if (next && !slots[pkg._id] && !slotsLoading[pkg._id]) {
      await fetchSlots(pkg._id);
    }
  };

  /* ------------------------------ booking ------------------------------ */

  const handleBook = async (e, pkg) => {
    e.preventDefault();
    setFormError("");

    const form = new FormData(e.target);
    const participantInfo = {};
    (pkg.requiredInfoFields || []).forEach((field) => {
      participantInfo[field] = form.get(field);
    });

    const preferredDateTime = customMode[pkg._id]
      ? form.get("customDateTime")
      : selectedSlot[pkg._id];

    if (!preferredDateTime) {
      setFormError("Please choose a date and time for your puja.");
      return;
    }

    setSubmitting(true);
    try {
      const iso = new Date(preferredDateTime).toISOString();
      const { data } = await bookPujaPackage(pkg._id, {
        method,
        participantInfo,
        preferredDateTime: iso,
      });

      if (!data.booking) {
        setFormError(
          data.message || "Could not book this puja. Please try again."
        );
        return;
      }

      await loadBookings();
      setOpenForm(null);
      setSelectedSlot((s) => ({ ...s, [pkg._id]: null }));
      setCustomMode((c) => ({ ...c, [pkg._id]: false }));
      setSelectedDay((d) => ({ ...d, [pkg._id]: null }));
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          "Could not book this puja. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------- render: slots --------------------------- */

  const renderSlotPicker = (pkg) => {
    const isLoading = slotsLoading[pkg._id];
    const err = slotsError[pkg._id];
    const list = slots[pkg._id] || [];
    const grouped = groupSlotsByDay(list);
    const isCustom = !!customMode[pkg._id];

    const activeDay =
      selectedDay[pkg._id] || (grouped[0] ? grouped[0].day : null);

    const activeDaySlots =
      grouped.find((g) => g.day === activeDay)?.times || [];

    return (
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-inkSoft">
            Choose a date &amp; time
          </p>
          {pkg.durationMinutes && (
            <span className="text-[11px] text-inkSoft">
              ~{formatDuration(pkg.durationMinutes)}
            </span>
          )}
        </div>

        {isLoading && (
          <p className="text-xs text-inkSoft">Loading available slots…</p>
        )}

        {!isLoading && err && (
          <p className="text-xs text-danger">
            {err}{" "}
            <button
              type="button"
              onClick={() => fetchSlots(pkg._id)}
              className="underline"
            >
              Retry
            </button>
          </p>
        )}

        {!isLoading && !isCustom && grouped.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {grouped.map(({ day }) => {
                const active = day === activeDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setSelectedDay((d) => ({ ...d, [pkg._id]: day }))
                    }
                    className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "bg-maroon text-ivory border-maroon"
                        : "bg-surface border-border hover:border-maroon"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {activeDaySlots.map((iso) => {
                const dt = new Date(iso);
                const active = selectedSlot[pkg._id] === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() =>
                      setSelectedSlot((s) => ({ ...s, [pkg._id]: iso }))
                    }
                    className={`text-xs px-2 py-2 rounded-lg border transition ${
                      active
                        ? "bg-maroon text-ivory border-maroon"
                        : "bg-surface border-border hover:border-maroon"
                    }`}
                  >
                    {dt.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {!isLoading && !isCustom && grouped.length === 0 && !err && (
          <p className="text-xs text-inkSoft">
            No preset slots available. Pick a custom time below.
          </p>
        )}

        <label className="flex items-center gap-2 text-xs text-inkSoft cursor-pointer">
          <input
            type="checkbox"
            checked={isCustom}
            onChange={(e) => {
              const on = e.target.checked;
              setCustomMode((c) => ({ ...c, [pkg._id]: on }));
              if (on) {
                setSelectedSlot((s) => ({ ...s, [pkg._id]: null }));
              }
            }}
          />
          Pick a custom date &amp; time instead
        </label>

        {isCustom && (
          <input
            type="datetime-local"
            name="customDateTime"
            required
            className="input"
            min={toLocalInputValue(
              new Date(
                Date.now() + (pkg.minLeadTimeHours ?? 24) * 3600 * 1000
              )
            )}
            max={toLocalInputValue(
              new Date(
                Date.now() + (pkg.maxLeadTimeDays ?? 60) * 24 * 3600 * 1000
              )
            )}
          />
        )}

        {pkg.timezone && (
          <p className="text-[11px] text-inkSoft">
            Times shown in your local timezone ({pkg.timezone} for the priest).
          </p>
        )}
      </div>
    );
  };

  /* --------------------------- render: bookings --------------------------- */

  const renderBookings = () => {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-inkSoft border-b border-border">
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Scheduled</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Session</th>
              </tr>
            </thead>
            <tbody>
              {!loading && bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-inkSoft"
                  >
                    You haven&apos;t booked a specific puja yet.
                  </td>
                </tr>
              )}
              {bookings.map((b) => {
                const proposed =
                  b.proposedDateTime || b.scheduledDateTime || null;
                const canShowJoin =
                  b.status === "confirmed" &&
                  b.liveKitRoomId &&
                  b.joinability;

                return (
                  <tr
                    key={b._id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {b.package?.name || "Package removed"}
                    </td>
                    <td className="px-5 py-3.5 text-inkSoft">
                      {b.status === "pending" ? (
                        <span>
                          Requested:{" "}
                          <span className="text-ink">
                            {formatScheduled(proposed)}
                          </span>
                        </span>
                      ) : b.status === "cancelled" ? (
                        <span className="line-through">
                          {formatScheduled(
                            b.confirmedDateTime || proposed
                          )}
                        </span>
                      ) : (
                        formatScheduled(
                          b.confirmedDateTime || b.scheduledDateTime
                        )
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-inkSoft">
                      {formatDuration(b.durationMinutes)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={badgeVariant[b.status] || "neutral"}>
                        {statusLabel[b.status] || b.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canShowJoin ? (
                        <JoinPujaButton
                          bookingId={b._id}
                          opensAt={b.joinability.opensAt}
                          closesAt={b.joinability.closesAt}
                          canJoin={b.joinability.canJoin}
                          joinPath={`/live/specific-puja/student/${b._id}`}
                          fetchToken={getPujaBookingLiveKitToken}
                          label="Join"
                          size="sm"
                        />
                      ) : (
                        <span className="text-xs text-inkSoft">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ------------------------------ render ------------------------------ */

  return (
    <>
      <Topbar
        title="Specific Puja"
        subtitle="A private, one-on-one puja booked just for you"
      />
      <main className="px-6 lg:px-10 py-8 space-y-10">
        {/* Packages */}
        <div>
          <PageHeader
            title="Available Puja Packages"
            description="After payment, this is scheduled individually and conducted in a private session for you."
          />

          {loading && (
            <p className="text-sm text-inkSoft">Loading packages…</p>
          )}
          {!loading && loadError && (
            <p className="text-sm text-danger">{loadError}</p>
          )}
          {!loading && !loadError && packages.length === 0 && (
            <p className="text-sm text-inkSoft">
              No puja packages are available right now.
            </p>
          )}

          {!loading && !loadError && packages.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-5">
              {packages.map((pkg) => {
                const isOpen = openForm === pkg._id;
                return (
                  <div
                    key={pkg._id}
                    className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold">
                        {pkg.name}
                      </h3>
                      {pkg.durationMinutes && (
                        <span className="text-[11px] text-inkSoft border border-border rounded-full px-2 py-0.5">
                          {formatDuration(pkg.durationMinutes)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-inkSoft">
                      {pkg.teacher?.name || "Teacher TBD"}
                    </p>
                    <p className="text-sm text-inkSoft">{pkg.description}</p>

                    {pkg.availabilityNote && (
                      <p className="text-xs text-inkSoft italic">
                        {pkg.availabilityNote}
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                      <span className="font-display text-lg font-semibold">
                        {formatPrice(pkg.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openBookingForm(pkg)}
                        className="bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        {isOpen ? "Cancel" : "Book This Puja"}
                      </button>
                    </div>

                    {isOpen && (
                      <form
                        onSubmit={(e) => handleBook(e, pkg)}
                        className="pt-3 border-t border-border space-y-4"
                      >
                        {(pkg.requiredInfoFields || []).length > 0 && (
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-inkSoft">
                              Your details
                            </p>
                            {(pkg.requiredInfoFields || []).map((field) => (
                              <div key={field}>
                                <label className="block text-xs font-medium text-inkSoft mb-1">
                                  {field}
                                </label>
                                <input
                                  name={field}
                                  type="text"
                                  required
                                  className="input"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {renderSlotPicker(pkg)}

                        <div className="pt-3 border-t border-border">
                          <label className="block text-xs font-medium text-inkSoft mb-1">
                            Payment method
                          </label>
                          <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="input"
                          >
                            <option value="phonepe">PhonePe</option>
                            <option value="paypal">PayPal</option>
                          </select>
                        </div>

                        {formError && (
                          <p className="text-sm text-danger">{formError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-maroon text-ivory px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                        >
                          {submitting
                            ? "Processing…"
                            : `Confirm & Pay ${formatPrice(pkg.price)}`}
                        </button>

                        <p className="text-[11px] text-inkSoft text-center">
                          The priest will confirm your requested time shortly.
                        </p>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Bookings */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">
            My Bookings
          </h3>
          {renderBookings()}
        </div>
      </main>
    </>
  );
}