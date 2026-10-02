// app/live/teacher/[id]/page.jsx
"use client";
import { useParams, useRouter } from "next/navigation";
import LiveRoom from "@/components/live/LiveRoom";
import { getCourseLiveKitToken } from "@/action/teacher";

export default function TeacherCourseLivePage() {
  const { id } = useParams();
  const router = useRouter();
  return (
    <LiveRoom
      fetchToken={() => getCourseLiveKitToken(id).then((r) => r.data)}
      onLeave={() => router.push(`/teacher/courses/${id}`)}
    />
  );
}