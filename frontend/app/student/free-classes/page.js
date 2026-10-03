"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import JoinPujaButton from "@/components/JoinPujaButton";
import {
  browseFreeClasses,
  getFreeClassLiveKitToken,
} from "@/action/student";
import { Clock, Video } from "lucide-react";

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
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
            "Could not load free classes. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
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
          description="Join live sessions from the button below. Joining opens a few minutes before the class starts."
        />

        {loading && <p className="text-sm text-inkSoft">Loading free classes…</p>}
        {!loading && loadError && <p className="text-sm text-danger">{loadError}</p>}
        {!loading && !loadError && classes.length === 0 && (
          <p className="text-sm text-inkSoft">
            No free classes are scheduled right now.
          </p>
        )}

        {!loading && !loadError && classes.length > 0 && (
          <div className="space-y-4">
            {classes.map((c) => {
              const joinability = c.joinability;
              const isEnded =
                c.status === "completed" || c.status === "cancelled";

              return (
                <div
                  key={c._id}
                  className={`bg-surface border border-border rounded-xl p-5 ${
                    isEnded ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold">{c.title}</h3>
                        {c.status === "live" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping bg-emerald-400" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                            Live now
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-inkSoft mt-0.5">
                        {c.teacher?.name || "Teacher TBD"} ·{" "}
                        {formatSessionTime(c.dateTime)}
                        {c.durationMinutes && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs">
                            <Clock size={12} />
                            {c.durationMinutes} min
                          </span>
                        )}
                      </p>
                      {c.description && (
                        <p className="text-xs text-inkSoft mt-2 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isEnded || !joinability ? (
                        <span className="bg-ivorySoft text-inkSoft px-5 py-2.5 rounded-lg text-sm font-semibold">
                          {isEnded ? "Ended" : "Not scheduled"}
                        </span>
                      ) : (
                        <JoinPujaButton
                          bookingId={c._id}
                          opensAt={joinability.opensAt}
                          closesAt={joinability.closesAt}
                          canJoin={joinability.canJoin}
                          joinPath={`/live/free-class/student/${c._id}`}
                          fetchToken={getFreeClassLiveKitToken}
                          label="Join Class"
                          size="md"
                        />
                      )}
                    </div>
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