"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import Field from "@/components/admin/Field";

import {
  getTeachers,
  getPujaPackages,
  updatePujaPackage,
} from "@/action/admin";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function EditSpecificPujaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    teacher: "",
    status: "draft",
    durationMinutes: 60,
    minLeadTimeHours: 24,
    maxLeadTimeDays: 60,
    timezone: "Asia/Kolkata",
    availabilityNote: "",
  });

  const [requiredFields, setRequiredFields] = useState([]);
  const [newField, setNewField] = useState("");
  const [preferredDays, setPreferredDays] = useState([]);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [packagesResponse, teachersResponse] = await Promise.all([
        getPujaPackages(),
        getTeachers(),
      ]);

      const packages = packagesResponse.data?.packages || [];
      const teacherList =
        teachersResponse.data?.teachers || teachersResponse.data?.users || [];

      setTeachers(teacherList);

      const pkg = packages.find((item) => item._id === id);
      if (!pkg) {
        toast.error("Puja package not found");
        router.push("/admin/specific-puja");
        return;
      }

      setForm({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price !== undefined ? String(pkg.price) : "",
        teacher: pkg.teacher?._id || "",
        status: pkg.status || "draft",
        durationMinutes: pkg.durationMinutes ?? 60,
        minLeadTimeHours: pkg.minLeadTimeHours ?? 24,
        maxLeadTimeDays: pkg.maxLeadTimeDays ?? 60,
        timezone: pkg.timezone || "Asia/Kolkata",
        availabilityNote: pkg.availabilityNote || "",
      });

      setRequiredFields(
        Array.isArray(pkg.requiredInfoFields) ? pkg.requiredInfoFields : [],
      );

      setPreferredDays(
        Array.isArray(pkg.preferredDays) ? pkg.preferredDays : [],
      );
    } catch (error) {
      console.error("Failed to load package:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load puja package",
      );
      router.push("/admin/specific-puja");
    } finally {
      setLoading(false);
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addRequiredField = () => {
    const field = newField.trim();
    if (!field) {
      toast.error("Enter a field name");
      return;
    }
    if (
      requiredFields.some((item) => item.toLowerCase() === field.toLowerCase())
    ) {
      toast.error("This field already exists");
      return;
    }
    setRequiredFields((prev) => [...prev, field]);
    setNewField("");
  };

  const removeRequiredField = (index) => {
    setRequiredFields((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (value) => {
    setPreferredDays((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value].sort(),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter package name");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setSaving(true);

      await updatePujaPackage(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        teacher: form.teacher || undefined,
        requiredInfoFields: requiredFields,
        status: form.status,
        durationMinutes: Number(form.durationMinutes) || 60,
        minLeadTimeHours: Number(form.minLeadTimeHours) || 24,
        maxLeadTimeDays: Number(form.maxLeadTimeDays) || 60,
        timezone: form.timezone?.trim() || "Asia/Kolkata",
        availabilityNote: form.availabilityNote?.trim() || "",
        preferredDays,
      });

      toast.success("Puja package updated successfully");
      router.push("/admin/specific-puja");
    } catch (error) {
      console.error("Update package error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update puja package",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar
          title="Edit Puja Package"
          subtitle="Update private puja package"
        />
        <main className="px-6 lg:px-10 py-8 max-w-2xl">
          <div className="flex justify-center items-center py-20 text-sm text-inkSoft">
            <Loader2 size={18} className="animate-spin mr-2" />
            Loading package...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Edit Puja Package"
        subtitle="Update private puja package"
      />

      <main className="px-6 lg:px-10 py-8 max-w-2xl">
        <Link
          href="/admin/specific-puja"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon">
          <ChevronLeft size={16} />
          Back to specific puja
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 space-y-6">
          {/* -------------------- Basic info -------------------- */}
          <Field label="Package name">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g. Griha Shanti Puja"
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
              placeholder="Describe what is included..."
            />
          </Field>

          <Field label="Price">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-inkSoft">
                ৳
              </span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="1"
                className="input pl-8"
                required
              />
            </div>
          </Field>

          <Field label="Teacher / Priest">
            <select
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              className="input"
              disabled={loadingTeachers}>
              <option value="">
                {loadingTeachers
                  ? "Loading teachers..."
                  : "Select teacher / priest"}
              </option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                  {teacher.email ? ` (${teacher.email})` : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* -------------------- Schedule config -------------------- */}
          <div className="pt-2 border-t border-border space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Scheduling settings
              </h3>
              <p className="text-xs text-inkSoft mt-1">
                These control the slots shown to users when they book this puja.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Duration (minutes)">
                <input
                  type="number"
                  name="durationMinutes"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  min="15"
                  step="15"
                  className="input"
                />
              </Field>
              <Field label="Min lead time (hours)">
                <input
                  type="number"
                  name="minLeadTimeHours"
                  value={form.minLeadTimeHours}
                  onChange={handleChange}
                  min="1"
                  className="input"
                />
              </Field>
              <Field label="Max lead time (days)">
                <input
                  type="number"
                  name="maxLeadTimeDays"
                  value={form.maxLeadTimeDays}
                  onChange={handleChange}
                  min="1"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Priest timezone">
              <input
                type="text"
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                placeholder="Asia/Kolkata"
                className="input"
              />
            </Field>

            <Field label="Availability note (shown to users)">
              <input
                type="text"
                name="availabilityNote"
                value={form.availabilityNote}
                onChange={handleChange}
                placeholder="e.g. Mornings 6–10 AM IST only"
                className="input"
              />
            </Field>

            {/* Preferred days */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preferred days (optional)
              </label>
              <p className="text-xs text-inkSoft mb-3">
                Leave all unchecked to allow any day of the week.
              </p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const active = preferredDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        active
                          ? "bg-maroon text-ivory border-maroon"
                          : "bg-surface border-border text-inkSoft hover:border-maroon"
                      }`}>
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* -------------------- Required fields -------------------- */}
          <div className="pt-2 border-t border-border">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Required customer information
            </label>
            <p className="text-xs text-inkSoft mb-3">
              These fields will be requested from the customer when booking this
              package.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequiredField();
                  }
                }}
                placeholder="e.g. Gotra"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addRequiredField}
                className="inline-flex items-center gap-1.5 px-4 rounded-lg bg-maroon text-ivory text-sm font-medium">
                <Plus size={16} />
                Add
              </button>
            </div>

            {requiredFields.length > 0 && (
              <div className="mt-3 space-y-2">
                {requiredFields.map((field, index) => (
                  <div
                    key={`${field}-${index}`}
                    className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                    <span className="text-sm">{field}</span>
                    <button
                      type="button"
                      onClick={() => removeRequiredField(index)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-500">
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* -------------------- Status -------------------- */}
          <Field label="Status">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>

          {/* -------------------- Actions -------------------- */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Updating..." : "Update Package"}
            </button>
            <Link
              href="/admin/specific-puja"
              className="text-sm text-inkSoft font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
