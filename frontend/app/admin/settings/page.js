"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import {
  KeyRound,
  Link2,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";
import {
  getLiveKitSettings,
  updateLiveKitSettings,
} from "@/action/admin";

export default function LiveKitSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    url: "",
    apiKey: "",
    apiSecret: "",
  });
  const [showSecret, setShowSecret] = useState(false);

  const [feedback, setFeedback] = useState(null); // { type: "success"|"error", msg }

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setFeedback(null);
      try {
        const { data } = await getLiveKitSettings();
        if (cancelled) return;
        setForm({
          url: data?.url || "",
          apiKey: data?.apiKey || "",
          apiSecret: data?.apiSecret || "",
        });
      } catch (err) {
        if (cancelled) return;
        setFeedback({
          type: "error",
          msg:
            err?.response?.data?.message ||
            "Could not load LiveKit settings.",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFeedback(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.url.trim() || !form.apiKey.trim() || !form.apiSecret.trim()) {
      setFeedback({
        type: "error",
        msg: "Server URL, API Key and API Secret are all required.",
      });
      return;
    }

    if (!/^wss?:\/\//i.test(form.url.trim())) {
      setFeedback({
        type: "error",
        msg: "Server URL must start with ws:// or wss://",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await updateLiveKitSettings({
        url: form.url.trim(),
        apiKey: form.apiKey.trim(),
        apiSecret: form.apiSecret.trim(),
      });
      setFeedback({ type: "success", msg: "LiveKit settings saved." });
    } catch (err) {
      setFeedback({
        type: "error",
        msg:
          err?.response?.data?.message ||
          "Could not save LiveKit settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar
        title="LiveKit Settings"
        subtitle="Server credentials used for all live classes and private pujas"
      />
      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <PageHeader
          title="LiveKit Credentials"
          description="These values power every live session (courses, free classes, specific puja). Changes apply immediately to newly issued tokens."
        />

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-inkSoft">
            <Loader2 className="animate-spin" size={16} />
            Loading settings…
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-surface border border-border rounded-xl p-6 space-y-5"
          >
            {/* Server URL */}
            <div>
              <label className="text-sm font-semibold text-ink flex items-center gap-2">
                <Link2 size={14} className="text-maroon" />
                LiveKit Server URL
              </label>
              <input
                type="text"
                value={form.url}
                onChange={onChange("url")}
                placeholder="wss://your-project.livekit.cloud"
                autoComplete="off"
                className="mt-2 w-full bg-ivory border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-maroon font-mono"
              />
              <p className="text-xs text-inkSoft mt-1">
                Must start with <code>wss://</code> or <code>ws://</code>.
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="text-sm font-semibold text-ink flex items-center gap-2">
                <KeyRound size={14} className="text-maroon" />
                API Key
              </label>
              <input
                type="text"
                value={form.apiKey}
                onChange={onChange("apiKey")}
                placeholder="APIxxxxxxxxxxxxx"
                autoComplete="off"
                className="mt-2 w-full bg-ivory border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-maroon font-mono"
              />
            </div>

            {/* API Secret */}
            <div>
              <label className="text-sm font-semibold text-ink flex items-center gap-2">
                <KeyRound size={14} className="text-maroon" />
                API Secret
              </label>

              <div className="mt-2 relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={form.apiSecret}
                  onChange={onChange("apiSecret")}
                  placeholder="Enter API secret"
                  autoComplete="off"
                  className="w-full bg-ivory border border-border rounded-lg px-3.5 py-2.5 pr-11 text-sm text-ink outline-none focus:border-maroon font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-inkSoft hover:text-ink"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <p className="text-xs text-inkSoft mt-1">
                Visible to admins only. Toggle the eye icon to reveal or hide.
              </p>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-inkSoft">
                All issued tokens will use these credentials going forward.
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-maroon text-ivory text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-maroonDeep disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>

            {feedback && (
              <div
                className={`text-sm font-medium px-4 py-3 rounded-lg ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {feedback.msg}
              </div>
            )}
          </form>
        )}
      </main>
    </>
  );
}