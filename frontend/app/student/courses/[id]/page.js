"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import {
  browseCourses,
  getMyEnrollments,
  enrollInCourse,
} from "@/action/student";
import CourseJoinControl from "@/components/CourseJoinControl";

function formatPrice(price) {
  if (price === undefined || price === null) return "—";
  return `৳${Number(price).toLocaleString("en-IN")}`;
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatSchedule(schedule) {
  if (!schedule || !schedule.days?.length) return "Schedule to be announced";
  return `${schedule.days.join(", ")} · ${formatTime(schedule.time)} (${schedule.timezone || "Asia/Dhaka"})`;
}

export default function CourseDetailPage({ params }) {
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [method, setMethod] = useState("phonepe");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // There's no GET /student/courses/:id endpoint yet — only the list —
  // so this pulls the full course list and finds the matching one.
  // Worth adding a dedicated single-course route later if the course
  // catalog grows large enough that this becomes wasteful.
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          browseCourses(),
          getMyEnrollments(),
        ]);

        const match = (coursesRes.data.courses || []).find(
          (c) => c._id === params.id,
        );
        if (!match) {
          setNotFound(true);
          return;
        }
        setCourse(match);

        const isEnrolled = (enrollmentsRes.data.enrollments || []).some(
          (e) =>
            (e.course?._id || e.course) === params.id &&
            e.status !== "cancelled",
        );
        setEnrolled(isEnrolled);
      } catch (err) {
        setLoadError(
          err?.response?.data?.message ||
            "Could not load this course. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const { data } = await enrollInCourse(course._id, { method });
      if (!data.enrollment) {
        setSubmitError(data.message || "Could not enroll. Please try again.");
        return;
      }
      setEnrolled(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Could not enroll. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Loading course…" />
        <main className="px-6 lg:px-10 py-8">
          <p className="text-sm text-inkSoft">Loading…</p>
        </main>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Topbar title="Something went wrong" />
        <main className="px-6 lg:px-10 py-8">
          <p className="text-sm text-danger mb-4">{loadError}</p>
          <Link
            href="/student/courses"
            className="text-maroon font-medium text-sm hover:underline">
            Back to courses
          </Link>
        </main>
      </>
    );
  }

  if (notFound || !course) {
    return (
      <>
        <Topbar title="Course not found" />
        <main className="px-6 lg:px-10 py-8">
          <Link
            href="/student/courses"
            className="text-maroon font-medium text-sm hover:underline">
            Back to courses
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={course.title}
        subtitle={course.teacher?.name || "Teacher TBD"}
      />
      <main className="px-6 lg:px-10 py-8 max-w-2xl">
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon">
          <ChevronLeft size={16} /> Back to courses
        </Link>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <span className="inline-flex text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
            {course.category}
          </span>
          <p className="text-sm text-inkSoft leading-relaxed">
            {course.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-inkSoft">Teacher</p>
              <p className="font-medium mt-0.5">
                {course.teacher?.name || "Teacher TBD"}
              </p>
            </div>
            <div>
              <p className="text-inkSoft">Schedule</p>
              <p className="font-medium mt-0.5">
                {formatSchedule(course.schedule)}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            {enrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-success font-medium text-sm">
                  <CheckCircle2 size={18} />
                  You&apos;re enrolled.
                </div>
                <CourseJoinControl
                  courseId={course._id}
                  schedule={course.schedule}
                  durationMin={course.schedule?.durationMin || 60}
                />
              </div>
            ) : (
              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="font-display text-2xl font-semibold">
                    {formatPrice(course.price)}
                  </span>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="input w-auto">
                    <option value="phonepe">Pay with PhonePe</option>
                    <option value="paypal">Pay with PayPal</option>
                  </select>
                </div>

                {submitError && (
                  <p className="text-sm text-danger">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-maroon text-ivory px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                  {submitting ? "Enrolling…" : "Enroll Now — Full Package"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
