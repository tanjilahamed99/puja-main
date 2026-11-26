// lib/pujaHelpers.js

export function formatPrice(price) {
  return `৳${Number(price || 0).toLocaleString("en-IN")}`;
}

export function formatDateTime(date) {
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

export function formatDuration(minutes) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const packageStatusVariant = (status) =>
  ({ active: "success", draft: "neutral", archived: "warning" }[status] ||
    "neutral");

export const bookingStatusVariant = (status) =>
  ({
    confirmed: "success",
    completed: "success",
    pending: "warning",
    cancelled: "danger",
  }[status] || "neutral");