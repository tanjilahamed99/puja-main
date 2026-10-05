"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { login } from "@/action/auth";
import { toast } from "sonner";
import { useAuthStore } from "@/features/Useauthstore";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await login(form);
      if (data.success) {
        setAuth({ token: data.token, user: data.user });

        if (remember) {
          localStorage.setItem("rememberMe", "true");
        }

        toast.success(t("toast.success"), {
          description: t("toast.welcome", { name: data.user.name }),
        });

        const role = data.user.role;
        if (role === "admin") router.push("/admin");
        else if (role === "student") router.push("/student");
        else if (role === "teacher") router.push("/teacher");
        else router.push("/");
      }
    } catch (err) {
      console.log(err);
      const message = err?.response?.data?.message || t("error.generic");
      setError(message);
      toast.error(t("toast.error"), { description: message });
    } finally {
      setLoading(false);
    }
  };

  /* ═══════ Branding panel data ═══════ */
  const features = [
    { icon: BookOpen, text: t("brand.feature1") },
    { icon: Users, text: t("brand.feature2") },
    { icon: ShieldCheck, text: t("brand.feature3") },
  ];

  const testimonials = [
    { name: "Ritika S.", initials: "RS", text: t("brand.review1") },
    { name: "Abir H.", initials: "AH", text: t("brand.review2") },
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
            <Sparkles size={12} />
            {t("brand.badge")}
          </div>

          <h2 className="font-display text-3xl xl:text-4xl font-semibold leading-[1.2]">
            {t("brand.title")}
          </h2>

          <p className="text-[var(--sidebar-ink-soft)] mt-4 text-sm leading-relaxed">
            {t("brand.subtitle")}
          </p>

          {/* Features list */}
          <ul className="mt-8 space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-[var(--sidebar-ink-soft)]"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-gold" />
                  </span>
                  {f.text}
                </li>
              );
            })}
          </ul>

          {/* Mini testimonials */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-gold fill-gold" />
              ))}
              <span className="text-xs text-[var(--sidebar-ink-soft)] ml-2">
                {t("brand.ratedBy")}
              </span>
            </div>

            <div className="space-y-3">
              {testimonials.map((tm, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-maroon text-[#2B1B0E] flex items-center justify-center text-xs font-bold shrink-0">
                    {tm.initials}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--sidebar-ink-soft)] leading-relaxed italic">
                      &ldquo;{tm.text}&rdquo;
                    </p>
                    <p className="text-[10px] text-[var(--sidebar-ink-soft)] mt-1 opacity-70">
                      — {tm.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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

          {/* Header */}
          <div className="mb-8">
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
            {/* Email */}
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
                  placeholder={t("email.placeholder")}
                  value={form.email}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-inkSoft/60 focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon transition-all"
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-ink"
                >
                  {t("password.label")}
                </label>
                <Link
                  href="/forget-password"
                  className="text-xs font-medium text-maroon hover:text-maroonDeep transition-colors"
                >
                  {t("password.forgot")}
                </Link>
              </div>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSoft pointer-events-none transition-colors group-focus-within:text-maroon"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder={t("password.placeholder")}
                  value={form.password}
                  className="w-full pl-11 pr-11 py-3 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-inkSoft/60 focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon transition-all"
                  onChange={(e) => update("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? t("password.hide") : t("password.show")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inkSoft hover:text-maroon transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-inkSoft cursor-pointer select-none group">
                <span className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="w-4 h-4 rounded border border-border bg-surface peer-checked:bg-maroon peer-checked:border-maroon flex items-center justify-center transition-all">
                    {remember && (
                      <CheckCircle2
                        size={12}
                        className="text-ivory"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                </span>
                <span className="group-hover:text-ink transition-colors">
                  {t("remember")}
                </span>
              </label>
            </div>

            {/* Submit */}
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

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-ivory text-xs text-inkSoft uppercase tracking-wider">
                {t("or")}
              </span>
            </div>
          </div>

          {/* Register CTA */}
          <p className="text-sm text-inkSoft text-center">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="text-maroon font-semibold hover:text-maroonDeep hover:underline transition-colors inline-flex items-center gap-1"
            >
              {t("registerLink")}
              <ArrowRight size={12} />
            </Link>
          </p>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5 text-xs text-inkSoft">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-600" />
              <span>{t("trust.secure")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-maroon" />
              <span>{t("trust.users")}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}