"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Topbar from "@/components/admin/Topbar";
import Field from "@/components/admin/Field";
import UploadImage from "@/components/UploadImage";
import { useEffect, useState } from "react";
import { createCourse, getTeachers } from "@/action/admin";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NewCoursePage() {
  const router = useRouter();
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);

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
    };

    setSubmitting(true);
    try {
      const { data } = await createCourse(payload);
      if (!data.success) {
        setError(
          data.message || "Could not create the course. Please try again.",
        );
        return;
      }
      router.push("/admin/courses");
      toast.success("Course created successful");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not create the course. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getTeachers();
        if (data.success) {
          setTeachers(data.teachers);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <Topbar title="Add Course" subtitle="Create a new subscription course" />
      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon">
          <ChevronLeft size={16} /> Back to courses
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 space-y-6">
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
                  className="flex items-center gap-1.5 bg-ivorySoft px-3 py-1.5 rounded-lg text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="days"
                    value={d}
                    className="accent-maroon"
                  />{" "}
                  {d}
                </label>
              ))}
            </div>
          </Field>

          <UploadImage
            label="image"
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
                <option>Asia/Dhaka (GMT+6)</option>
                <option>Asia/Kolkata (GMT+5:30)</option>
              </select>
            </Field>
          </div>

          <p className="text-xs text-inkSoft">
            A LiveKit room will be generated automatically for each scheduled
            session once the course is saved.
          </p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {submitting ? "Saving…" : "Save Course"}
            </button>
            <Link
              href="/admin/courses"
              className="text-sm text-inkSoft font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
