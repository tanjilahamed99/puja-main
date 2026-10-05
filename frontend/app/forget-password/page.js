"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  MailCheck,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Wire this up to a forgot-password action once that endpoint exists:
      // await requestPasswordReset({ email });
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSent(true);
      toast.success(t("toast.success"), {
        description: t("toast.checkEmail", { email }),
      });
    } catch (err) {
      const message = err?.response?.data?.message || t("error.generic");
      setError(message);
      toast.error(t("toast.error"), { description: message });
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    toast.success(t("toast.resent"));
  };

  /* ═══════ Branding panel data ═══════ */
  const steps = [
    { icon: Mail, text: t("brand.step1") },
    { icon: KeyRound, text: t("brand.step2") },
    { icon: CheckCircle2, text: t("brand.step3") },
  ];

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-ivory">
      {/* ═══════ Branding Panel (Desktop) ═══════ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-gradient-to-br from-[var(--sidebar-bg)] via-[var(--sidebar-bg)] to-[#1a0f08] text-[var(--sidebar-ink)] flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-maroon/20 rounded-full blur-3xl" />

        {/* Top: Logo */}
        <div className="relative flex items-center gap-3">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-wide">
            Karmkand Bharti
          </span>
        </div>

        {/* Middle: Hero copy */}
        <div className="relative max-w-md my-auto py-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold bg-gold/10 px-3 py-1.5 rounded-full border border-gold/20 mb-6">
            <ShieldCheck size={12} />
            {t("brand.badge")}
          </div>

          <h2 className="font-display text-3xl xl:text-4xl font-semibold leading-[1.2]">
            {t("brand.title")}
          </h2>

          <p className="text-[var(--sidebar-ink-soft)] mt-4 text-sm leading-relaxed">
            {t("brand.subtitle")}
          </p>

          {/* Recovery steps */}
          <div className="mt-8 space-y-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-[var(--sidebar-ink-soft)]"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-gold" />
                  </span>
                  {s.text}
                </div>
              );
            })}
          </div>

          {/* Security note */}
          <div className="mt-10 pt-8 border-t border-white/10 flex items-start gap-3 text-xs text-[var(--sidebar-ink-soft)]">
            <ShieldCheck
              size={16}
              className="text-green-400 shrink-0 mt-0.5"
            />
            <p className="leading-relaxed">
              {t("brand.securityNote")}
            </p>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <p className="relative text-xs text-[var(--sidebar-ink-soft)] opacity-70">
          &copy; {new Date().getFullYear()} Karmkand Bharti
        </p>
      </div>

      {/* ═══════ Form Panel ═══════ */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 relative">
        {/* Subtle background pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-maroon) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="w-full max-w-sm relative">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Logo />
            <span className="font-display text-lg font-semibold text-ink">
              Karmkand Bharti
            </span>
          </div>

          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon transition-colors group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            {t("backToLogin")}
          </Link>

          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-maroon/5 flex items-center justify-center mb-4">
                  <KeyRound size={22} className="text-maroon" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                  {t("heading")}
                </h1>
                <p className="text-inkSoft text-sm mt-2">{t("subheading")}</p>
              </div>

              {/* Error alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-ink mb-2"
                  >
                    {t("email.label")}
                  </label>
                  <div className="relative group">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSoft pointer-events-none transition-colors group-focus-within:text-maroon"
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t("email.placeholder")}
                      className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-inkSoft/60 focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-maroon text-ivory py-3 rounded-xl text-sm font-semibold disabled:opacity-60 hover:bg-maroonDeep transition-all duration-300 hover:shadow-lg hover:shadow-maroon/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                      {t("button.loading")}
                    </>
                  ) : (
                    <>
                      {t("button.submit")}
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Help text */}
              <p className="text-xs text-inkSoft text-center mt-6 leading-relaxed">
                {t("help.text")}
              </p>
            </>
          ) : (
            /* ═══════ Success State ═══════ */
            <div className="text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto sm:mx-0 mb-5">
                <MailCheck size={26} />
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {t("success.heading")}
              </h1>

              <p className="text-inkSoft text-sm mt-2 leading-relaxed">
                {t("success.subheading1")}{" "}
                <span className="font-medium text-ink">{email}</span>
                {t("success.subheading2")}
              </p>

              {/* Info box */}
              <div className="mt-6 p-4 rounded-xl bg-surface border border-border">
                <div className="flex items-start gap-3 text-sm text-inkSoft">
                  <Clock size={16} className="text-maroon shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-ink mb-1">
                      {t("success.tipTitle")}
                    </p>
                    <p className="text-xs leading-relaxed">
                      {t("success.tipText")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={resendEmail}
                  disabled={loading}
                  className="flex-1 text-sm font-medium text-maroon border border-maroon/30 hover:bg-maroon/5 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {loading ? t("success.sending") : t("success.resend")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="flex-1 text-sm font-medium text-inkSoft border border-border hover:bg-surface px-4 py-2.5 rounded-xl transition-colors"
                >
                  {t("success.differentEmail")}
                </button>
              </div>

              {/* Back to login */}
              <div className="mt-8 pt-6 border-t border-border">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-maroon font-semibold hover:text-maroonDeep hover:underline transition-colors group"
                >
                  <ChevronLeft
                    size={14}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                  {t("success.backToLogin")}
                </Link>
              </div>
            </div>
          )}

          {/* Trust badges (only in form state) */}
          {!sent && (
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5 text-xs text-inkSoft">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-green-600" />
                <span>{t("trust.secure")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-maroon" />
                <span>{t("trust.fast")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}