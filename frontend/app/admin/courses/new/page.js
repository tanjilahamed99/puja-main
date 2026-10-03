"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import Field from "@/components/admin/Field";
import UploadImage from "@/components/UploadImage";
import { createCourse, getTeachers } from "@/action/admin";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NewCoursePage() {
  const router = useRouter();
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getTeachers();
        if (data.success) setTeachers(data.teachers);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!image) {
      setError("Please upload a course image.");
      return;
    }

    const form = new FormData(e.target);
    const price = Number(form.get("price"));
    if (!form.get("title").trim()) {
      setError("Course title is required.");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    const payload = {
      title: form.get("title").trim(),
      description: form.get("description").trim(),
      category: form.get("category"),
      price,
      teacher: form.get("teacher"),
      schedule: {
        days: form.getAll("days"),
        time: form.get("time"),
        timezone: form.get("timezone"),
      },
      image,
      durationMinutes: Number(form.get("durationMinutes")) || 60,
      joinLeadMinutes: Number(form.get("joinLeadMinutes")) || 10,
      joinGraceMinutes: Number(form.get("joinGraceMinutes")) || 15,
      startDate: form.get("startDate") || undefined,
      endDate: form.get("endDate") || undefined,
      totalSessions: Number(form.get("totalSessions")) || 0,
      status: form.get("status") || "draft",
    };

    setSubmitting(true);
    try {
      const { data } = await createCourse(payload);
      if (!data.success) {
        setError(data.message || "Could not create the course.");
        return;
      }
      toast.success("Course created successfully");
      router.push("/admin/courses");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Could not create the course."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Add Course" subtitle="Create a new subscription course" />

      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to courses
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 space-y-6"
        >
          <Field label="Course title">
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Griha Pravesh Puja Basics"
              className="input"
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              rows={4}
              placeholder="What will students learn in this course?"
              className="input"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Category">
              <select name="category" className="input">
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
                placeholder="1499"
                className="input"
              />
            </Field>
          </div>

          <Field label="Assign teacher">
            <select name="teacher" className="input">
              <option value="">Select a teacher</option>
              {teachers?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class days">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-1.5 bg-ivorySoft px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="days"
                    value={d}
                    className="accent-maroon"
                  />
                  {d}
                </label>
              ))}
            </div>
          </Field>

          <UploadImage
            label="Course image"
            value={image}
            onChange={setImage}
            required
          />

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Class time">
              <input name="time" type="time" className="input" />
            </Field>
            <Field label="Timezone">
              <select name="timezone" className="input">
                <option>Asia/Dhaka</option>
                <option>Asia/Kolkata</option>
              </select>
            </Field>
          </div>

          {/* NEW: session window config */}
          <div className="pt-2 border-t border-border space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Session window settings
              </h3>
              <p className="text-xs text-inkSoft mt-1">
                Applied to every recurring session of this course.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Duration (min)">
                <input
                  name="durationMinutes"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  defaultValue="60"
                  className="input"
                />
              </Field>
              <Field label="Opens before start (min)">
                <input
                  name="joinLeadMinutes"
                  type="number"
                  min="0"
                  max="120"
                  defaultValue="10"
                  className="input"
                />
              </Field>
              <Field label="Grace after end (min)">
                <input
                  name="joinGraceMinutes"
                  type="number"
                  min="0"
                  max="120"
                  defaultValue="15"
                  className="input"
                />
              </Field>
            </div>
          </div>

          {/* NEW: lifecycle */}
          <div className="pt-2 border-t border-border space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Course lifecycle
              </h3>
              <p className="text-xs text-inkSoft mt-1">
                Optional: set start/end dates and total sessions for progress
                tracking.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Start date">
                <input
                  name="startDate"
                  type="date"
                  className="input"
                />
              </Field>
              <Field label="End date">
                <input name="endDate" type="date" className="input" />
              </Field>
              <Field label="Total sessions">
                <input
                  name="totalSessions"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue="0"
                  className="input"
                />
              </Field>
            </div>
          </div>

          <Field label="Status">
            <select name="status" className="input" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>

          <p className="text-xs text-inkSoft">
            A LiveKit room is created automatically. Every scheduled session
            reuses the same room with its own join window.
          </p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Course"}
            </button>
            <Link
              href="/admin/courses"
              className="text-sm text-inkSoft font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}