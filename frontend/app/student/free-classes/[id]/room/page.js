"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import Topbar from "@/components/admin/Topbar";
import { useFreeClass } from "@/lib/useFreeClass";
import { joinFreeClass, getFreeClassLiveKitToken } from "@/action/student";

export default function FreeClassRoomPage({ params }) {
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

      // Register attendance. If they've already joined before (e.g. they
      // refreshed this page), the backend's unique index rejects the
      // duplicate — that's fine, it just means they're already on the
      // roster, so it's not treated as a real error here.
      try {
        await joinFreeClass(freeClass._id);
      } catch (err) {
        const message = err?.response?.data?.message || "";
        if (!message.includes("already exists")) {
          setConnectError(
            message || "Could not register your attendance. Please try again.",
          );
          setConnecting(false);
          return;
        }
      }

      try {
        const { data } = await getFreeClassLiveKitToken(freeClass._id);
        setConnection({ token: data.token, serverUrl: data.serverUrl });
      } catch (err) {
        setConnectError(
          err?.response?.data?.message ||
            "Could not connect to the session. Please try again.",
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
      <>
        <Topbar title="Loading…" />
        <main className="px-6 lg:px-10 py-8">
          <p className="text-sm text-inkSoft">Loading class…</p>
        </main>
      </>
    );
  }

  if (notFound || error) {
    return (
      <>
        <Topbar title="Class not found" />
        <main className="px-6 lg:px-10 py-8">
          <p className="text-sm text-danger mb-4">
            {error || "This class could not be found."}
          </p>
          <Link
            href="/student/free-classes"
            className="text-maroon font-medium text-sm hover:underline">
            Back to free classes
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={freeClass.title}
        subtitle={freeClass.teacher?.name || "Teacher TBD"}
      />
      <main className="px-6 lg:px-10 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <Link
            href="/student/free-classes"
            className="inline-flex items-center gap-1 text-sm text-inkSoft hover:text-maroon">
            <ChevronLeft size={16} /> Back to free classes
          </Link>
          <button
            type="button"
            onClick={goToDonation}
            className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold">
            I&apos;m done — Continue
          </button>
        </div>

        {connecting && (
          <div className="bg-surface border border-border rounded-xl p-10 text-center text-sm text-inkSoft">
            Connecting to the session…
          </div>
        )}

        {!connecting && connectError && (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <p className="text-sm text-danger mb-4">{connectError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-semibold text-maroon hover:underline">
              Try again
            </button>
          </div>
        )}

        {!connecting && !connectError && connection && (
          <div
            className="rounded-xl overflow-hidden border border-border"
            style={{ height: "70vh" }}>
            <LiveKitRoom
              token={connection.token}
              serverUrl={connection.serverUrl}
              connect
              video
              audio
              data-lk-theme="default"
              style={{ height: "100%" }}
              onDisconnected={goToDonation}>
              <VideoConference />
            </LiveKitRoom>
          </div>
        )}
      </main>
    </>
  );
}
