const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function resolveTimeZone(tz) {
  if (!tz) return "Asia/Dhaka";
  // Keep only the IANA part, e.g. "Asia/Dhaka (GMT+6)" -> "Asia/Dhaka"
  const clean = tz.split("(")[0].trim();
  try {
    Intl.DateTimeFormat("en-US", { timeZone: clean });
    return clean;
  } catch {
    return "Asia/Dhaka";
  }
}

function tzOffsetMinutes(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour === "24" ? 0 : parts.hour,
    parts.minute,
    parts.second,
  );
  return (asUTC - date.getTime()) / 60000;
}

/**
 * Next occurrence of a recurring weekly class, e.g. { days: ["Mon","Wed"], time: "18:00", timezone: "Asia/Dhaka" }.
 * Returns { start, end, opensAt } as real Date instants, or null if the schedule is incomplete.
 */
export function getNextSession(
  schedule,
  { durationMin = 60, joinWindowMin = 10 } = {},
) {
  if (!schedule?.days?.length || !schedule?.time) return null;

  const tz = resolveTimeZone(schedule.timezone);
  const [h, m] = schedule.time.split(":").map(Number);
  const now = new Date();
  const offsetMin = tzOffsetMinutes(now, tz);

  const nowWall = new Date(now.getTime() + offsetMin * 60000);

  let bestWall = null;
  for (const label of schedule.days) {
    const dow = DAY_INDEX[label.slice(0, 3)];
    if (dow === undefined) continue;

    let diff = dow - nowWall.getUTCDay();
    if (diff < 0) diff += 7;

    const candidate = new Date(
      Date.UTC(
        nowWall.getUTCFullYear(),
        nowWall.getUTCMonth(),
        nowWall.getUTCDate() + diff,
        h,
        m,
        0,
      ),
    );
    // Same weekday but this week's class already ended — push to next week.
    if (
      diff === 0 &&
      candidate.getTime() + durationMin * 60000 <= nowWall.getTime()
    ) {
      candidate.setUTCDate(candidate.getUTCDate() + 7);
    }
    if (!bestWall || candidate < bestWall) bestWall = candidate;
  }
  if (!bestWall) return null;

  const start = new Date(bestWall.getTime() - offsetMin * 60000);
  const end = new Date(start.getTime() + durationMin * 60000);
  const opensAt = new Date(start.getTime() - joinWindowMin * 60000);
  return { start, end, opensAt };
}
