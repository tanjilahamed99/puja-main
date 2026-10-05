"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/action/locale";

const options = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
];

export default function LangSwitcher() {
  const locale = useLocale();
  const t = useTranslations("lang");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (code) => {
    if (code === locale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh(); // re-render server + client components in the new language
    });
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={
        "inline-flex rounded-full border border-border bg-surface p-0.5 text-xs " +
        (pending ? "opacity-70" : "")
      }
    >
      {options.map(({ code, label }) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => change(code)}
            className={
              "rounded-full px-3 py-1.5 font-semibold transition-colors " +
              (active ? "bg-maroon text-ivory" : "text-inkSoft hover:text-ink")
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
