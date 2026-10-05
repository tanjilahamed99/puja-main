"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, BookOpen, Users, Globe2, Heart, Sparkles, Flame } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useServiceLink } from "@/components/Useservicelink";

/* Only language-independent data stays here (numbers, prices, ids).
   All visible text comes from messages/*.json → "home". */
const stats = [
  { key: "courses", value: "40+" },
  { key: "students", value: "1,200+" },
  { key: "sessions", value: "120" },
  { key: "languages", value: "3" },
];

const stepKeys = ["choose", "meet", "track"];
const pointKeys = ["p1", "p2", "p3"];

const featuredCourses = [
  { key: "griha", price: "৳1,499" },
  { key: "durga", price: "৳1,999" },
  { key: "everyday", price: "৳999" },
];

const teacherKeys = ["sharma", "joshi", "chatterjee"];
const reviewKeys = ["ritika", "abir"];

export default function HomePage() {
  const goTo = useServiceLink();
  const t = useTranslations("home");

  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-maroonDeep mb-5">
                <Sparkles size={16} />
                {t("hero.badge")}
              </div>
              {/* Hindi needs a bit more line-height than Latin; leading-[1.08] clips matras */}
              <h1 className="font-display font-semibold text-ink leading-[1.2] text-4xl sm:text-5xl lg:text-[3.4rem] max-w-xl">
                {t("hero.title")}
              </h1>
              <p className="text-inkSoft text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => goTo("/student/courses", { guestPath: "/register" })}
                  className="bg-maroon text-ivory text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:opacity-90 transition"
                >
                  {t("hero.browse")}
                </button>
                <button
                  type="button"
                  onClick={() => goTo("/student/free-classes")}
                  className="border border-border text-ink text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:border-maroon transition-colors"
                >
                  {t("hero.freeClass")}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-border">
                {stats.map((s) => (
                  <div key={s.key}>
                    <p className="font-display text-2xl sm:text-3xl font-semibold text-maroon">{s.value}</p>
                    <p className="text-xs sm:text-sm text-inkSoft mt-1">{t(`stats.${s.key}`)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-[0_18px_40px_-20px_rgba(140,47,27,0.25)] relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-2xl"
                  style={{ background: "radial-gradient(circle, rgba(244,200,106,0.5), transparent 65%)" }}
                />
                <svg viewBox="0 0 240 220" className="relative w-full h-auto" aria-hidden="true">
                  <ellipse cx="120" cy="170" rx="78" ry="18" fill="var(--color-gold)" opacity="0.22" />
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
                  />
                  <path
                    d="M120 100c-7-10-8-18-2-26 1 7 5 10 9 12 2-4 1-9-1-13 8 6 12 13 12 21 0 8-7 14-16 14-5 0-9-3-9-7 0-2 1-4 3-7z"
                    fill="#F8E39A"
                  />
                </svg>
                <p className="text-center text-sm text-inkSoft mt-2 relative">{t("hero.todayClass")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-xl mb-12">
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">{t("how.heading")}</h2>
              <p className="text-inkSoft mt-3">{t("how.subtitle")}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
              {stepKeys.map((key, i) => (
                <div key={key} className="border-t-2 border-maroon pt-5">
                  <span className="font-display text-xl font-semibold text-goldDeep">0{i + 1}</span>
                  <h3 className="font-display font-semibold text-lg mt-2">{t(`how.steps.${key}.title`)}</h3>
                  <p className="text-inkSoft text-sm mt-2 leading-relaxed">{t(`how.steps.${key}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three ways to learn */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-12">
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">{t("ways.heading")}</h2>
            <p className="text-inkSoft mt-3">{t("ways.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Subscription Courses */}
            <div id="courses" className="bg-surface border border-border rounded-2xl p-7 flex flex-col gap-4">
              <span className="inline-flex self-start text-xs font-bold text-maroon bg-[#F7E5E5] px-3 py-1 rounded-full">
                {t("ways.courses.badge")}
              </span>
              <h3 className="font-display text-xl font-semibold">{t("ways.courses.title")}</h3>
              <p className="text-inkSoft text-sm leading-relaxed">{t("ways.courses.text")}</p>
              <ul className="space-y-2.5 mt-1">
                {pointKeys.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="text-maroon shrink-0 mt-0.5" />
                    {t(`ways.courses.${p}`)}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm text-inkSoft">{t("ways.courses.label")}</span>
                <button
                  type="button"
                  onClick={() => goTo("/student/courses", { guestPath: "/register" })}
                  className="text-sm font-semibold text-maroon hover:underline"
                >
                  {t("ways.courses.cta")}
                </button>
              </div>
            </div>

            {/* Free Classes */}
            <div
              id="free-classes"
              className="bg-[linear-gradient(165deg,var(--color-maroon)_0%,var(--color-maroon-deep)_100%)] text-[#F8E9CE] rounded-2xl p-7 flex flex-col gap-4"
            >
              <span className="inline-flex self-start text-xs font-bold px-3 py-1 rounded-full bg-white/15">
                {t("ways.free.badge")}
              </span>
              <h3 className="font-display text-xl font-semibold">{t("ways.free.title")}</h3>
              <p className="text-[#EAD3B0] text-sm leading-relaxed">{t("ways.free.text")}</p>
              <ul className="space-y-2.5 mt-1">
                {pointKeys.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
                    {t(`ways.free.${p}`)}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5 border-t border-white/20 flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm text-[#EAD3B0]">{t("ways.free.label")}</span>
                <button
                  type="button"
                  onClick={() => goTo("/student/free-classes")}
                  className="text-sm font-semibold text-ivory hover:underline"
                >
                  {t("ways.free.cta")}
                </button>
              </div>
            </div>

            {/* Specific Puja */}
            <div id="specific-puja" className="bg-surface border border-border rounded-2xl p-7 flex flex-col gap-4">
              <span className="inline-flex self-start items-center gap-1.5 text-xs font-bold text-goldDeep bg-goldSoft/30 px-3 py-1 rounded-full">
                <Flame size={12} /> {t("ways.specific.badge")}
              </span>
              <h3 className="font-display text-xl font-semibold">{t("ways.specific.title")}</h3>
              <p className="text-inkSoft text-sm leading-relaxed">{t("ways.specific.text")}</p>
              <ul className="space-y-2.5 mt-1">
                {pointKeys.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="text-maroon shrink-0 mt-0.5" />
                    {t(`ways.specific.${p}`)}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm text-inkSoft">{t("ways.specific.label")}</span>
                <button
                  type="button"
                  onClick={() => goTo("/student/specific-puja")}
                  className="text-sm font-semibold text-maroon hover:underline"
                >
                  {t("ways.specific.cta")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured courses */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
              <div className="max-w-xl">
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">{t("popular.heading")}</h2>
                <p className="text-inkSoft mt-3">{t("popular.subtitle")}</p>
              </div>
              <button
                type="button"
                onClick={() => goTo("/student/courses", { guestPath: "/register" })}
                className="text-sm font-semibold text-maroon hover:underline whitespace-nowrap"
              >
                {t("popular.viewAll")}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((c) => (
                <div key={c.key} className="bg-ivory border border-border rounded-xl p-5 flex flex-col gap-3">
                  <span className="inline-flex self-start text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
                    {t(`popular.items.${c.key}.category`)}
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-snug">{t(`popular.items.${c.key}.title`)}</h3>
                  <p className="text-sm text-inkSoft">{t(`popular.items.${c.key}.teacher`)}</p>
                  <p className="text-sm text-inkSoft">{t(`popular.items.${c.key}.schedule`)}</p>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{c.price}</span>
                    <button
                      type="button"
                      onClick={() => goTo("/student/courses", { guestPath: "/register" })}
                      className="text-xs font-semibold text-maroon hover:underline"
                    >
                      {t("popular.enroll")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Teachers */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-12">
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">{t("teachers.heading")}</h2>
            <p className="text-inkSoft mt-3">{t("teachers.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {teacherKeys.map((key) => (
              <div key={key} className="flex flex-col items-center text-center gap-3 p-6 bg-surface border border-border rounded-xl">
                <div className="w-14 h-14 rounded-full bg-maroon text-ivory flex items-center justify-center font-display font-semibold text-lg">
                  {t(`teachers.items.${key}.initials`)}
                </div>
                <h3 className="font-display font-semibold">{t(`teachers.items.${key}.name`)}</h3>
                <p className="text-sm text-inkSoft">{t(`teachers.items.${key}.focus`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-xl mb-12">
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">{t("reviews.heading")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {reviewKeys.map((key) => (
                <blockquote key={key} className="bg-ivory border border-border rounded-xl p-6 sm:p-7">
                  <p className="text-ink text-[0.95rem] leading-relaxed">&ldquo;{t(`reviews.items.${key}.quote`)}&rdquo;</p>
                  <footer className="mt-5 text-sm">
                    <span className="font-semibold text-ink">{t(`reviews.items.${key}.name`)}</span>
                    <span className="text-inkSoft"> · {t(`reviews.items.${key}.role`)}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <div className="grid sm:grid-cols-3 gap-8 text-center sm:text-left">
            {[
              { key: "curriculum", Icon: BookOpen },
              { key: "live", Icon: Users },
              { key: "language", Icon: Globe2 },
            ].map(({ key, Icon }) => (
              <div key={key} className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <Icon size={22} className="text-maroon shrink-0" />
                <div>
                  <h4 className="font-display font-semibold">{t(`trust.${key}.title`)}</h4>
                  <p className="text-sm text-inkSoft mt-1">{t(`trust.${key}.text`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <div className="bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] rounded-2xl px-6 sm:px-12 py-12 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sidebar-active)] mb-3 justify-center lg:justify-start">
                <Heart size={16} />
                {t("cta.badge")}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-md">{t("cta.title")}</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={() => goTo("/student", { guestPath: "/register" })}
                className="bg-[var(--sidebar-active)] text-[#2B1B0E] text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:opacity-90 transition"
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
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
