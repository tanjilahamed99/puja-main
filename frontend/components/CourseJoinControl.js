"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Radio } from "lucide-react";
import { getNextSession } from "@/lib/courseSchedule";

const pad = (n) => String(n).padStart(2, "0");

function formatCountdown(ms) {
  if (ms <= 0) return "0s";
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

export default function CourseJoinControl({ courseId, schedule, durationMin = 60 }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const session = getNextSession(schedule, { durationMin });
  if (!session) {
    return <p className="text-sm text-inkSoft">Schedule to be announced.</p>;
  }

  const { start, end, opensAt } = session;
  const isLive = now >= start.getTime() && now < end.getTime();
  const isJoinable = now >= opensAt.getTime() && now < end.getTime();

  if (isJoinable) {
    return (
      <div className="space-y-2">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
            <Radio size={12} className="animate-pulse" /> Live now
          </span>
        )}
        <Link
          href={`/live/courses/student/${courseId}`}
          className="inline-flex items-center justify-center bg-maroon text-ivory px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Join Class
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <CalendarClock size={15} className="text-maroon" />
        Next class:{" "}
        {start.toLocaleString(undefined, {
          weekday: "short", month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit",
        })}
      </p>
      <p className="text-xs text-inkSoft">
        Starts in <span className="font-semibold text-ink">{formatCountdown(start.getTime() - now)}</span>
        {" "}— the join button appears 10 minutes before class.
      </p>
    </div>
  );
}