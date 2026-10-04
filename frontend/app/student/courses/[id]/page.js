"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CalendarDays, Clock3, Loader2 } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import JoinPujaButton from "@/components/JoinPujaButton";
import { getMyCourse, getCourseLiveKitToken } from "@/action/student";

function formatDateTime(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function StudentCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCourse(id);
        setData(res.data);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Could not load this course."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <>
        <Topbar title="Course" subtitle="Loading..." />
        <main className="px-6 lg:px-10 py-8 flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
        </main>
      </>
    );
  }

  if (error || !data?.course) {
    return (
      <>
        <Topbar title="Course not found" subtitle={error} />
        <main className="px-6 lg:px-10 py-8">
          <Link
            href="/student/my-courses"
            className="inline-flex items-center gap-1 text-maroon font-medium text-sm hover:underline"
          >
            <ChevronLeft size={16} /> Back to my courses
          </Link>
        </main>
      </>
    );
  }

  const { course, enrollment, joinability } = data;

  return (
    <>
      <Topbar title={course.title} subtitle="Enrolled course" />
      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/student/my-courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to my courses
        </Link>

        {/* Live session card */}
        {enrollment.status === "active" && course.liveKitRoomId && joinability && (
          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon/10">
                  <CalendarDays size={18} className="text-maroon" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Next Live Session
                  </p>
                  <p className="text-xs text-inkSoft mt-1">
                    {joinability.nextStart
                      ? formatDateTime(joinability.nextStart)
                      : "Schedule pending"}
                  </p>
                  {!joinability.canJoin && joinability.reason && (
                    <p className="text-xs text-inkSoft mt-1">
                      {joinability.reason}
                    </p>
                  )}
                </div>
              </div>

              <JoinPujaButton
                bookingId={course._id}
                opensAt={joinability.opensAt}
                closesAt={joinability.closesAt}
                canJoin={joinability.canJoin}
                joinPath={`/live/course/student/${course._id}`}
                fetchToken={getCourseLiveKitToken}
                label="Join Class"
                size="lg"
              />
            </div>
          </div>
        )}

        {/* Course detail */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
          {course.image && (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <h1 className="font-display text-xl font-semibold">
            {course.title}
          </h1>
          <p className="text-sm text-inkSoft">{course.description}</p>

          <div className="border-t border-border pt-5 grid sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="text-maroon mt-0.5" />
              <div>
                <p className="text-sm font-medium">Schedule</p>
                <p className="text-sm text-inkSoft mt-1">
                  {course.schedule?.days?.join(", ") || "—"}
                  {course.schedule?.time && ` · ${course.schedule.time}`}
                </p>
                <p className="text-xs text-inkSoft mt-1">
                  {course.schedule?.timezone}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 size={18} className="text-maroon mt-0.5" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-inkSoft mt-1">
                  {course.durationMinutes
                    ? `${course.durationMinutes} min / session`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}