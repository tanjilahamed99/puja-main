"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { deleteCourse, getCourses } from "@/action/admin";

const PAGE_LIMIT = 20;

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

function JoinWindowPill({ joinability }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!joinability) return <span className="text-xs text-inkSoft">—</span>;
  if (joinability.canJoin) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping bg-emerald-400" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Open
      </span>
    );
  }
  const now = Date.now();
  const opens = joinability.opensAt
    ? new Date(joinability.opensAt).getTime()
    : 0;
  const closes = joinability.closesAt
    ? new Date(joinability.closesAt).getTime()
    : 0;

  if (!opens || now > closes) {
    return <span className="text-xs text-inkSoft">—</span>;
  }
  const diffSec = Math.max(0, Math.floor((opens - now) / 1000));
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Clock size={12} />
      {h > 0 ? `in ${h}h ${m}m` : m > 0 ? `in ${m}m ${s}s` : `in ${s}s`}
    </span>
  );
}

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const reqRef = useRef(0);

  /* Debounce search */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  /* Reset page when filters change */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  /* Fetch */
  useEffect(() => {
    const reqId = ++reqRef.current;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getCourses({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: status || undefined,
        });
        if (reqId !== reqRef.current) return;
        setCourses(data?.items || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        console.error("Failed to fetch courses:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load courses."
        );
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [page, debouncedSearch, status]);

  const reload = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getCourses({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch || undefined,
        status: status || undefined,
      });
      setCourses(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`))
      return;
    try {
      setDeletingId(course._id);
      await deleteCourse(course._id);
      // If last item on page, step back
      if (courses.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
      toast.success("Course deleted");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete course."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <>
      <Topbar
        title="Courses"
        subtitle="Manage subscription-based courses, teachers, and schedules"
      />

      <main className="px-4 sm:px-6 py-6 sm:py-8 lg:px-10">
        <PageHeader
          title="All Courses"
          description="Create a course, assign a teacher, and set its schedule."
          actionLabel="Add Course"
          actionHref="/admin/courses/new"
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title…"
              className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-maroon sm:w-44"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-inkSoft">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading courses...
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-4 rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <BookOpen className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-ink">
                {search || status ? "No courses match your filters" : "No courses found"}
              </h3>
              <p className="mt-1 text-sm text-inkSoft">
                {search || status
                  ? "Try adjusting your search or filters."
                  : "Create your first course to get started."}
              </p>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <>
              {/* Mobile cards (shown < lg) */}
              <div className="lg:hidden divide-y divide-border">
                {courses.map((course) => (
                  <div key={course._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">
                          {course.title}
                        </p>
                        {course.description && (
                          <p className="mt-0.5 text-xs text-inkSoft line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={getStatusVariant(course.status)}>
                        {formatStatus(course.status)}
                      </Badge>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-xs">
                      <div>
                        <dt className="text-inkSoft">Teacher</dt>
                        <dd className="text-ink mt-0.5 truncate">
                          {course.teacher?.name || "Not assigned"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-inkSoft">Students</dt>
                        <dd className="text-ink mt-0.5">
                          {course.studentCount ?? 0}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-inkSoft">Price</dt>
                        <dd className="text-ink mt-0.5">
                          {course.price != null
                            ? `₹${Number(course.price).toLocaleString()}`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-inkSoft">Join Window</dt>
                        <dd className="mt-0.5">
                          <JoinWindowPill joinability={course.joinability} />
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/admin/courses/${course._id}/edit`)
                        }
                        disabled={deletingId === course._id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-maroon disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course)}
                        disabled={deletingId === course._id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
                      >
                        {deletingId === course._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table (shown ≥ lg) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-inkSoft">
                      <th className="px-5 py-3 font-medium">Course</th>
                      <th className="px-5 py-3 font-medium">Teacher</th>
                      <th className="px-5 py-3 font-medium">Students</th>
                      <th className="px-5 py-3 font-medium">Price</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Join Window</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr
                        key={course._id}
                        className="border-b border-border last:border-0 hover:bg-slate-50/50"
                      >
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
                        <td className="px-5 py-3.5 text-inkSoft">
                          {course.teacher?.name || "Not assigned"}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {course.studentCount ?? 0}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {course.price != null
                            ? `₹${Number(course.price).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusVariant(course.status)}>
                            {formatStatus(course.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <JoinWindowPill joinability={course.joinability} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/courses/${course._id}/edit`
                                )
                              }
                              disabled={deletingId === course._id}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-maroon transition hover:bg-maroon/5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(course)}
                              disabled={deletingId === course._id}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
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
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && total > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-inkSoft">
            <span>
              Page {page} of {maxPage} · {total} total
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={page >= maxPage}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}