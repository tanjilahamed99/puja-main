"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Video } from "lucide-react";
import { toast } from "sonner";

/**
 * Displays a Join button that:
 *   - shows a countdown if the window hasn't opened yet
 *   - fetches a LiveKit token and navigates to the room if open
 *   - hides itself if the window has fully closed
 *
 * Props:
 *   bookingId: string
 *   opensAt: ISO string
 *   closesAt: ISO string
 *   canJoin: boolean (from server)
 *   joinPath: string — the room route, e.g. "/teacher/specific-puja/{id}/room"
 *   fetchToken: (bookingId) => Promise<AxiosResponse>
 *   onStarted?: () => void — called once when the user clicks Join (used by teacher to mark started)
 */
export default function JoinPujaButton({
  bookingId,
  opensAt,
  closesAt,
  canJoin,
  joinPath,
  fetchToken,
  onStarted,
  label = "Join Puja",
  size = "md",
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [joining, setJoining] = useState(false);

  // tick every second while counting down
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const openTime = opensAt ? new Date(opensAt).getTime() : 0;
  const closeTime = closesAt ? new Date(closesAt).getTime() : 0;

  const state = useMemo(() => {
    if (!openTime) return "unknown";
    if (now < openTime) return "before";
    if (closeTime && now > closeTime) return "after";
    return "open";
  }, [now, openTime, closeTime]);

  const countdown = useMemo(() => {
    if (state !== "before") return "";
    const diff = Math.max(0, openTime - now);
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `opens in ${h}h ${m}m`;
    if (m > 0) return `opens in ${m}m ${s}s`;
    return `opens in ${s}s`;
  }, [state, openTime, now]);

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
  };

  // Fully closed — hide
  if (state === "after") return null;

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    try {
      // Teacher flow first (optional)
      if (typeof onStarted === "function") {
        try {
          await onStarted();
        } catch (err) {
          // don't block on failure — server token endpoint will still gate
          console.warn("start call failed:", err?.message);
        }
      }

      // Pre-flight token fetch to surface any gating error cleanly
      await fetchToken(bookingId);
      router.push(joinPath);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not join the puja session";
      toast.error(msg);
    } finally {
      setJoining(false);
    }
  };

  if (state === "before" || !canJoin) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 ${sizes[size]} cursor-not-allowed`}
        title={countdown}
      >
        <CalendarClock size={16} />
        {state === "before" ? countdown : "Not open yet"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={joining}
      className={`inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-50 ${sizes[size]}`}
    >
      {joining ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Video size={16} />
      )}
      {joining ? "Joining…" : label}
    </button>
  );
}