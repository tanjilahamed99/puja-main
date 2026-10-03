"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  getPujaBookingLiveKitToken,
  startPujaBooking,
  getMyPujaBooking,
} from "@/action/teacher";
import PujaStage from "@/components/PujaStage";

export default function TeacherLiveRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch lightweight booking metadata (title, startedAt) so the stage can show
  // a header. Also fires the "start" call once if not started yet.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyPujaBooking(id);
        const b = data?.booking;
        if (!b) throw new Error("Booking not found");

        // Teacher only: stamp startedAt so both sides can show the timer.
        if (!b.startedAt) {
          try {
            await startPujaBooking(id);
          } catch (err) {
            // non-fatal — token endpoint still gates the join window
            console.warn("startPujaBooking failed:", err?.message);
          }
        }

        setBooking(b);
      } catch (err) {
        // Redirect back if the booking can't be loaded at all
        router.replace(`/teacher/specific-puja/${id}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3 bg-[#0b0b0f] text-sm text-white/70">
        <Loader2 size={18} className="animate-spin" />
        Preparing session…
      </div>
    );
  }

  return (
    <PujaStage
      bookingId={id}
      role="teacher"
      title={booking?.package?.name}
      fetchToken={getPujaBookingLiveKitToken}
      startedAt={booking?.startedAt}
      backHref={`/teacher/specific-puja/${id}`}
    />
  );
}
