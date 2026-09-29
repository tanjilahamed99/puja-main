"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { browseCourses, getMyEnrollments } from "@/action/student";

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
  if (!schedule || !schedule.days?.length) return "Schedule TBD";
  return `${schedule.days.join(", ")} · ${formatTime(schedule.time)}`;
}

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          browseCourses(),
          getMyEnrollments(),
        ]);

        setCourses(coursesRes.data.courses || []);

        const ids = new Set(
          (enrollmentsRes.data.enrollments || [])
            .filter((e) => e.status !== "cancelled")
            .map((e) => e.course?._id || e.course)
        );
        setEnrolledIds(ids);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Could not load courses. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Topbar
        title="Browse Courses"
        subtitle="Full guided courses with a real syllabus, teacher, and schedule"
      />
      <main className="px-6 lg:px-10 py-8">
        {loading && <p className="text-sm text-inkSoft">Loading courses…</p>}

        {!loading && error && <p className="text-sm text-danger">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p className="text-sm text-inkSoft">No courses are available right now.</p>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((c) => {
              const enrolled = enrolledIds.has(c._id);
              return (
                <Link
                  key={c._id}
                  href={`/student/courses/${c._id}`}
                  className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-maroon transition-colors"
                >
                  <span className="inline-flex self-start text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
                    {c.category}
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
                  <p className="text-sm text-inkSoft">{c.teacher?.name || "Teacher TBD"}</p>
                  <p className="text-sm text-inkSoft">{formatSchedule(c.schedule)}</p>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{formatPrice(c.price)}</span>
                    {enrolled ? (
                      <span className="text-xs font-semibold text-success">Enrolled</span>
                    ) : (
                      <span className="text-xs font-semibold text-maroon">Enroll →</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}