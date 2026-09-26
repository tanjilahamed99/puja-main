"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import Field from "@/components/admin/Field";
import UploadImage from "@/components/UploadImage";

import { getCourse, updateCourse, getTeachers } from "@/action/admin";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();

  const courseId = params.id;

  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teachers, setTeachers] = useState([]);

  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [courseRes, teachersRes] = await Promise.all([
          getCourse(courseId),
          getTeachers(),
        ]);

        if (courseRes.data?.course) {
          const existingCourse = courseRes.data.course;

          setCourse(existingCourse);

          // Existing course image
          setImage(existingCourse.image || "");
        } else {
          setError("Course not found.");
        }

        if (teachersRes.data?.success) {
          setTeachers(teachersRes.data.teachers || []);
        }
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Could not load the course. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!image) {
      setError("Please upload a course image.");
      return;
    }

    const form = new FormData(e.target);

    const title = form.get("title")?.trim();
    const description = form.get("description")?.trim();
    const category = form.get("category");
    const price = Number(form.get("price"));
    const teacher = form.get("teacher");

    const days = form.getAll("days");
    const time = form.get("time");
    const timezone = form.get("timezone");

    // Validation
    if (!title) {
      setError("Course title is required.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (!teacher) {
      setError("Please select a teacher.");
      return;
    }

    const payload = {
      title,
      description,
      category,
      price,
      teacher,

      schedule: {
        days,
        time,
        timezone,
      },

      image,
    };

    setSubmitting(true);

    try {
      const { data } = await updateCourse(courseId, payload);

      if (!data.success) {
        setError(
          data.message || "Could not update the course. Please try again.",
        );

        return;
      }

      toast.success("Course updated successfully");

      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Could not update the course. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Edit Course" subtitle="Update course information" />

        <main className="px-6 py-8 lg:px-10">
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-inkSoft">Loading course...</p>
          </div>
        </main>
      </>
    );
  }

  if (error && !course) {
    return (
      <>
        <Topbar title="Edit Course" subtitle="Update course information" />

        <main className="px-6 py-8 lg:px-10">
          <Link
            href="/admin/courses"
            className="mb-6 inline-flex items-center gap-1 text-sm text-inkSoft hover:text-maroon">
            <ChevronLeft size={16} />
            Back to courses
          </Link>

          <div className="rounded-xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-danger">{error}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Edit Course" subtitle="Update course information" />

      <main className="max-w-3xl px-6 py-8 lg:px-10">
        <Link
          href="/admin/courses"
          className="mb-6 inline-flex items-center gap-1 text-sm text-inkSoft hover:text-maroon">
          <ChevronLeft size={16} />
          Back to courses
        </Link>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-border bg-surface p-6">
          {/* Course title */}
          <Field label="Course title">
            <input
              name="title"
              type="text"
              required
              defaultValue={course?.title || ""}
              placeholder="e.g. Griha Pravesh Puja Basics"
              className="input"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              name="description"
              rows={4}
              defaultValue={course?.description || ""}
              placeholder="What will students learn in this course?"
              className="input"
            />
          </Field>

          {/* Category + Price */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Category">
              <select
                name="category"
                defaultValue={course?.category || "Griha Puja"}
                className="input">
                <option>Griha Puja</option>
                <option>Festival Puja</option>
                <option>Everyday Rituals</option>
                <option>Vedic Basics</option>
              </select>
            </Field>

            <Field label="Price (one-time, full package)">
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={course?.price ?? ""}
                placeholder="1499"
                className="input"
              />
            </Field>
          </div>

          {/* Teacher */}
          <Field label="Assign teacher">
            <select
              name="teacher"
              defaultValue={course?.teacher?._id || course?.teacher || ""}
              className="input">
              <option value="" disabled>
                Select teacher
              </option>

              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Days */}
          <Field label="Class days">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const selectedDays = course?.schedule?.days || [];

                const checked = selectedDays.includes(day);

                return (
                  <label
                    key={day}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-ivorySoft px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      name="days"
                      value={day}
                      defaultChecked={checked}
                      className="accent-maroon"
                    />

                    {day}
                  </label>
                );
              })}
            </div>
          </Field>

          {/* Image */}
          <UploadImage
            label="Course image"
            value={image}
            onChange={setImage}
            required
          />

          {/* Time + Timezone */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Class time">
              <input
                name="time"
                type="time"
                defaultValue={course?.schedule?.time || ""}
                className="input"
              />
            </Field>

            <Field label="Timezone">
              <select
                name="timezone"
                defaultValue={
                  course?.schedule?.timezone || "Asia/Dhaka (GMT+6)"
                }
                className="input">
                <option>Asia/Dhaka (GMT+6)</option>
                <option>Asia/Kolkata (GMT+5:30)</option>
              </select>
            </Field>
          </div>

          <p className="text-xs text-inkSoft">
            A LiveKit room will be generated automatically for each scheduled
            session once the course is saved.
          </p>

          {/* Error */}
          {error && <p className="text-sm text-danger">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-60">
              {submitting ? "Updating…" : "Update Course"}
            </button>

            <Link
              href="/admin/courses"
              className="text-sm font-medium text-inkSoft">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
