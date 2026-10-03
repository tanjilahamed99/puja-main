"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

import { AlertTriangle, Loader2, LogOut, Shield, Wifi } from "lucide-react";
import { toast } from "sonner";

/* ---------- connection status pill ---------- */
/* Receives the Room instance from the parent. No hooks — safe to render
   anywhere in the tree, including the top bar outside <LiveKitRoom>. */
function ConnectionPill({ room }) {
  const [state, setState] = useState("disconnected");

  useEffect(() => {
    if (!room) {
      setState("disconnected");
      return;
    }

    const handleConnected = () => setState("connected");
    const handleReconnecting = () => setState("reconnecting");
    const handleReconnected = () => setState("connected");
    const handleDisconnected = () => setState("disconnected");

    // Set initial state synchronously from the current room
    setState(room.state || "disconnected");

    room.on("connected", handleConnected);
    room.on("reconnecting", handleReconnecting);
    room.on("reconnected", handleReconnected);
    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("connected", handleConnected);
      room.off("reconnecting", handleReconnecting);
      room.off("reconnected", handleReconnected);
      room.off("disconnected", handleDisconnected);
    };
  }, [room]);

  const color =
    state === "connected"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : state === "reconnecting"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : "bg-red-500/15 text-red-300 border-red-500/30";

  const label =
    state === "connected"
      ? "Live"
      : state === "reconnecting"
      ? "Reconnecting…"
      : state === "disconnected" && !room
      ? "Connecting…"
      : "Disconnected";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
            state === "connected" ? "animate-ping bg-emerald-400" : ""
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            state === "connected"
              ? "bg-emerald-400"
              : state === "reconnecting"
              ? "bg-amber-400"
              : "bg-red-400"
          }`}
        />
      </span>
      {label}
    </span>
  );
}

/* ---------- top bar ---------- */
function StageTopBar({ role, title, onLeave, startedAt, room }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const base = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - base) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          {role === "teacher" ? (
            <Shield size={16} className="text-amber-300" />
          ) : (
            <Wifi size={16} className="text-emerald-300" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {title || "Specific Puja"}
          </p>
          <p className="text-[11px] text-white/50 capitalize">
            {role} · session in progress
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ConnectionPill room={room} />
        {startedAt && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 tabular-nums">
            {mm}:{ss}
          </span>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
        >
          <LogOut size={14} />
          Leave
        </button>
      </div>
    </div>
  );
}

/* ---------- shared shell for loading/error ---------- */
function StageShell({ role, children }) {
  return (
    <div className="flex h-screen flex-col bg-[#0b0b0f] text-white">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            {role === "teacher" ? (
              <Shield size={16} className="text-amber-300" />
            ) : (
              <Wifi size={16} className="text-emerald-300" />
            )}
          </div>
          <p className="text-sm font-medium">Specific Puja</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- main stage ---------- */
export default function PujaStage({
  bookingId,
  role,
  title,
  fetchToken,
  startedAt,
  backHref,
}) {
  const router = useRouter();
  const [conn, setConn] = useState(null);
  const [error, setError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(true);
  const [room, setRoom] = useState(null); // LiveKit Room instance, set once connected
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const { data } = await fetchToken(bookingId);
        setConn(data);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Could not join the session.";
        setError(msg);
        toast.error(msg);
      } finally {
        setTokenLoading(false);
      }
    })();
  }, [bookingId, fetchToken]);

  const handleLeave = () => {
    router.replace(backHref);
  };

  const serverUrl = useMemo(() => conn?.serverUrl, [conn]);

  if (tokenLoading) {
    return (
      <StageShell role={role}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white/70">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-sm">Preparing your puja session…</p>
        </div>
      </StageShell>
    );
  }

  if (error) {
    return (
      <StageShell role={role}>
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle size={22} className="text-red-300" />
            </div>
            <p className="text-sm font-medium text-white">
              Unable to join the session
            </p>
            <p className="mt-2 text-sm text-white/60">{error}</p>
            <button
              type="button"
              onClick={handleLeave}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Back
            </button>
          </div>
        </div>
      </StageShell>
    );
  }

  if (!conn) return null;

  return (
    <div className="flex h-screen flex-col bg-[#0b0b0f] text-white">
      <StageTopBar
        role={role}
        title={title}
        startedAt={startedAt}
        onLeave={handleLeave}
        room={room}
      />

      <div className="relative flex-1 min-h-0">
        <LiveKitRoom
          token={conn.token}
          serverUrl={serverUrl}
          connect
          video
          audio
          data-lk-theme="default"
          onConnected={(r) => setRoom(r)}
          onDisconnected={handleLeave}
          style={{ height: "100%" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}