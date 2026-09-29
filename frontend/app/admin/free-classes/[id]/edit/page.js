"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import Field from "@/components/admin/Field";
import { getFreeClass, getTeachers, updateFreeClass } from "@/action/admin";
import UploadImage from "@/components/UploadImage";


export default function EditFreeClassPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    teacher: "",
    date: "",
    time: "",
    status: "scheduled",
  });

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [classResponse, teachersResponse] =
        await Promise.all([
          getFreeClass(id),
          getTeachers(),
        ]);

      const freeClass =
        classResponse.data?.freeClass;

      const teacherList =
        teachersResponse.data?.teachers ||
        teachersResponse.data?.users ||
        [];

      setTeachers(teacherList);

      if (!freeClass) {
        toast.error("Free class not found");
        router.push("/admin/free-classes");
        return;
      }

      const classDate = freeClass.dateTime
        ? new Date(freeClass.dateTime)
        : null;

      setForm({
        title: freeClass.title || "",
        description: freeClass.description || "",
        image: freeClass.image || "",
        teacher: freeClass.teacher?._id || "",
        date: classDate
          ? formatDateForInput(classDate)
          : "",
        time: classDate
          ? formatTimeForInput(classDate)
          : "",
        status: freeClass.status || "scheduled",
      });
    } catch (error) {
      console.error(
        "Failed to load free class:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load free class"
      );

      router.push("/admin/free-classes");
    } finally {
      setLoading(false);
      setLoadingTeachers(false);
    }
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date) => {
    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({
      ...prev,
      image: url,
    }));
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

      const dateTime = new Date(
        `${form.date}T${form.time}`
      );

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
        status: form.status,
      };

      await updateFreeClass(id, payload);

      toast.success(
        "Free class updated successfully"
      );

      router.push("/admin/free-classes");
    } catch (error) {
      console.error(
        "Update free class error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update free class"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar
          title="Edit Free Class"
          subtitle="Update free class details"
        />

        <main className="px-6 lg:px-10 py-8 max-w-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-sm text-inkSoft">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading free class...
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Edit Free Class"
        subtitle="Update free class details"
      />

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
          {/* Image */}
          <UploadImage
            label="Class image"
            value={form.image}
            onChange={handleImageChange}
          />

          {/* Title */}
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

          {/* Description */}
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

          {/* Teacher */}
          <Field label="Assign teacher">
            <select
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              className="input"
              disabled={loadingTeachers}
            >
              <option value="">
                {loadingTeachers
                  ? "Loading teachers..."
                  : "Select a teacher"}
              </option>

              {teachers.map((teacher) => (
                <option
                  key={teacher._id}
                  value={teacher._id}
                >
                  {teacher.name}
                  {teacher.email
                    ? ` (${teacher.email})`
                    : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* Date / Time */}
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

          {/* Status */}
          <Field label="Status">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input"
            >
              <option value="scheduled">
                Scheduled
              </option>

              <option value="live">
                Live
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </Field>

          <p className="text-xs text-inkSoft">
            Only logged-in registered users will be able
            to join. Updating the status manually can be
            useful for managing completed or cancelled
            sessions.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Updating..."
                : "Update Free Class"}
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