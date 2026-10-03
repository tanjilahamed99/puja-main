"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { confirmPujaBooking } from "@/action/admin";

function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function ConfirmPujaBookingModal({
  booking,
  mode = "confirm",
  onClose,
  onSaved,
  rescheduleFn,
}) {
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking) return;
    const initial =
      booking.confirmedDateTime ||
      booking.proposedDateTime ||
      booking.scheduledDateTime ||
      new Date(Date.now() + 24 * 3600 * 1000);
    setValue(toLocalInputValue(initial));
    setReason("");
    setError("");
  }, [booking]);

  if (!booking) return null;

  const isReschedule = mode === "reschedule";

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const iso = new Date(value).toISOString();
      const res = isReschedule
        ? await rescheduleFn(booking._id, iso, reason || undefined)
        : await confirmPujaBooking(booking._id, iso, reason || undefined);

      const updated = res?.data?.booking;
      toast.success(isReschedule ? "Booking rescheduled" : "Booking confirmed");
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (isReschedule ? "Could not reschedule" : "Could not confirm");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const requestedTime =
    booking.proposedDateTime || booking.scheduledDateTime;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-surface border border-border rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold">
            {isReschedule ? "Reschedule Booking" : "Confirm Puja Booking"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-sm text-inkSoft space-y-1">
          <p>
            <span className="text-ink font-medium">
              {booking.package?.name || "Package"}
            </span>{" "}
            — {booking.user?.name || "Unknown user"}
          </p>
          <p>
            Requested:{" "}
            <span className="text-ink">
              {new Date(requestedTime).toLocaleString("en-IN", {
                timeZone: "Asia/Dhaka",
              })}
            </span>
          </p>
          {booking.confirmedDateTime && (
            <p>
              Currently confirmed:{" "}
              <span className="text-ink">
                {new Date(booking.confirmedDateTime).toLocaleString("en-IN", {
                  timeZone: "Asia/Dhaka",
                })}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">
            {isReschedule ? "New date & time" : "Confirmed date & time"}
          </label>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">
            Reason {isReschedule ? "(optional)" : "(optional, shared in history)"}
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. priest unavailable at requested slot"
            className="input"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving
              ? "Saving..."
              : isReschedule
              ? "Save Reschedule"
              : "Confirm Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}