"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useFreeClass } from "@/lib/useFreeClass";
import { joinFreeClass, getFreeClassLiveKitToken } from "@/action/student";

// Deliberately NOT under app/student/ — this is a full-screen, chrome-free
// page by design. Anything nested under app/student/.../page.js always
// inherits the student dashboard's sidebar + topbar from its layout.js,
// and there's no way to opt a single page out of a parent layout in the
// App Router. Living at the top level is what makes this page actually
// full-screen.
export default function LiveFreeClassPage({ params }) {
  const router = useRouter();
  const { freeClass, loading, notFound, error } = useFreeClass(params.id);

  const [connection, setConnection] = useState(null); // { token, serverUrl }
  const [connecting, setConnecting] = useState(true);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    if (!freeClass) return;

    const setup = async () => {
      setConnecting(true);
      setConnectError("");

      try {
        await joinFreeClass(freeClass._id);
      } catch (err) {
        const message = err?.response?.data?.message || "";
        if (!message.includes("already exists")) {
          setConnectError(message || "Could not register your attendance. Please try again.");
          setConnecting(false);
          return;
        }
      }

      try {
        const { data } = await getFreeClassLiveKitToken(freeClass._id);
        setConnection({ token: data.token, serverUrl: data.serverUrl });
      } catch (err) {
        setConnectError(
          err?.response?.data?.message || "Could not connect to the session. Please try again."
        );
      } finally {
        setConnecting(false);
      }
    };

    setup();
  }, [freeClass]);

  const goToDonation = () => {
    router.push(`/student/free-classes/${params.id}/donate`);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#111113] flex items-center justify-center">
        <p className="text-sm text-neutral-400">Loading class…</p>
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className="h-screen w-screen bg-[#111113] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-red-400 text-center">
          {error || "This class could not be found."}
        </p>
        <Link href="/student/free-classes" className="text-sm font-medium text-neutral-300 hover:text-white">
          Back to free classes
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#111113] flex flex-col">
      {/* Minimal overlay bar — just enough context, nothing dashboard-like */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/student/free-classes"
            className="text-neutral-400 hover:text-white shrink-0"
            aria-label="Back to free classes"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{freeClass.title}</p>
            <p className="text-xs text-neutral-400 truncate">
              {freeClass.teacher?.name || "Teacher TBD"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={goToDonation}
          className="bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
        >
          I&apos;m done — Continue
        </button>
      </div>

      {/* Video fills everything below the bar */}
      <div className="flex-1 min-h-0">
        {connecting && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-neutral-400">Connecting to the session…</p>
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
            onDisconnected={goToDonation}
          >
            <VideoConference />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}