// utils/timezone.js

/**
 * Convert a wall-clock time in a specific timezone to a UTC epoch.
 *
 * @param {string} localStr  "YYYY-MM-DDTHH:mm:ss" (interpreted as wall-clock in `tz`)
 * @param {string} tz        IANA timezone, e.g. "Asia/Kolkata"
 * @returns {number}         UTC epoch milliseconds
 */
function zonedTimeToUtc(localStr, tz) {
  const [datePart, timePart] = localStr.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);

  // What that wall-clock would be if it were UTC
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, 0);

  // Find out how `asUtc` looks when formatted in the target timezone
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

  const get = (type) => formatted.find((p) => p.type === type)?.value;

  const tzAsUtc = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")) % 24,
    Number(get("minute")),
    Number(get("second"))
  );

  const offset = tzAsUtc - asUtc;
  return asUtc - offset;
}

module.exports = { zonedTimeToUtc };