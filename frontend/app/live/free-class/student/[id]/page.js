"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import PujaStage from "@/components/PujaStage";
import {
  getFreeClass,
  getFreeClassLiveKitToken,
} from "@/action/student";

export default function StudentFreeClassLivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [fc, setFc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getFreeClass(id);
        setFc(data?.freeClass);
      } catch {
        router.replace("/student/free-classes");
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
      title={fc?.title}
      fetchToken={getFreeClassLiveKitToken}
      startedAt={fc?.startedAt}
      backHref="/student/free-classes"
    />
  );
}