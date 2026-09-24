"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { register } from "@/action/auth";
import { useAuthStore } from "@/features/Useauthstore";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password length must be 6 latter");
      return;
    }

    setLoading(true);
    try {
      const { data } = await register(form);
      if (data.success) {
        setAuth({ token: data.token, user: data.user });
        toast.success("Login successful");
        const role = data.user.role;
        if (role === "admin") router.push("/admin");
        else if (role === "student") router.push("/student");
        else if (role === "teacher") router.push("/teacher");
      }
    } catch (error) {
      console.log(error);
      setError(error.response.data.message || "");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Branding panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[42%] bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-2.5">
          <FlameMark />
          <span className="font-display text-xl font-semibold tracking-wide">
            Sanatan Path
          </span>
        </div>
        <div className="max-w-sm">
          <h2 className="font-display text-3xl xl:text-4xl font-semibold leading-tight">
            Start learning puja, live and guided.
          </h2>
          <p className="text-[var(--sidebar-ink-soft)] mt-4 text-sm leading-relaxed">
            Join free classes right away, or enroll in a full course whenever
            you&apos;re ready.
          </p>
        </div>
        <p className="text-xs text-[var(--sidebar-ink-soft)]">
          &copy; {new Date().getFullYear()} Sanatan Path
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Flame className="text-maroon" size={24} />
            <span className="font-display text-lg font-semibold text-ink">
              Sanatan Path
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
            Create your account
          </h1>
          <p className="text-inkSoft text-sm mt-2">
            Free to join — start with any open class.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-ink mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Your name"
                className="input"
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="input"
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-ink mb-2">
                Phone{" "}
                <span className="text-inkSoft font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                className="input"
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="input pr-11"
                  onChange={(e) => update("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inkSoft">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-inkSoft mt-8 text-center">
            Already have an account?
            <Link
              href="/login"
              className="text-maroon font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function FlameMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true">
      <path
        d="M16 3c1.6 3 2.4 5.4 1 7.6-.7 1.1-1 1.9-1 2.9 0 1.5 1.1 2.5 2.6 2.1 1.6-.5 2.4-2 2.4-3.9 2 2.2 3 4.8 3 7.3 0 4.7-3.6 8-8 8s-8-3.3-8-8c0-3.7 2.1-6.6 4.4-9.3C14.2 7.7 15.3 5.4 16 3z"
        fill="var(--sidebar-active)"
      />
    </svg>
  );
}
