// lib/joinWindow.js
// Shared logic for "the Join button unlocks N minutes before start".

export function msUntilJoinable(dateTime, leadMinutes = 1, nowMs = Date.now()) {
  const startMs = new Date(dateTime).getTime();
  const openMs = startMs - leadMinutes * 60 * 1000;
  return openMs - nowMs;
}

export function isJoinable(dateTime, leadMinutes = 1, nowMs = Date.now()) {
  return msUntilJoinable(dateTime, leadMinutes, nowMs) <= 0;
}

// Coarse text for when a class is still far away — "Opens in 2h 15m".
// Not meant to tick every second; it only needs to update every minute
// or so, which it naturally does since it's recomputed on each render.
export function formatCountdown(ms) {
  if (ms <= 0) return "Join now";
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `Opens in ${hours}h ${minutes}m`;
  return `Opens in ${minutes}m`;
}

// A real ticking mm:ss (or h:mm:ss) clock, for use once a class is close
// enough that a live countdown actually feels meaningful rather than
// noisy — e.g. inside the last hour.
export function formatClock(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

// Classifies a session as 'upcoming' | 'joinable' | 'ended'.
//
// NOTE: your FreeClass model doesn't store a duration yet, so this
// assumes every class runs for `durationMinutes` (default 60) unless
// the class object itself provides one (c.durationMinutes). The proper
// long-term fix is adding a real `durationMinutes` field to the
// FreeClass schema so each class can say how long it actually runs —
// this default is a reasonable stand-in until then.
export function getSessionStatus(dateTime, { leadMinutes = 1, durationMinutes = 60, nowMs = Date.now() } = {}) {
  const startMs = new Date(dateTime).getTime();
  const endMs = startMs + durationMinutes * 60 * 1000;
  const openMs = startMs - leadMinutes * 60 * 1000;

  if (nowMs > endMs) return "ended";
  if (nowMs >= openMs) return "joinable";
  return "upcoming";
}