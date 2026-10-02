// components/live/LiveRoom.jsx
"use client";
import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  useTracks,
  GridLayout,
  ParticipantTile,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

export default function LiveRoom({ fetchToken, onLeave }) {
  const [conn, setConn] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchToken()
      .then((data) => setConn(data))
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not join the class."),
      );
  }, [fetchToken]);

  if (error) return <p className="text-danger text-sm p-6">{error}</p>;
  if (!conn) return <p className="text-inkSoft text-sm p-6">Connecting…</p>;

  return (
    <LiveKitRoom
      token={conn.token}
      serverUrl={conn.serverUrl}
      connect
      video
      audio
      onDisconnected={onLeave}
      data-lk-theme="default"
      style={{ height: "100dvh" }}>
      <VideoConference />
    </LiveKitRoom>
  );
}
