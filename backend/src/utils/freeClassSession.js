/**
 * Compute the join window for a free class.
 *   opensAt  = dateTime - joinLeadMinutes
 *   closesAt = dateTime + durationMinutes + joinGraceMinutes
 */
function getFreeClassJoinWindow(fc) {
  const start = new Date(fc.dateTime);
  const duration = fc.durationMinutes || 60;
  const lead = fc.joinLeadMinutes ?? 5;
  const grace = fc.joinGraceMinutes ?? 15;

  const opensAt = new Date(start.getTime() - lead * 60_000);
  const closesAt = new Date(start.getTime() + (duration + grace) * 60_000);

  return { opensAt, closesAt, start, duration };
}

function evaluateFreeClassJoinability(fc) {
  const now = Date.now();
  const { opensAt, closesAt } = getFreeClassJoinWindow(fc);

  if (fc.status === "cancelled") {
    return { canJoin: false, reason: "This class has been cancelled.", opensAt, closesAt };
  }
  if (fc.status === "completed") {
    return { canJoin: false, reason: "This class has already ended.", opensAt, closesAt };
  }
  if (!fc.liveKitRoomId) {
    return { canJoin: false, reason: "The session room has not been set up yet.", opensAt, closesAt };
  }
  if (now < opensAt.getTime()) {
    return {
      canJoin: false,
      reason: "The class is not open yet. You can join shortly before it starts.",
      opensAt,
      closesAt,
    };
  }
  if (now > closesAt.getTime()) {
    return { canJoin: false, reason: "The class window has passed.", opensAt, closesAt };
  }
  return { canJoin: true, opensAt, closesAt };
}

module.exports = { getFreeClassJoinWindow, evaluateFreeClassJoinability };