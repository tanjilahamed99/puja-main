"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Check, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";

import {
  getMyCourses,
  getCourseEnrollments,
  markAttendance,
  getAttendance,
} from "@/action/teacher";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatSchedule(course) {
  if (!course) return "";

  let schedule = "";

  if (Array.isArray(course.days)) {
    schedule = course.days.join(", ");
  } else if (course.days) {
    schedule = course.days;
  }

  if (course.time) {
    schedule += schedule ? ` · ${course.time}` : course.time;
  }

  return schedule || "Schedule not set";
}

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

  /*
   * Load the teacher's courses and find the requested
   * course.
   */
  useEffect(() => {
    if (!courseId) return;

    loadCourse();
  }, [courseId]);

  /*
   * Once course is available, load enrolled students.
   */
  useEffect(() => {
    if (!courseId || !course) return;

    loadEnrollments();
  }, [courseId, course]);

  /*
   * Load attendance whenever the selected date changes.
   */
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

      const foundCourse = courses.find(
        (item) => String(item._id) === String(courseId),
      );

      if (!foundCourse) {
        setError("Course not found or not assigned to you.");
        setCourse(null);
        return;
      }

      setCourse(foundCourse);
    } catch (err) {
      console.error("Failed to load course:", err);

      const message = err?.response?.data?.message || "Failed to load course.";

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
        .filter((enrollment) => enrollment.student)
        .map((enrollment) => ({
          id: enrollment.student._id,
          name: enrollment.student.name || "Unknown Student",
          email: enrollment.student.email || "",
        }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error("Failed to load enrolled students:", err);

      toast.error(
        err?.response?.data?.message || "Failed to load enrolled students.",
      );
    }
  };

  const loadAttendance = async (selectedDate) => {
    try {
      setAttendanceLoading(true);
      setSaved(false);

      const response = await getAttendance(courseId, {
        date: selectedDate,
      });

      const records = response?.data?.attendance || [];

      const attendanceMap = {};

      records.forEach((record) => {
        const studentId = record.student?._id || record.student;

        if (studentId) {
          attendanceMap[String(studentId)] = record.status;
        }
      });

      setAttendance(attendanceMap);
    } catch (err) {
      console.error("Failed to load attendance:", err);

      toast.error(err?.response?.data?.message || "Failed to load attendance.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setSaved(false);

    setAttendance((previous) => ({
      ...previous,
      [String(studentId)]: status,
    }));
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

      const records = students.map((student) => ({
        student: student.id,

        /*
         * If no saved attendance exists for this student,
         * default to present just like the original UI.
         */
        status: attendance[String(student.id)] || "present",
      }));

      await markAttendance(courseId, {
        date,
        records,
      });

      setSaved(true);

      toast.success(`Attendance saved for ${date}`);

      /*
       * Reload from database to ensure the UI reflects
       * what was actually saved.
       */
      await loadAttendance(date);
    } catch (err) {
      console.error("Failed to save attendance:", err);

      toast.error(err?.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

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
            className="inline-flex items-center gap-1 text-maroon font-medium text-sm hover:underline">
            <ChevronLeft size={16} />
            Back to my courses
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title={course.title} subtitle={formatSchedule(course)} />

      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon">
          <ChevronLeft size={16} />
          Back to my courses
        </Link>

        <form
          onSubmit={handleSave}
          className="bg-surface border border-border rounded-xl p-6 space-y-5">
          {/* Header */}
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

          {/* Student count */}
          <div className="flex items-center gap-2 text-sm text-inkSoft">
            <Users size={16} />

            <span>
              {students.length} enrolled student
              {students.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Students */}
          {students.length === 0 ? (
            <div className="py-10 text-center text-sm text-inkSoft">
              No students are enrolled in this course.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {students.map((student) => {
                const studentId = String(student.id);

                /*
                 * Original behavior:
                 * no record = present.
                 */
                const status = attendance[studentId] || "present";

                return (
                  <li
                    key={student.id}
                    className="flex items-center justify-between gap-4 py-3.5 flex-wrap">
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
                        }`}>
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
                        }`}>
                        Absent
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Save */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || attendanceLoading || students.length === 0}
              className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
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
