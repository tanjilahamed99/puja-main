"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import PujaStage from "@/components/PujaStage";
import {
  getMyFreeClasses,
  startFreeClassSession,
} from "@/action/teacher";

export default function TeacherFreeClassLivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [fc, setFc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyFreeClasses();
        const found = (data?.freeClasses || []).find(
          (c) => String(c._id) === String(id)
        );
        if (!found) throw new Error("not found");

        // Start/flip the class to live (also stamps startedAt on the server)
        try {
          await startFreeClassSession(id);
        } catch (err) {
          console.warn("start call failed:", err?.message);
        }

        setFc(found);
      } catch {
        router.replace(`/teacher/free-classes/${id}`);
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
      title={fc?.title}
      fetchToken={() => startFreeClassSession(id)}
      startedAt={fc?.startedAt}
      backHref={`/teacher/free-classes/${id}`}
    />
  );
}