"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createFreeClass, getTeachers } from "@/action/admin";
import Topbar from "@/components/admin/Topbar";
import UploadImage from "@/components/UploadImage";
import Field from "@/components/admin/Field";

export default function NewFreeClassPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    teacher: "",
    date: "",
    time: "",
    durationMinutes: 60,
    joinLeadMinutes: 5,
    joinGraceMinutes: 15,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await getTeachers();
      setTeachers(res.data?.users || res.data?.teachers || []);
    } catch (error) {
      console.error("Failed to load teachers:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load teachers"
      );
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a class title");
      return;
    }
    if (!form.date) {
      toast.error("Please select a date");
      return;
    }
    if (!form.time) {
      toast.error("Please select a time");
      return;
    }

    try {
      setSaving(true);

      const dateTime = new Date(`${form.date}T${form.time}`);
      if (Number.isNaN(dateTime.getTime())) {
        toast.error("Invalid date or time");
        return;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image,
        teacher: form.teacher || undefined,
        dateTime: dateTime.toISOString(),
        durationMinutes: Number(form.durationMinutes) || 60,
        joinLeadMinutes: Number(form.joinLeadMinutes) || 0,
        joinGraceMinutes: Number(form.joinGraceMinutes) || 0,
      };

      await createFreeClass(payload);
      toast.success("Free class created successfully");
      router.push("/admin/free-classes");
    } catch (error) {
      console.error("Create free class error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create free class"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar title="Add Free Class" subtitle="Schedule a new open session" />

      <main className="px-6 lg:px-10 py-8 max-w-2xl">
        <Link
          href="/admin/free-classes"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} />
          Back to free classes
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 space-y-6"
        >
          <UploadImage
            label="Class image"
            value={form.image}
            onChange={handleImageChange}
          />

          <Field label="Class title">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Ganesh Puja Basics"
              className="input"
              required
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="input"
              placeholder="What will this session cover?"
            />
          </Field>

          <Field label="Assign teacher">
            <select
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              className="input"
              disabled={loadingTeachers}
            >
              <option value="">
                {loadingTeachers ? "Loading teachers..." : "Select a teacher"}
              </option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                  {teacher.email ? ` (${teacher.email})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Date">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input"
                required
              />
            </Field>
            <Field label="Time">
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="input"
                required
              />
            </Field>
          </div>

          {/* NEW: session window config */}
          <div className="pt-2 border-t border-border space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Join window settings
              </h3>
              <p className="text-xs text-inkSoft mt-1">
                Controls when students can enter the LiveKit room.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Duration (min)">
                <input
                  type="number"
                  name="durationMinutes"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  min="5"
                  max="480"
                  step="5"
                  className="input"
                  placeholder="60"
                />
              </Field>
              <Field label="Opens before start (min)">
                <input
                  type="number"
                  name="joinLeadMinutes"
                  value={form.joinLeadMinutes}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  className="input"
                  placeholder="5"
                />
              </Field>
              <Field label="Grace after end (min)">
                <input
                  type="number"
                  name="joinGraceMinutes"
                  value={form.joinGraceMinutes}
                  onChange={handleChange}
                  min="0"
                  max="120"
                  className="input"
                  placeholder="15"
                />
              </Field>
            </div>
          </div>

          <p className="text-xs text-inkSoft">
            Only logged-in registered users will be able to join — guests are
            not permitted. A donation prompt is shown at the end of the
            session.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Free Class"}
            </button>
            <Link
              href="/admin/free-classes"
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