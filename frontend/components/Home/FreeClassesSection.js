"use client";

import {
  ArrowRight,
  Calendar,
  Clock,
  Video,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ScrollReveal";
import { useServiceLink } from "@/components/Useservicelink";
import { useAuthStore } from "@/features/Useauthstore";
import { getFreeClassLiveKitToken } from "@/action/student";
import JoinPujaButton from "@/components/JoinPujaButton";
import FreeClassCountdown from "@/components/Home/FreeClassCountdown";

export default function FreeClassesSection({ classes = [], loading = false }) {
  const t = useTranslations("home.freeSection");
  const goTo = useServiceLink();
  const user = useAuthStore((s) => s.user);

  const handleJoinClick = () => {
    // Guests → register; teachers/admins → their dashboard; students → goTo
    // is a no-op here because JoinPujaButton handles the real join for students.
    goTo("/student/free-classes", { guestPath: "/register" });
  };

  return (
    <section id="free-classes" className="bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
            <div className="max-w-xl">
              <span className="text-xs font-bold text-maroon tracking-wider uppercase mb-3 block">
                {t("eyebrow")}
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                {t("heading")}
              </h2>
              <p className="text-inkSoft mt-3">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={handleJoinClick}
              className="text-sm font-semibold text-maroon hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              {t("viewAll")}
              <ArrowRight size={14} />
            </button>
          </div>
        </ScrollReveal>

        {loading ? (
          <SkeletonGrid />
        ) : classes.length === 0 ? (
          <EmptyState label={t("empty")} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c, i) => {
              const j = c.joinability;
              const isEnded =
                c.status === "completed" || c.status === "cancelled";
              const isLive = c.status === "live";
              const canJoin = !!j?.canJoin;
              const isStudent = user?.role === "student";

              return (
                <ScrollReveal key={c._id} delay={i * 120}>
                  <article className="group bg-[linear-gradient(165deg,var(--color-maroon)_0%,var(--color-maroon-deep)_100%)] text-[#F8E9CE] rounded-xl p-5 flex flex-col gap-3 h-full relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-maroon/40 hover:-translate-y-1">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />

                    <div className="flex items-center justify-between relative gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/15">
                        <Video size={12} />
                        {isLive ? "Live now" : t("badge")}
                      </span>
                      {isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold leading-snug relative">
                      {c.title}
                    </h3>

                    <p className="text-sm text-[#EAD3B0] relative">
                      {c.teacher?.name || "Teacher TBD"}
                    </p>

                    <ul className="space-y-2 mt-1 text-sm relative">
                      <li className="flex items-center gap-2">
                        <Calendar size={14} className="shrink-0" />
                        {formatDateTime(c.dateTime)}
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={14} className="shrink-0" />
                        {c.durationMinutes} {t("mins")}
                      </li>
                      <li className="flex items-center gap-2 font-medium text-[#F8E39A]">
                        <Info size={14} className="shrink-0" />
                        {isEnded ? (
                          <span>Ended</span>
                        ) : c.dateTime ? (
                          <FreeClassCountdown target={c.dateTime} />
                        ) : (
                          <span>Time TBD</span>
                        )}
                      </li>
                    </ul>

                    <div className="mt-auto pt-4 border-t border-white/20 relative">
                      {isEnded ? (
                        <span className="w-full bg-white/10 text-[#EAD3B0] text-sm font-semibold py-2.5 rounded-lg inline-flex items-center justify-center gap-1.5">
                          Ended
                        </span>
                      ) : !canJoin ? (
                        <span className="w-full bg-white/10 text-[#EAD3B0] text-sm font-semibold py-2.5 rounded-lg inline-flex items-center justify-center gap-1.5">
                          {j?.reason || "Not open yet"}
                        </span>
                      ) : !user ? (
                        // Guest → must register / login to join
                        <button
                          type="button"
                          onClick={handleJoinClick}
                          className="w-full bg-white/15 hover:bg-white/25 text-ivory text-sm font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                          {t("join")}
                          <ArrowRight size={14} />
                        </button>
                      ) : !isStudent ? (
                        // Teacher/admin → their dashboard
                        <button
                          type="button"
                          onClick={handleJoinClick}
                          className="w-full bg-white/15 hover:bg-white/25 text-ivory text-sm font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                          {t("join")}
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        // Logged-in student → real LiveKit join
                        <JoinPujaButton
                          bookingId={c._id}
                          opensAt={j.opensAt}
                          closesAt={j.closesAt}
                          canJoin={j.canJoin}
                          joinPath={`/live/free-class/student/${c._id}`}
                          fetchToken={getFreeClassLiveKitToken}
                          label={t("join")}
                          size="md"
                        />
                      )}
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-maroon/10 rounded-xl h-56 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="border border-dashed border-border rounded-xl p-10 text-center text-sm text-inkSoft">
      {label}
    </div>
  );
}