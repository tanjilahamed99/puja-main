// app/live/student/[id]/page.jsx
"use client";
import { useParams, useRouter } from "next/navigation";
import LiveRoom from "@/components/live/LiveRoom";
import { getCourseLiveKitToken } from "@/action/student";

export default function StudentCourseLivePage() {
  const { id } = useParams();
  const router = useRouter();
  return (
    <LiveRoom
      fetchToken={() => getCourseLiveKitToken(id).then((r) => r.data)}
      onLeave={() => router.push(`/student/courses/${id}`)}
    />
  );
}