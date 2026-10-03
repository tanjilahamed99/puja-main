"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import { browseCourses, enrollInCourse } from "@/action/student";

function formatPrice(p) {
  if (p == null) return "—";
  return `৳${Number(p).toLocaleString("en-IN")}`;
}

function scheduleText(course) {
  const days = course?.schedule?.days;
  const time = course?.schedule?.time;
  const tz = course?.schedule?.timezone;
  if (!days || days.length === 0) return "Schedule TBD";
  return `${days.join(", ")}${time ? ` · ${time}` : ""}${
    tz ? ` · ${tz}` : ""
  }`;
}

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openForm, setOpenForm] = useState(null);
  const [method, setMethod] = useState("phonepe");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await browseCourses();
        setCourses(data.courses || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Could not load courses. Please try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEnroll = async (e, course) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const { data } = await enrollInCourse(course._id, { method });
      if (!data.enrollment) {
        setFormError(data.message || "Enrollment failed.");
        return;
      }
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id
            ? { ...c, _enrolled: true, _enrollment: data.enrollment }
            : c
        )
      );
      setOpenForm(null);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || "Enrollment failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar
        title="Courses"
        subtitle="Full-package subscription courses with live classes"
      />
      <main className="px-6 lg:px-10 py-8 space-y-6">
        <PageHeader
          title="Available Courses"
          description="One-time payment. Full access to every scheduled live session."
        />

        {loading && <p className="text-sm text-inkSoft">Loading courses…</p>}
        {!loading && error && <p className="text-sm text-danger">{error}</p>}
        {!loading && !error && courses.length === 0 && (
          <p className="text-sm text-inkSoft">
            No courses are available right now.
          </p>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-5">
            {courses.map((c) => {
              const open = openForm === c._id;
              return (
                <div
                  key={c._id}
                  className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col"
                >
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.title}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <h3 className="font-display text-lg font-semibold">
                      {c.title}
                    </h3>
                    <p className="text-xs text-inkSoft">
                      {c.teacher?.name || "Teacher TBD"} ·{" "}
                      {scheduleText(c)}
                    </p>
                    <p className="text-sm text-inkSoft">{c.description}</p>

                    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                      <span className="font-display text-lg font-semibold">
                        {formatPrice(c.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenForm(open ? null : c._id)
                        }
                        className="bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        {open ? "Cancel" : "Enroll"}
                      </button>
                    </div>

                    {open && (
                      <form
                        onSubmit={(e) => handleEnroll(e, c)}
                        className="pt-3 border-t border-border space-y-3"
                      >
                        <div>
                          <label className="block text-xs font-medium text-inkSoft mb-1">
                            Payment method
                          </label>
                          <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="input"
                          >
                            <option value="phonepe">PhonePe</option>
                            <option value="paypal">PayPal</option>
                          </select>
                        </div>
                        {formError && (
                          <p className="text-sm text-danger">{formError}</p>
                        )}
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-maroon text-ivory px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                        >
                          {submitting
                            ? "Processing…"
                            : `Confirm & Pay ${formatPrice(c.price)}`}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}