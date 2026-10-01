"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, LogOut } from "lucide-react";
import { toast } from "sonner";
import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { startFreeClassSession, endFreeClassSession } from "@/action/teacher";

// Top-level, outside app/teacher/ on purpose — same reasoning as the
// student room page: a page nested under app/teacher/layout.js always
// inherits that sidebar, and there's no way to opt one page out of a
// parent layout in the App Router. Living here is what makes this
// actually full-screen.
export default function LiveTeacherClassPage({ params }) {
  const router = useRouter();

  const [connection, setConnection] = useState(null); // { token, serverUrl, title }
  const [connecting, setConnecting] = useState(true);
  const [connectError, setConnectError] = useState("");
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const start = async () => {
      setConnecting(true);
      setConnectError("");
      try {
        const { data } = await startFreeClassSession(params.id);
        setConnection({
          token: data.token,
          serverUrl: data.serverUrl,
          title: data.freeClass?.title || "Free Class",
        });
      } catch (err) {
        setConnectError(
          err?.response?.data?.message || "Could not start the session. Please try again."
        );
      } finally {
        setConnecting(false);
      }
    };
    start();
  }, [params.id]);

  const handleEndClass = async () => {
    setEnding(true);
    try {
      await endFreeClassSession(params.id);
      toast.success("Class marked as completed.");
      router.push(`/teacher/free-classes/${params.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not end the class. Please try again.");
      setEnding(false);
    }
  };

  // A dropped connection (refresh, network blip) should NOT finalize the
  // class — only the explicit "End Class" button does that. Disconnect
  // just takes the teacher back to the detail page so they can rejoin.
  const handleDisconnected = () => {
    router.push(`/teacher/free-classes/${params.id}`);
  };

  return (
    <div className="h-screen w-screen bg-[#111113] flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/teacher/free-classes/${params.id}`}
            className="text-neutral-400 hover:text-white shrink-0"
            aria-label="Back to class details"
          >
            <ChevronLeft size={20} />
          </Link>
          <p className="text-sm font-semibold text-white truncate">
            {connection?.title || "Free Class"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleEndClass}
          disabled={ending}
          className="inline-flex items-center gap-2 bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 shrink-0"
        >
          <LogOut size={15} />
          {ending ? "Ending…" : "End Class"}
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {connecting && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-neutral-400">Starting the session…</p>
          </div>
        )}

        {!connecting && connectError && (
          <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
            <p className="text-sm text-red-400 text-center">{connectError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-semibold text-neutral-200 hover:text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {!connecting && !connectError && connection && (
          <LiveKitRoom
            token={connection.token}
            serverUrl={connection.serverUrl}
            connect
            video
            audio
            data-lk-theme="default"
            style={{ height: "100%" }}
            onDisconnected={handleDisconnected}
          >
            <VideoConference />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}