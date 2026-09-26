"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { deleteCourse, getCourses } from "@/action/admin";

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getCourses();

      setCourses(res.data?.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load courses.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(course._id);

      await deleteCourse(course._id);

      // Remove immediately from UI
      setCourses((prev) => prev.filter((item) => item._id !== course._id));
    } catch (err) {
      console.error("Failed to delete course:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete course.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (course) => {
    router.push(`/admin/courses/${course._id}/edit`);
  };

  return (
    <>
      <Topbar
        title="Courses"
        subtitle="Manage subscription-based courses, teachers, and schedules"
      />

      <main className="px-6 py-8 lg:px-10">
        <PageHeader
          title="All Courses"
          description="Create a course, assign a teacher, and set its schedule."
          actionLabel="Add Course"
          actionHref="/admin/courses/new"
        />

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {/* Loading */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-inkSoft">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading courses...
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <p className="text-sm text-red-500">{error}</p>

              <button
                type="button"
                onClick={fetchCourses}
                className="mt-4 rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && courses.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <BookOpen className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="text-sm font-semibold text-ink">
                No courses found
              </h3>

              <p className="mt-1 text-sm text-inkSoft">
                Create your first course to get started.
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && courses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-inkSoft">
                    <th className="px-5 py-3 font-medium">Course</th>

                    <th className="px-5 py-3 font-medium">Teacher</th>

                    <th className="px-5 py-3 font-medium">Students</th>

                    <th className="px-5 py-3 font-medium">Price</th>

                    <th className="px-5 py-3 font-medium">Status</th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className="border-b border-border last:border-0 hover:bg-slate-50/50">
                      {/* Course */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink">
                          {course.title}
                        </div>

                        {course.description && (
                          <div className="mt-0.5 max-w-md truncate text-xs text-inkSoft">
                            {course.description}
                          </div>
                        )}
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-3.5 text-inkSoft">
                        {course.teacher?.name || "Not assigned"}
                      </td>

                      {/* Students */}
                      <td className="px-5 py-3.5 text-inkSoft">
                        {course.studentsCount ?? course.students ?? 0}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-inkSoft">
                        {course.price != null
                          ? `৳${Number(course.price).toLocaleString()}`
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            course.status === "Active" ? "success" : "neutral"
                          }>
                          {course.status || "Draft"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            disabled={deletingId === course._id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-maroon transition hover:bg-maroon/5 disabled:cursor-not-allowed disabled:opacity-50">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(course)}
                            disabled={deletingId === course._id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                            {deletingId === course._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
