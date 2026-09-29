"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import { Heart } from "lucide-react";
import { browseFreeClasses, joinFreeClass, donateToFreeClass } from "@/action/student";

function formatSessionTime(dateTime) {
  if (!dateTime) return "Time TBD";
  return new Date(dateTime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FreeClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await browseFreeClasses();
        const withUiState = (data.freeClasses || []).map((c) => ({
          ...c,
          joined: false,
          donated: false,
          submittingJoin: false,
          submittingDonate: false,
          joinError: "",
          donateError: "",
          amount: "",
          method: "phonepe",
          liveKitRoomId: null,
        }));
        setClasses(withUiState);
      } catch (err) {
        setLoadError(
          err?.response?.data?.message || "Could not load free classes. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const patchClass = (id, patch) => {
    setClasses((prev) => prev.map((c) => (c._id === id ? { ...c, ...patch } : c)));
  };

  const join = async (id) => {
    patchClass(id, { submittingJoin: true, joinError: "" });
    try {
      const { data } = await joinFreeClass(id);
      patchClass(id, { joined: true, liveKitRoomId: data.liveKitRoomId || null });
    } catch (err) {
      const message = err?.response?.data?.message || "";
      patchClass(id, {
        joinError: message.includes("already exists")
          ? "You've already joined this class."
          : message || "Could not join this class. Please try again.",
      });
    } finally {
      patchClass(id, { submittingJoin: false });
    }
  };

  const donate = async (id, amount, method) => {
    if (!amount || Number(amount) <= 0) return;
    patchClass(id, { submittingDonate: true, donateError: "" });
    try {
      await donateToFreeClass(id, { amount: Number(amount), method });
      patchClass(id, { donated: true });
    } catch (err) {
      patchClass(id, {
        donateError:
          err?.response?.data?.message || "Could not process the donation. Please try again.",
      });
    } finally {
      patchClass(id, { submittingDonate: false });
    }
  };

  return (
    <>
      <Topbar title="Free Classes" subtitle="Open to any logged-in member — no purchase needed" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Upcoming Free Classes"
          description="Join a session for free. A donation box appears once the class ends, entirely optional."
        />

        {loading && <p className="text-sm text-inkSoft">Loading free classes…</p>}

        {!loading && loadError && <p className="text-sm text-danger">{loadError}</p>}

        {!loading && !loadError && classes.length === 0 && (
          <p className="text-sm text-inkSoft">No free classes are scheduled right now.</p>
        )}

        {!loading && !loadError && classes.length > 0 && (
          <div className="space-y-4">
            {classes.map((c) => (
              <div key={c._id} className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-display font-semibold">{c.title}</h3>
                    <p className="text-sm text-inkSoft mt-0.5">
                      {c.teacher?.name || "Teacher TBD"} · {formatSessionTime(c.dateTime)}
                    </p>
                  </div>
                  {!c.joined ? (
                    <button
                      type="button"
                      onClick={() => join(c._id)}
                      disabled={c.submittingJoin}
                      className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                    >
                      {c.submittingJoin ? "Joining…" : "Join Class"}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-success">Joined</span>
                  )}
                </div>

                {c.joinError && <p className="text-sm text-danger mt-3">{c.joinError}</p>}

                {c.joined && c.liveKitRoomId && (
                  <p className="text-xs text-inkSoft mt-2">
                    Session room: <span className="font-mono">{c.liveKitRoomId}</span>
                  </p>
                )}

                {c.joined && !c.donated && (
                  <div className="mt-4 pt-4 border-t border-border bg-ivorySoft -mx-5 -mb-5 px-5 py-4 rounded-b-xl">
                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Heart size={16} className="text-maroon" />
                      Enjoyed the class? Consider a donation to support the platform.
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="number"
                        min="1"
                        placeholder="Amount (৳)"
                        value={c.amount}
                        onChange={(e) => patchClass(c._id, { amount: e.target.value })}
                        className="input w-32"
                      />
                      <select
                        value={c.method}
                        onChange={(e) => patchClass(c._id, { method: e.target.value })}
                        className="input w-auto"
                      >
                        <option value="phonepe">PhonePe</option>
                        <option value="paypal">PayPal</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => donate(c._id, c.amount, c.method)}
                        disabled={c.submittingDonate || !c.amount}
                        className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                      >
                        {c.submittingDonate ? "Processing…" : "Donate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => patchClass(c._id, { donated: true })}
                        className="text-sm text-inkSoft font-medium"
                      >
                        Skip
                      </button>
                    </div>
                    {c.donateError && <p className="text-sm text-danger mt-2">{c.donateError}</p>}
                  </div>
                )}

                {c.donated && (
                  <p className="mt-4 pt-4 border-t border-border text-sm text-success font-medium">
                    Thank you! 🙏
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}