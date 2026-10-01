"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import { browseFreeClasses } from "@/action/student";
import {
  msUntilJoinable,
  formatCountdown,
  formatClock,
  getSessionStatus,
} from "@/lib/joinWindow";

const JOIN_LEAD_MINUTES = 1;
const DEFAULT_DURATION_MINUTES = 60; // assumed until the backend stores a real duration per class
const ONE_HOUR_MS = 60 * 60 * 1000;

function formatSessionTime(dateTime) {
  if (!dateTime) return "Time TBD";
  return new Date(dateTime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FreeClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await browseFreeClasses();
        setClasses(data.freeClasses || []);
      } catch (err) {
        setLoadError(
          err?.response?.data?.message ||
            "Could not load free classes. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Topbar
        title="Free Classes"
        subtitle="Open to any logged-in member — no purchase needed"
      />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Upcoming Free Classes"
          description={`The Join button unlocks ${JOIN_LEAD_MINUTES} minute before each session starts.`}
        />

        {loading && (
          <p className="text-sm text-inkSoft">Loading free classes…</p>
        )}
        {!loading && loadError && (
          <p className="text-sm text-danger">{loadError}</p>
        )}
        {!loading && !loadError && classes.length === 0 && (
          <p className="text-sm text-inkSoft">
            No free classes are scheduled right now.
          </p>
        )}

        {!loading && !loadError && classes.length > 0 && (
          <div className="space-y-4">
            {classes.map((c) => {
              const durationMinutes =
                c.durationMinutes || DEFAULT_DURATION_MINUTES;
              const status = getSessionStatus(c.dateTime, {
                leadMinutes: JOIN_LEAD_MINUTES,
                durationMinutes,
                nowMs: now,
              });
              const remainingMs = msUntilJoinable(
                c.dateTime,
                JOIN_LEAD_MINUTES,
                now,
              );
              const isClose = remainingMs <= ONE_HOUR_MS;

              return (
                <div
                  key={c._id}
                  className={`bg-surface border border-border rounded-xl p-5 ${
                    status === "ended" ? "opacity-60" : ""
                  }`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-display font-semibold">{c.title}</h3>

                      <p className="text-sm text-inkSoft mt-0.5 mb-2">
                        {c.description}
                      </p>
                      <p className="text-sm text-inkSoft">
                        {c.teacher?.name || "Teacher TBD"} ·{" "}
                        {formatSessionTime(c.dateTime)}
                      </p>
                    </div>

                    {status === "ended" ? (
                      <span className="bg-ivorySoft text-inkSoft px-5 py-2.5 rounded-lg text-sm font-semibold">
                        Ended
                      </span>
                    ) : status === "joinable" ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/student/free-classes/${c._id}/room`)
                        }
                        className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold">
                        Join Class
                      </button>
                    ) : isClose ? (
                      <span
                        title={`The Join button unlocks ${JOIN_LEAD_MINUTES} minute before start`}
                        className="inline-flex items-center gap-2 bg-ivorySoft text-maroon px-5 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed">
                        <Clock size={15} />
                        <span className="font-mono tabular-nums">
                          {formatClock(remainingMs)}
                        </span>
                      </span>
                    ) : (
                      <span
                        title={`The Join button unlocks ${JOIN_LEAD_MINUTES} minute before start`}
                        className="bg-ivorySoft text-inkSoft px-5 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed">
                        {formatCountdown(remainingMs)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
