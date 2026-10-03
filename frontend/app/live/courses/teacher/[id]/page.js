"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import PujaStage from "@/components/PujaStage";
import { getMyCourses, getCourseLiveKitToken } from "@/action/teacher";

export default function TeacherCourseLivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyCourses();
        const found = (data?.courses || []).find(
          (c) => String(c._id) === String(id),
        );
        if (!found) throw new Error("not found");
        setCourse(found);
      } catch {
        router.replace(`/teacher/courses/${id}`);
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
      title={course?.title}
      fetchToken={getCourseLiveKitToken}
      startedAt={course?.joinability?.nextStart}
      backHref={`/teacher/courses/${id}`}
    />
  );
}
