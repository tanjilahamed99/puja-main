"use client";

import { ArrowRight, Calendar, Clock, GraduationCap, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ScrollReveal";
import { useServiceLink } from "@/components/Useservicelink";

const DAY_MAP = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

function formatSchedule(s) {
  if (!s) return "—";
  const days = Array.isArray(s.days)
    ? s.days.map((d) => DAY_MAP[d] || d).join(", ")
    : "";
  const time = s.time || "";
  return [days, time].filter(Boolean).join(" · ");
}

export default function CoursesSection({ courses = [], loading = false }) {
  const t = useTranslations("home.coursesSection");
  const goTo = useServiceLink();

  return (
    <section id="courses" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
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
            onClick={() => goTo("/student/courses", { guestPath: "/register" })}
            className="text-sm font-semibold text-maroon hover:underline whitespace-nowrap inline-flex items-center gap-1"
          >
            {t("viewAll")}
            <ArrowRight size={14} />
          </button>
        </div>
      </ScrollReveal>

      {loading ? (
        <SkeletonGrid />
      ) : courses.length === 0 ? (
        <EmptyState label={t("empty")} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c, i) => (
            <ScrollReveal key={c._id} delay={i * 120}>
              <article className="group bg-ivory border border-border rounded-xl p-5 flex flex-col gap-3 h-full transition-all duration-300 hover:border-maroon hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <span className="inline-flex text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
                    {c.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-goldDeep bg-goldSoft/30 px-2 py-1 rounded-full">
                    <Layers size={12} />
                    {c.totalSessions} {t("sessions")}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-maroon transition-colors">
                  {c.title}
                </h3>

                <p className="text-sm text-inkSoft line-clamp-2">{c.description}</p>

                <p className="text-sm text-inkSoft flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-maroon shrink-0" />
                  {c.teacher?.name}
                </p>

                <p className="text-sm text-inkSoft flex items-center gap-1.5">
                  <Calendar size={14} className="text-maroon shrink-0" />
                  {formatSchedule(c.schedule)}
                </p>

                <p className="text-sm text-inkSoft flex items-center gap-1.5">
                  <Clock size={14} className="text-maroon shrink-0" />
                  {c.durationMinutes} {t("mins")}
                </p>

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-maroon">
                    {formatPrice(c.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      goTo("/student/courses", { guestPath: "/register" })
                    }
                    className="text-xs font-semibold text-ivory bg-maroon hover:bg-maroonDeep px-3.5 py-2 rounded-lg transition-all hover:shadow-md"
                  >
                    {t("enroll")}
                  </button>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}

function formatPrice(amount) {
  if (amount == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-border/40 rounded-xl h-64 animate-pulse" />
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