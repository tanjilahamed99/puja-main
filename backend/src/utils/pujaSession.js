// utils/pujaSession.js

// How early someone can enter the room before the scheduled time.
const JOIN_OPENS_EARLY_MS = 5 * 60 * 1000; // 5 minutes

// How long after the scheduled start the room stays joinable.
// Uses the booking's durationMinutes + a small grace period.
const JOIN_GRACE_MS = 15 * 60 * 1000; // 15 minutes after end

/**
 * Computes the join window for a specific-puja booking.
 * @param {Object} booking
 * @returns {{ opensAt: Date, closesAt: Date, duration: number }}
 */
function getPujaJoinWindow(booking) {
  const start = new Date(
    booking.confirmedDateTime || booking.scheduledDateTime,
  );
  const duration = booking.durationMinutes || 60;

  const opensAt = new Date(start.getTime() - JOIN_OPENS_EARLY_MS);
  const closesAt = new Date(
    start.getTime() + (duration * 60_000) + JOIN_GRACE_MS,
  );

  return { opensAt, closesAt, start, duration };
}

/**
 * @returns {{ canJoin: boolean, reason?: string, opensAt: Date, closesAt: Date }}
 */
function evaluateJoinability(booking) {
  const now = Date.now();
  const { opensAt, closesAt } = getPujaJoinWindow(booking);

  if (booking.status === 'cancelled') {
    return { canJoin: false, reason: 'This puja has been cancelled.', opensAt, closesAt };
  }
  if (booking.status === 'completed') {
    return { canJoin: false, reason: 'This puja has already been completed.', opensAt, closesAt };
  }
  if (booking.status !== 'confirmed') {
    return {
      canJoin: false,
      reason: 'This puja is awaiting confirmation.',
      opensAt,
      closesAt,
    };
  }
  if (!booking.liveKitRoomId) {
    return {
      canJoin: false,
      reason: 'The session room has not been set up yet.',
      opensAt,
      closesAt,
    };
  }
  if (now < opensAt.getTime()) {
    return {
      canJoin: false,
      reason: 'The session is not open yet. You can join 5 minutes before the scheduled time.',
      opensAt,
      closesAt,
    };
  }
  if (now > closesAt.getTime()) {
    return {
      canJoin: false,
      reason: 'The session window has passed.',
      opensAt,
      closesAt,
    };
  }
  return { canJoin: true, opensAt, closesAt };
}

module.exports = {
  getPujaJoinWindow,
  evaluateJoinability,
  JOIN_OPENS_EARLY_MS,
  JOIN_GRACE_MS,
};