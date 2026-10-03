/**
 * Course sessions run weekly on `schedule.days` at `schedule.time`.
 * We compute the next or current session window (start ± grace) from
 * an arbitrary `now`. Timezone handling is best-effort — the schedule
 * time is interpreted as wall clock in schedule.timezone.
 */

const DAY_MAP = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Convert "18:00" + day index in a timezone into a UTC Date for the next
 * occurrence at-or-after `referenceDate`.
 */
function nextOccurrence({ days, time, referenceDate = new Date() }) {
  if (!Array.isArray(days) || days.length === 0 || !time) return null;

  const [hh, mm] = time.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const dayIndexes = days
    .map((d) => DAY_MAP[d])
    .filter((n) => n !== undefined)
    .sort((a, b) => a - b);
  if (dayIndexes.length === 0) return null;

  const ref = new Date(referenceDate);

  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(ref);
    candidate.setDate(ref.getDate() + offset);
    candidate.setHours(hh, mm, 0, 0);

    if (
      dayIndexes.includes(candidate.getDay()) &&
      candidate.getTime() >= ref.getTime() - 60 * 60 * 1000 // allow 1h lookback
    ) {
      return candidate;
    }
  }
  return null;
}

/**
 * @returns {{
 *   start: Date|null,
 *   opensAt: Date|null,
 *   closesAt: Date|null,
 *   duration: number,
 * }}
 */
function getCourseSessionWindow(course, referenceDate = new Date()) {
  const duration = course.durationMinutes || 60;
  const lead = course.joinLeadMinutes ?? 10;
  const grace = course.joinGraceMinutes ?? 15;

  const start = nextOccurrence({
    days: course.schedule?.days,
    time: course.schedule?.time,
    referenceDate,
  });

  if (!start) {
    return { start: null, opensAt: null, closesAt: null, duration };
  }

  const opensAt = new Date(start.getTime() - lead * 60_000);
  const closesAt = new Date(start.getTime() + (duration + grace) * 60_000);

  return { start, opensAt, closesAt, duration };
}

/**
 * @returns {{ canJoin, reason?, opensAt, closesAt, nextStart }}
 */
function evaluateCourseJoinability(course, referenceDate = new Date()) {
  const now = referenceDate.getTime();

  if (!course) {
    return { canJoin: false, reason: "Course not found.", opensAt: null, closesAt: null };
  }
  if (course.status !== "active") {
    return {
      canJoin: false,
      reason: "This course is not currently active.",
      opensAt: null,
      closesAt: null,
    };
  }
  if (!course.liveKitRoomId) {
    return {
      canJoin: false,
      reason: "The session room has not been set up yet.",
      opensAt: null,
      closesAt: null,
    };
  }

  const { start, opensAt, closesAt } = getCourseSessionWindow(course, referenceDate);

  if (!start) {
    return {
      canJoin: false,
      reason: "This course has no scheduled sessions yet.",
      opensAt: null,
      closesAt: null,
    };
  }

  if (now < opensAt.getTime()) {
    return {
      canJoin: false,
      reason: "The next session has not opened yet.",
      opensAt,
      closesAt,
      nextStart: start,
    };
  }
  if (now > closesAt.getTime()) {
    return {
      canJoin: false,
      reason: "The current session window has passed.",
      opensAt,
      closesAt,
      nextStart: start,
    };
  }
  return { canJoin: true, opensAt, closesAt, nextStart: start };
}

module.exports = {
  nextOccurrence,
  getCourseSessionWindow,
  evaluateCourseJoinability,
};