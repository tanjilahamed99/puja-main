"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Users, CalendarDays } from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import JoinPujaButton from "@/components/JoinPujaButton";
import { getMyCourses, getCourseLiveKitToken } from "@/action/teacher";

function formatDays(days) {
  if (!days) return "Schedule not set";
  return Array.isArray(days) ? days.join(", ") : String(days);
}

function getStatusVariant(status) {
  switch (status) {
    case "active":
      return "success";
    case "archived":
      return "warning";
    default:
      return "neutral";
  }
}

function formatStatus(status) {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyCourses();
      setCourses(response?.data?.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      const message =
        err?.response?.data?.message || "Failed to load your courses.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title="My Courses"
        subtitle="Courses assigned to you by the admin"
      />

      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Assigned Courses"
          description="Open a course to view enrolled students and mark attendance."
        />

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-danger">{error}</p>
              <button
                onClick={loadCourses}
                className="mt-4 px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceMuted transition"
              >
                Try Again
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-inkSoft">
                No courses have been assigned to you yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Course</th>
                    <th className="px-5 py-3 font-medium">Students</th>
                    <th className="px-5 py-3 font-medium">Schedule</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Live</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const joinability = course.joinability;
                    const canShowJoin =
                      course.status === "active" &&
                      course.liveKitRoomId &&
                      joinability;

                    return (
                      <tr
                        key={course._id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium">{course.title}</div>
                          {course.description && (
                            <div className="text-xs text-inkSoft mt-1 max-w-md truncate">
                              {course.description}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Users size={14} />
                            {course.studentCount || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDays(course.schedule?.days)}
                            {course.schedule?.time && (
                              <> · {course.schedule.time}</>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusVariant(course.status)}>
                            {formatStatus(course.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {canShowJoin ? (
                            <JoinPujaButton
                              bookingId={course._id}
                              opensAt={joinability.opensAt}
                              closesAt={joinability.closesAt}
                              canJoin={joinability.canJoin}
                              joinPath={`/live/course/teacher/${course._id}`}
                              fetchToken={getCourseLiveKitToken}
                              label="Start Class"
                              size="sm"
                            />
                          ) : (
                            <span className="text-xs text-inkSoft">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/teacher/courses/${course._id}`}
                            className="inline-flex items-center gap-1.5 text-maroon font-medium text-sm hover:underline"
                          >
                            <Eye size={15} />
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}