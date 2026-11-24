"use client";

import { ArrowRight, Clock, Flame, UserCheck, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ScrollReveal";
import { useServiceLink } from "@/components/Useservicelink";

export default function SpecificPujaSection({ pujas = [], loading = false }) {
  const t = useTranslations("home.pujaSection");
  const goTo = useServiceLink();

  return (
    <section id="specific-puja" className="bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
            <div className="max-w-xl">
              <span className="text-xs font-bold text-goldDeep tracking-wider uppercase mb-3 block">
                {t("eyebrow")}
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
                {t("heading")}
              </h2>
              <p className="text-inkSoft mt-3">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => goTo("/student/specific-puja")}
              className="text-sm font-semibold text-maroon hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              {t("viewAll")}
              <ArrowRight size={14} />
            </button>
          </div>
        </ScrollReveal>

        {loading ? (
          <SkeletonGrid />
        ) : pujas.length === 0 ? (
          <EmptyState label={t("empty")} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pujas.map((p, i) => (
              <ScrollReveal key={p._id} delay={i * 120}>
                <article className="group bg-ivory border-2 border-border rounded-xl p-5 flex flex-col gap-3 h-full transition-all duration-300 hover:border-gold hover:shadow-xl hover:-translate-y-1">
                  <span className="inline-flex self-start items-center gap-1.5 text-xs font-bold text-goldDeep bg-goldSoft/30 px-2.5 py-1 rounded-full">
                    <Flame size={12} /> {t("badge")}
                  </span>

                  <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-maroon transition-colors">
                    {p.name}
                  </h3>

                  <p className="text-sm text-inkSoft leading-relaxed line-clamp-3">
                    {p.description}
                  </p>

                  <ul className="space-y-2 text-sm text-inkSoft mt-1">
                    <li className="flex items-center gap-2">
                      <Clock size={14} className="text-goldDeep shrink-0" />
                      {p.durationMinutes} {t("mins")}
                    </li>
                    <li className="flex items-center gap-2">
                      <UserCheck size={14} className="text-goldDeep shrink-0" />
                      {p.teacher?.name}
                    </li>
                    {p.availabilityNote && (
                      <li className="flex items-center gap-2">
                        <Info size={14} className="text-goldDeep shrink-0" />
                        {p.availabilityNote}
                      </li>
                    )}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-display text-lg font-semibold text-maroon">
                      {formatPrice(p.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => goTo("/student/specific-puja")}
                      className="text-xs font-semibold text-ivory bg-maroon hover:bg-maroonDeep px-3.5 py-2 rounded-lg transition-all hover:shadow-md"
                    >
                      {t("book")}
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
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
        <div key={i} className="bg-border/40 rounded-xl h-60 animate-pulse" />
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