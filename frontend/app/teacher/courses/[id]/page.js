"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Loader2,
  Users,
  Video,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import JoinPujaButton from "@/components/puja/JoinPujaButton";

import {
  getMyCourses,
  getCourseEnrollments,
  markAttendance,
  getAttendance,
  getCourseLiveKitToken,
} from "@/action/teacher";

/* ------------------------------ helpers ------------------------------ */

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatSchedule(course) {
  if (!course) return "";
  const days = Array.isArray(course.schedule?.days)
    ? course.schedule.days.join(", ")
    : course.schedule?.days || "";
  const time = course.schedule?.time || "";
  return [days, time].filter(Boolean).join(" · ") || "Schedule not set";
}

function formatNextSession(value) {
  if (!value) return "Schedule pending";
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ------------------------------ component ------------------------------ */

export default function TeacherCourseDetailPage() {
  const params = useParams();
  const courseId = params?.id;

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);

  const [date, setDate] = useState(getToday);
  const [attendance, setAttendance] = useState({});

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  /* --------------------------- data loading --------------------------- */

  useEffect(() => {
    if (!courseId) return;
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !course) return;
    loadEnrollments();
  }, [courseId, course]);

  useEffect(() => {
    if (!courseId || !course) return;
    loadAttendance(date);
  }, [courseId, course, date]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyCourses();
      const courses = response?.data?.courses || [];

      const found = courses.find(
        (item) => String(item._id) === String(courseId)
      );

      if (!found) {
        setError("Course not found or not assigned to you.");
        setCourse(null);
        return;
      }

      setCourse(found);
    } catch (err) {
      console.error("Failed to load course:", err);
      const message =
        err?.response?.data?.message || "Failed to load course.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await getCourseEnrollments(courseId);
      const enrollments = response?.data?.enrollments || [];

      const formattedStudents = enrollments
        .filter((e) => e.student)
        .map((e) => ({
          id: e.student._id,
          name: e.student.name || "Unknown Student",
          email: e.student.email || "",
        }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error("Failed to load enrolled students:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load enrolled students."
      );
    }
  };

  const loadAttendance = async (selectedDate) => {
    try {
      setAttendanceLoading(true);
      setSaved(false);

      const response = await getAttendance(courseId, { date: selectedDate });
      const records = response?.data?.attendance || [];

      const map = {};
      records.forEach((r) => {
        const id = r.student?._id || r.student;
        if (id) map[String(id)] = r.status;
      });

      setAttendance(map);
    } catch (err) {
      console.error("Failed to load attendance:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load attendance."
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  /* ------------------------------ actions ------------------------------ */

  const setStatus = (studentId, status) => {
    setSaved(false);
    setAttendance((prev) => ({ ...prev, [String(studentId)]: status }));
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
    setSaved(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!students.length) {
      toast.error("No enrolled students found.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);

      const records = students.map((s) => ({
        student: s.id,
        status: attendance[String(s.id)] || "present",
      }));

      await markAttendance(courseId, { date, records });

      setSaved(true);
      toast.success(`Attendance saved for ${date}`);
      await loadAttendance(date);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      toast.error(
        err?.response?.data?.message || "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------ render ------------------------------ */

  if (loading) {
    return (
      <>
        <Topbar title="Course" subtitle="Loading course..." />
        <main className="px-6 lg:px-10 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
          </div>
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Topbar
          title="Course not found"
          subtitle={error || "The requested course could not be found."}
        />
        <main className="px-6 lg:px-10 py-8">
          <Link
            href="/teacher/courses"
            className="inline-flex items-center gap-1 text-maroon font-medium text-sm hover:underline"
          >
            <ChevronLeft size={16} />
            Back to my courses
          </Link>
        </main>
      </>
    );
  }

  const joinability = course.joinability;
  const canShowLive =
    course.status === "active" &&
    course.liveKitRoomId &&
    joinability;

  return (
    <>
      <Topbar
        title={course.title}
        subtitle={formatSchedule(course)}
      />

      <main className="px-6 lg:px-10 py-8 max-w-3xl space-y-6">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft hover:text-maroon"
        >
          <ChevronLeft size={16} />
          Back to my courses
        </Link>

        {/* -------------------- Live Session Card -------------------- */}
        {canShowLive && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon/10">
                  <Video size={18} className="text-maroon" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Live Class Session
                  </p>
                  <p className="text-xs text-inkSoft mt-1 flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {formatNextSession(joinability.nextStart)}
                  </p>
                  {course.durationMinutes && (
                    <p className="text-xs text-inkSoft mt-0.5 flex items-center gap-1.5">
                      <Clock3 size={12} />
                      {course.durationMinutes} min session
                    </p>
                  )}
                  {!joinability.canJoin && joinability.reason && (
                    <p className="text-xs text-inkSoft mt-2">
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
                joinPath={`/live/course/teacher/${course._id}`}
                fetchToken={getCourseLiveKitToken}
                label="Start Class"
                size="lg"
              />
            </div>
          </div>
        )}

        {/* -------------------- Attendance Card -------------------- */}
        <form
          onSubmit={handleSave}
          className="bg-surface border border-border rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Mark Attendance
              </h2>
              <p className="text-sm text-inkSoft mt-1">
                Select present/absent for each student, then save.
              </p>
            </div>

            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="input w-auto"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-inkSoft">
            <Users size={16} />
            <span>
              {students.length} enrolled student
              {students.length !== 1 ? "s" : ""}
            </span>
          </div>

          {students.length === 0 ? (
            <div className="py-10 text-center text-sm text-inkSoft">
              No students are enrolled in this course.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {students.map((student) => {
                const studentId = String(student.id);
                const status = attendance[studentId] || "present";

                return (
                  <li
                    key={student.id}
                    className="flex items-center justify-between gap-4 py-3.5 flex-wrap"
                  >
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-inkSoft">{student.email}</p>
                    </div>

                    <div className="flex bg-ivorySoft rounded-lg p-1">
                      <button
                        type="button"
                        disabled={attendanceLoading || saving}
                        onClick={() => setStatus(student.id, "present")}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                          status === "present"
                            ? "bg-success text-ivory"
                            : "text-inkSoft"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        disabled={attendanceLoading || saving}
                        onClick={() => setStatus(student.id, "absent")}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                          status === "absent"
                            ? "bg-danger text-ivory"
                            : "text-inkSoft"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || attendanceLoading || students.length === 0}
              className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Attendance"}
            </button>

            {saved && (
              <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
                <Check size={16} />
                Saved for {date}
              </span>
            )}
          </div>
        </form>
      </main>
    </>
  );
}