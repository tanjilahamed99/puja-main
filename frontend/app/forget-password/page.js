'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Flame, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Wire this up to a forgot-password action once that endpoint exists on
    // the backend, e.g.: await requestPasswordReset({ email });
    await new Promise((resolve) => setTimeout(resolve, 600));

    setLoading(false);
    setSent(true);
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Branding panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[42%] bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-2.5">
          <FlameMark />
          <span className="font-display text-xl font-semibold tracking-wide">Sanatan Path</span>
        </div>
        <div className="max-w-sm">
          <h2 className="font-display text-3xl xl:text-4xl font-semibold leading-tight">
            Locked out happens to everyone.
          </h2>
          <p className="text-[var(--sidebar-ink-soft)] mt-4 text-sm leading-relaxed">
            Enter your email and we&apos;ll send you a link to get back into your account.
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
            <span className="font-display text-lg font-semibold text-ink">Sanatan Path</span>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
          >
            <ChevronLeft size={16} /> Back to login
          </Link>

          {!sent ? (
            <>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                Forgot your password?
              </h1>
              <p className="text-inkSoft text-sm mt-2">
                No worries — enter your email and we&apos;ll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-[#E4F0E6] text-success flex items-center justify-center mx-auto sm:mx-0 mb-5">
                <MailCheck size={22} />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Check your email</h1>
              <p className="text-inkSoft text-sm mt-2">
                If an account exists for <span className="font-medium text-ink">{email}</span>, a reset
                link is on its way.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm font-medium text-maroon hover:underline mt-6"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FlameMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3c1.6 3 2.4 5.4 1 7.6-.7 1.1-1 1.9-1 2.9 0 1.5 1.1 2.5 2.6 2.1 1.6-.5 2.4-2 2.4-3.9 2 2.2 3 4.8 3 7.3 0 4.7-3.6 8-8 8s-8-3.3-8-8c0-3.7 2.1-6.6 4.4-9.3C14.2 7.7 15.3 5.4 16 3z"
        fill="var(--sidebar-active)"
      />
    </svg>
  );
}