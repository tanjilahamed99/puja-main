// utils/timezone.js
export const zonedTimeToUtc = (localStr, tz) => {
  // localStr: "YYYY-MM-DDTHH:mm:ss" in `tz`
  const [datePart, timePart] = localStr.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);

  // Start with what that wall clock would be in UTC
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, 0);
  // Find the actual instant by comparing formatted output in `tz`
  const guess = new Date(asUtc);
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(guess);

  const get = (t) => formatted.find((p) => p.type === t)?.value;
  const tzAsUtc = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")) % 24,
    Number(get("minute")),
    Number(get("second")),
  );

  const offset = tzAsUtc - asUtc;
  return asUtc - offset; // the actual UTC epoch for that wall-clock time in tz
};
