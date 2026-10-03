"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import PujaStage from "@/components/PujaStage";
import { getMyCourse, getCourseLiveKitToken } from "@/action/student";

export default function StudentCourseLivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCourse(id);
        setData(res.data);
      } catch {
        router.replace("/student/my-courses");
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
      title={data?.course?.title}
      fetchToken={getCourseLiveKitToken}
      startedAt={data?.joinability?.nextStart}
      backHref={`/student/courses/${id}`}
    />
  );
}