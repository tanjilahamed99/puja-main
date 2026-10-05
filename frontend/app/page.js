"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  BookOpen,
  Users,
  Globe2,
  Heart,
  Sparkles,
  Flame,
  Clock,
  Star,
  Award,
  Video,
  Calendar,
  ArrowRight,
  Play,
  Shield,
  Languages,
  GraduationCap,
  MapPin,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useServiceLink } from "@/components/Useservicelink";
import ScrollReveal from "@/components/ScrollReveal";

/* Language-independent data only (numbers, prices, IDs) */
const stats = [
  { key: "courses", value: "40+", suffix: "" },
  { key: "students", value: "1,200", suffix: "+" },
  { key: "sessions", value: "120", suffix: "" },
  { key: "languages", value: "3", suffix: "" },
];

const stepKeys = ["choose", "meet", "track"];
const pointKeys = ["p1", "p2", "p3"];

const featuredCourses = [
  {
    key: "griha",
    price: "₹1,499",
    oldPrice: "₹1,999",
    lessons: 12,
    hours: "18",
    rating: 4.9,
    students: 342,
    level: "Beginner",
  },
  {
    key: "durga",
    price: "₹1,999",
    oldPrice: "₹2,499",
    lessons: 16,
    hours: "24",
    rating: 4.8,
    students: 287,
    level: "Intermediate",
  },
  {
    key: "everyday",
    price: "₹999",
    oldPrice: "₹1,499",
    lessons: 8,
    hours: "12",
    rating: 5.0,
    students: 524,
    level: "Beginner",
  },
];

const teacherKeys = ["sharma", "joshi", "chatterjee"];
const reviewKeys = ["ritika", "abir", "sanjay"];

export default function HomePage() {
  const goTo = useServiceLink();
  const t = useTranslations("home");

  return (
    <>
      <SiteHeader />

      <main className="overflow-hidden">
        {/* ═══════════ HERO SECTION ═══════════ */}
        <section className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-maroonDeep mb-5 bg-maroon/5 px-4 py-2 rounded-full border border-maroon/10">
                <Sparkles size={16} className="animate-pulse" />
                {t("hero.badge")}
              </div>

              <h1 className="font-display font-semibold text-ink leading-[1.2] text-4xl sm:text-5xl lg:text-[3.4rem] max-w-xl">
                {t("hero.title")}
              </h1>

              <p className="text-inkSoft text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  type="button"
                  onClick={() =>
                    goTo("/student/courses", { guestPath: "/register" })
                  }
                  className="group bg-maroon text-ivory text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:bg-maroonDeep transition-all duration-300 hover:shadow-lg hover:shadow-maroon/30 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                >
                  {t("hero.browse")}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => goTo("/student/free-classes")}
                  className="group border-2 border-border text-ink text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:border-maroon hover:text-maroon transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Play size={14} className="fill-current" />
                  {t("hero.freeClass")}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mt-8 text-xs text-inkSoft">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-green-600" />
                  <span>{t("hero.trust1")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-gold fill-gold" />
                  <span>{t("hero.trust2")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages size={14} className="text-maroon" />
                  <span>{t("hero.trust3")}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-border">
                {stats.map((s, i) => (
                  <ScrollReveal key={s.key} delay={i * 100}>
                    <div className="group">
                      <p className="font-display text-2xl sm:text-3xl font-semibold text-maroon transition-transform group-hover:scale-105">
                        {s.value}
                        <span className="text-gold">{s.suffix}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-inkSoft mt-1">
                        {t(`stats.${s.key}`)}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </ScrollReveal>

            {/* Hero Illustration */}
            <ScrollReveal direction="right" delay={200}>
              <div className="relative">
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-[0_18px_40px_-20px_rgba(140,47,27,0.25)] relative overflow-hidden group">
                  {/* Glow effect */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-2xl transition-all duration-700 group-hover:scale-125"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(244,200,106,0.5), transparent 65%)",
                    }}
                  />

                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    LIVE
                  </div>

                  <svg
                    viewBox="0 0 240 220"
                    className="relative w-full h-auto"
                    aria-hidden="true"
                  >
                    <ellipse
                      cx="120"
                      cy="170"
                      rx="78"
                      ry="18"
                      fill="var(--color-gold)"
                      opacity="0.22"
                    />
                    <path
                      d="M60 150c0-28 22-40 60-40s60 12 60 40c0 16-14 28-60 28s-60-12-60-28z"
                      fill="var(--color-maroon)"
                    />
                    <path
                      d="M70 148c0-20 18-30 50-30s50 10 50 30"
                      stroke="var(--color-gold-soft)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      d="M120 108c-14-18-16-32-4-46 3 12 9 18 16 22 4-8 2-16-2-24 14 10 22 24 22 38 0 16-14 28-32 28-10 0-18-6-18-14 0-4 2-8 6-14z"
                      fill="var(--color-gold)"
                      className="animate-flicker"
                    />
                    <path
                      d="M120 100c-7-10-8-18-2-26 1 7 5 10 9 12 2-4 1-9-1-13 8 6 12 13 12 21 0 8-7 14-16 14-5 0-9-3-9-7 0-2 1-4 3-7z"
                      fill="#F8E39A"
                    />
                  </svg>

                  <p className="text-center text-sm text-inkSoft mt-2 relative flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    {t("hero.todayClass")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section
          id="how-it-works"
          className="bg-surface border-y border-border relative overflow-hidden"
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 relative">
            <ScrollReveal>
              <div className="max-w-xl mb-12">
                <span className="text-xs font-bold text-maroon tracking-wider uppercase mb-3 block">
                  {t("how.eyebrow")}
                </span>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                  {t("how.heading")}
                </h2>
                <p className="text-inkSoft mt-3">{t("how.subtitle")}</p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
              {stepKeys.map((key, i) => (
                <ScrollReveal key={key} delay={i * 150}>
                  <div className="group border-t-2 border-maroon pt-5 relative hover:border-gold transition-colors duration-300">
                    <span className="font-display text-xl font-semibold text-goldDeep inline-block transition-transform group-hover:scale-110">
                      0{i + 1}
                    </span>
                    <h3 className="font-display font-semibold text-lg mt-2 group-hover:text-maroon transition-colors">
                      {t(`how.steps.${key}.title`)}
                    </h3>
                    <p className="text-inkSoft text-sm mt-2 leading-relaxed">
                      {t(`how.steps.${key}.text`)}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ THREE WAYS TO LEARN ═══════════ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <ScrollReveal>
            <div className="max-w-xl mb-12">
              <span className="text-xs font-bold text-maroon tracking-wider uppercase mb-3 block">
                {t("ways.eyebrow")}
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                {t("ways.heading")}
              </h2>
              <p className="text-inkSoft mt-3">{t("ways.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Subscription Courses */}
            <ScrollReveal delay={0}>
              <div
                id="courses"
                className="group bg-surface border-2 border-border rounded-2xl p-7 flex flex-col gap-4 h-full transition-all duration-300 hover:border-maroon hover:shadow-xl hover:-translate-y-1"
              >
                <span className="inline-flex self-start text-xs font-bold text-maroon bg-[#F7E5E5] px-3 py-1 rounded-full">
                  {t("ways.courses.badge")}
                </span>
                <h3 className="font-display text-xl font-semibold">
                  {t("ways.courses.title")}
                </h3>
                <p className="text-inkSoft text-sm leading-relaxed">
                  {t("ways.courses.text")}
                </p>
                <ul className="space-y-2.5 mt-1">
                  {pointKeys.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2
                        size={17}
                        className="text-maroon shrink-0 mt-0.5"
                      />
                      {t(`ways.courses.${p}`)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
                  <span className="text-sm text-inkSoft font-medium">
                    {t("ways.courses.label")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      goTo("/student/courses", { guestPath: "/register" })
                    }
                    className="text-sm font-semibold text-maroon hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    {t("ways.courses.cta")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Free Classes */}
            <ScrollReveal delay={150}>
              <div
                id="free-classes"
                className="group bg-[linear-gradient(165deg,var(--color-maroon)_0%,var(--color-maroon-deep)_100%)] text-[#F8E9CE] rounded-2xl p-7 flex flex-col gap-4 h-full relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-maroon/40 hover:-translate-y-1"
              >
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />

                <span className="inline-flex self-start text-xs font-bold px-3 py-1 rounded-full bg-white/15 relative">
                  {t("ways.free.badge")}
                </span>
                <h3 className="font-display text-xl font-semibold relative">
                  {t("ways.free.title")}
                </h3>
                <p className="text-[#EAD3B0] text-sm leading-relaxed relative">
                  {t("ways.free.text")}
                </p>
                <ul className="space-y-2.5 mt-1 relative">
                  {pointKeys.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
                      {t(`ways.free.${p}`)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5 border-t border-white/20 flex items-center justify-between flex-wrap gap-3 relative">
                  <span className="text-sm text-[#EAD3B0] font-medium">
                    {t("ways.free.label")}
                  </span>
                  <button
                    type="button"
                    onClick={() => goTo("/student/free-classes")}
                    className="text-sm font-semibold text-ivory hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    {t("ways.free.cta")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Specific Puja */}
            <ScrollReveal delay={300}>
              <div
                id="specific-puja"
                className="group bg-surface border-2 border-border rounded-2xl p-7 flex flex-col gap-4 h-full transition-all duration-300 hover:border-gold hover:shadow-xl hover:-translate-y-1"
              >
                <span className="inline-flex self-start items-center gap-1.5 text-xs font-bold text-goldDeep bg-goldSoft/30 px-3 py-1 rounded-full">
                  <Flame size={12} /> {t("ways.specific.badge")}
                </span>
                <h3 className="font-display text-xl font-semibold">
                  {t("ways.specific.title")}
                </h3>
                <p className="text-inkSoft text-sm leading-relaxed">
                  {t("ways.specific.text")}
                </p>
                <ul className="space-y-2.5 mt-1">
                  {pointKeys.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2
                        size={17}
                        className="text-goldDeep shrink-0 mt-0.5"
                      />
                      {t(`ways.specific.${p}`)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
                  <span className="text-sm text-inkSoft font-medium">
                    {t("ways.specific.label")}
                  </span>
                  <button
                    type="button"
                    onClick={() => goTo("/student/specific-puja")}
                    className="text-sm font-semibold text-maroon hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    {t("ways.specific.cta")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════ FEATURED COURSES ═══════════ */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <ScrollReveal>
              <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
                <div className="max-w-xl">
                  <span className="text-xs font-bold text-maroon tracking-wider uppercase mb-3 block">
                    {t("popular.eyebrow")}
                  </span>
                  <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                    {t("popular.heading")}
                  </h2>
                  <p className="text-inkSoft mt-3">{t("popular.subtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    goTo("/student/courses", { guestPath: "/register" })
                  }
                  className="text-sm font-semibold text-maroon hover:underline whitespace-nowrap inline-flex items-center gap-1"
                >
                  {t("popular.viewAll")}
                  <ArrowRight size={14} />
                </button>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((c, i) => (
                <ScrollReveal key={c.key} delay={i * 150}>
                  <div className="group bg-ivory border border-border rounded-xl p-5 flex flex-col gap-3 h-full transition-all duration-300 hover:border-maroon hover:shadow-xl hover:-translate-y-1">
                    {/* Course header */}
                    <div className="flex items-start justify-between">
                      <span className="inline-flex text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
                        {t(`popular.items.${c.key}.category`)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-goldDeep bg-goldSoft/30 px-2 py-1 rounded-full">
                        <Award size={12} />
                        {c.level}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-maroon transition-colors">
                      {t(`popular.items.${c.key}.title`)}
                    </h3>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-xs text-inkSoft">
                      <span className="flex items-center gap-1">
                        <Video size={12} className="text-maroon" />
                        {c.lessons} {t("popular.lessons")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-maroon" />
                        {c.hours} {t("popular.hours")}
                      </span>
                    </div>

                    <p className="text-sm text-inkSoft flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-maroon shrink-0" />
                      {t(`popular.items.${c.key}.teacher`)}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={12}
                            className="text-gold fill-gold"
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-ink">
                        {c.rating}
                      </span>
                      <span className="text-inkSoft">
                        ({c.students} {t("popular.students")})
                      </span>
                    </div>

                    <p className="text-sm text-inkSoft flex items-center gap-1.5">
                      <Calendar size={14} className="text-maroon shrink-0" />
                      {t(`popular.items.${c.key}.schedule`)}
                    </p>

                    {/* Footer with price */}
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-xs text-inkSoft line-through mr-1.5">
                          {c.oldPrice}
                        </span>
                        <span className="font-display text-lg font-semibold text-maroon">
                          {c.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          goTo("/student/courses", { guestPath: "/register" })
                        }
                        className="text-xs font-semibold text-ivory bg-maroon hover:bg-maroonDeep px-3.5 py-2 rounded-lg transition-all hover:shadow-md"
                      >
                        {t("popular.enroll")}
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ TEACHERS ═══════════ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <ScrollReveal>
            <div className="max-w-xl mb-12">
              <span className="text-xs font-bold text-maroon tracking-wider uppercase mb-3 block">
                {t("teachers.eyebrow")}
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                {t("teachers.heading")}
              </h2>
              <p className="text-inkSoft mt-3">{t("teachers.subtitle")}</p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {teacherKeys.map((key, i) => (
              <ScrollReveal key={key} delay={i * 150}>
                <div className="group flex flex-col items-center text-center gap-3 p-6 bg-surface border border-border rounded-xl h-full transition-all duration-300 hover:border-maroon hover:shadow-lg hover:-translate-y-1">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-maroon to-maroonDeep text-ivory flex items-center justify-center font-display font-semibold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {t(`teachers.items.${key}.initials`)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-surface flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-lg mt-2 group-hover:text-maroon transition-colors">
                    {t(`teachers.items.${key}.name`)}
                  </h3>
                  <p className="text-sm text-inkSoft">
                    {t(`teachers.items.${key}.focus`)}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-inkSoft">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-gold fill-gold" />
                      {t(`teachers.items.${key}.rating`)}
                    </span>
                    <span>·</span>
                    <span>
                      {t(`teachers.items.${key}.experience`)}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <ScrollReveal>
              <div className="max-w-xl mb-12">
                <span className="text-xs font-bold text-maroon tracking-wider uppercase mb-3 block">
                  {t("reviews.eyebrow")}
                </span>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                  {t("reviews.heading")}
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewKeys.map((key, i) => (
                <ScrollReveal key={key} delay={i * 150}>
                  <blockquote className="bg-ivory border border-border rounded-xl p-6 sm:p-7 h-full flex flex-col transition-all duration-300 hover:border-maroon hover:shadow-lg">
                    {/* Rating */}
                    <div className="flex items-center gap-0.5 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={14}
                          className="text-gold fill-gold"
                        />
                      ))}
                    </div>

                    <p className="text-ink text-[0.95rem] leading-relaxed flex-1">
                      &ldquo;{t(`reviews.items.${key}.quote`)}&rdquo;
                    </p>

                    <footer className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-maroonDeep text-ivory flex items-center justify-center font-semibold text-sm shrink-0">
                        {t(`reviews.items.${key}.initials`)}
                      </div>
                      <div>
                        <div className="font-semibold text-ink text-sm">
                          {t(`reviews.items.${key}.name`)}
                        </div>
                        <div className="text-xs text-inkSoft flex items-center gap-1">
                          <MapPin size={10} />
                          {t(`reviews.items.${key}.location`)}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ TRUST STRIP ═══════════ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <ScrollReveal>
            <div className="grid sm:grid-cols-3 gap-8 text-center sm:text-left">
              {[
                { key: "curriculum", Icon: BookOpen },
                { key: "live", Icon: Users },
                { key: "language", Icon: Globe2 },
              ].map(({ key, Icon }) => (
                <div
                  key={key}
                  className="group flex flex-col sm:flex-row items-center sm:items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-maroon/5 flex items-center justify-center shrink-0 group-hover:bg-maroon/10 transition-colors">
                    <Icon size={22} className="text-maroon" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold">
                      {t(`trust.${key}.title`)}
                    </h4>
                    <p className="text-sm text-inkSoft mt-1">
                      {t(`trust.${key}.text`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ═══════════ CTA BANNER ═══════════ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <ScrollReveal>
            <div className="relative bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] rounded-2xl px-6 sm:px-12 py-12 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-maroon/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sidebar-active)] mb-3 justify-center lg:justify-start">
                  <Heart size={16} />
                  {t("cta.badge")}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-md">
                  {t("cta.title")}
                </h2>
                <p className="text-sm opacity-70 mt-3 max-w-md">
                  {t("cta.subtitle")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative">
                <button
                  type="button"
                  onClick={() =>
                    goTo("/student", { guestPath: "/register" })
                  }
                  className="bg-[var(--sidebar-active)] text-[#2B1B0E] text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:opacity-90 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {t("cta.create")}
                </button>
                <Link
                  href="/login"
                  className="border border-white/25 text-[var(--sidebar-ink)] text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:bg-white/5 transition-colors"
                >
                  {t("cta.login")}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}