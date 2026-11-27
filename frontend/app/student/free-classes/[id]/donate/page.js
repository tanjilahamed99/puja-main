"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle2, Sparkles } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import { useFreeClass } from "@/lib/useFreeClass";
import { donateToFreeClass } from "@/action/student";

const PRESET_AMOUNTS = [51, 101, 251, 501];

export default function FreeClassDonatePage() {
  const params = useParams();
  const router = useRouter();
  const { freeClass, loading, notFound, error } = useFreeClass(params.id);

  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState(null); // which preset chip is active
  const [method, setMethod] = useState("phonepe");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [donated, setDonated] = useState(false);

  const handlePreset = (value) => {
    setPreset(value);
    setAmount(String(value));
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setPreset(null); // custom input overrides the preset selection
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      setSubmitError("Please enter a valid donation amount.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);
    try {
      await donateToFreeClass(params.id, { amount: numeric, method });
      setDonated(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Could not process the donation. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ loading ------------------------------ */

  if (loading) {
    return (
      <>
        <Topbar title="Loading…" />
        <main className="px-6 lg:px-10 py-8">
          <p className="text-sm text-inkSoft">Loading…</p>
        </main>
      </>
    );
  }

  /* ------------------------------ not found ------------------------------ */

  if (notFound || error) {
    return (
      <>
        <Topbar title="Thanks for joining!" />
        <main className="px-6 lg:px-10 py-8 max-w-lg">
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-inkSoft mb-4">
              We couldn&apos;t load this class&apos;s details, but thank you for
              attending.
            </p>
            <Link
              href="/student/free-classes"
              className="text-maroon font-medium text-sm hover:underline">
              Back to free classes
            </Link>
          </div>
        </main>
      </>
    );
  }

  /* ------------------------------ donated ------------------------------ */

  if (donated) {
    return (
      <>
        <Topbar title="Thank you!" subtitle={freeClass.title} />
        <main className="px-6 lg:px-10 py-8 max-w-xl mx-auto">
          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E4F0E6] text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="font-display text-xl font-semibold">
              Thank you! 🙏
            </h2>
            <p className="text-sm text-inkSoft mt-2">
              Your donation of{" "}
              <span className="font-semibold text-ink">
                ₹{Number(amount).toLocaleString("en-IN")}
              </span>{" "}
              helps keep these free classes running.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => router.push("/student/free-classes")}
                className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
                Back to free classes
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ------------------------------ form ------------------------------ */

  return (
    <>
      <Topbar title="Thanks for joining!" subtitle={freeClass.title} />
      <main className="px-6 lg:px-10 py-8 max-w-xl mx-auto">
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <Heart size={16} className="text-maroon" />
            Enjoyed {freeClass.title}?
          </div>
          <p className="text-sm text-inkSoft mb-6">
            Consider a donation to support{" "}
            {freeClass.teacher?.name || "the teacher"} and this platform —
            entirely optional.
          </p>

          <form onSubmit={handleDonate} className="space-y-5">
            {/* Preset amounts */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Choose an amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((value) => {
                  const active = preset === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePreset(value)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-maroon text-ivory border-maroon"
                          : "bg-surface border-border text-ink hover:border-maroon"
                      }`}>
                      ₹{value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Or enter a custom amount (₹)
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={handleAmountChange}
                placeholder="e.g. 200"
                className="input"
              />
              <p className="text-[11px] text-inkSoft mt-1">
                Every contribution, big or small, is appreciated.
              </p>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Payment method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="input">
                <option value="phonepe">PhonePe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {/* Trust note */}
            <div className="flex items-start gap-2 rounded-lg bg-[#F7F4EE] border border-border px-3 py-2.5">
              <Sparkles size={14} className="text-goldDeep mt-0.5 shrink-0" />
              <p className="text-xs text-inkSoft">
                100% of your donation goes directly to keeping free classes
                available for everyone.
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-danger">{submitError}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting || !amount}
                className="flex-1 bg-maroon text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                {submitting
                  ? "Processing…"
                  : amount
                    ? `Donate ₹${Number(amount).toLocaleString("en-IN")}`
                    : "Donate"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/student/free-classes")}
                className="text-sm font-medium text-inkSoft px-4 py-2.5 hover:text-ink">
                Skip
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
