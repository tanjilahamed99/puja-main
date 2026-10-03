"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle2 } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import { useFreeClass } from "@/lib/useFreeClass";
import { donateToFreeClass } from "@/action/student";

export default function FreeClassDonatePage() {
  const params = useParams();
  const router = useRouter();
  const { freeClass, loading, notFound, error } = useFreeClass(params.id);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("phonepe");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [donated, setDonated] = useState(false);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      await donateToFreeClass(params.id, { amount: Number(amount), method });
      setDonated(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Could not process the donation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              className="text-maroon font-medium text-sm hover:underline"
            >
              Back to free classes
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Thanks for joining!" subtitle={freeClass.title} />
      <main className="px-6 lg:px-10 py-8 max-w-lg">
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          {donated ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#E4F0E6] text-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={22} />
              </div>
              <h2 className="font-display text-xl font-semibold">
                Thank you! 🙏
              </h2>
              <p className="text-sm text-inkSoft mt-2">
                Your donation helps keep these free classes running.
              </p>
              <button
                type="button"
                onClick={() => router.push("/student/free-classes")}
                className="mt-6 text-sm font-semibold text-maroon hover:underline"
              >
                Back to free classes
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Heart size={16} className="text-maroon" />
                Enjoyed {freeClass.title}?
              </div>
              <p className="text-sm text-inkSoft mb-6">
                Consider a donation to support{" "}
                {freeClass.teacher?.name || "the teacher"} and this platform —
                entirely optional.
              </p>

              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Amount (৳)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 200"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Payment method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="input"
                  >
                    <option value="phonepe">PhonePe</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {submitError && (
                  <p className="text-sm text-danger">{submitError}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-maroon text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  >
                    {submitting ? "Processing…" : "Donate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/student/free-classes")}
                    className="text-sm font-medium text-inkSoft px-4 py-2.5"
                  >
                    Skip
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}