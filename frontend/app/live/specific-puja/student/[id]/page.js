"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getPujaBookingLiveKitToken, getPujaBooking } from "@/action/student";
import PujaStage from "@/components/PujaStage";

export default function StudentLiveRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getPujaBooking(id);
        const b = data?.booking;
        if (!b) throw new Error("Booking not found");
        setBooking(b);
      } catch {
        router.replace("/student/specific-puja");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3 bg-[#0b0b0f] text-sm text-white/70">
        <Loader2 size={18} className="animate-spin" />
        Joining session…
      </div>
    );
  }

  return (
    <PujaStage
      bookingId={id}
      role="student"
      title={booking?.package?.name}
      fetchToken={getPujaBookingLiveKitToken}
      startedAt={booking?.startedAt}
      backHref="/student/specific-puja"
    />
  );
}
