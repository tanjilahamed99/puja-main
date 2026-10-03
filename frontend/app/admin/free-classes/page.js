"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye, Clock, Radio } from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { deleteFreeClass, getFreeClasses } from "@/action/admin";

/* ------------------------------ helpers ------------------------------ */

function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDonation(amount) {
  if (!amount) return "—";
  return `৳${Number(amount).toLocaleString("en-IN")}`;
}

function getBadgeVariant(status) {
  switch (status) {
    case "scheduled":
      return "warning";
    case "live":
      return "success";
    case "completed":
      return "neutral";
    case "cancelled":
      return "danger";
    default:
      return "warning";
  }
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ------------------------------ live window pill ------------------------------ */

function JoinWindowPill({ joinability, status }) {
  const [, force] = useState(0);

  // re-render every second so the countdown updates
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!joinability) return <span className="text-xs text-inkSoft">—</span>;

  if (status === "completed" || status === "cancelled") {
    return <span className="text-xs text-inkSoft">—</span>;
  }

  const now = Date.now();
  const opens = new Date(joinability.opensAt).getTime();
  const closes = new Date(joinability.closesAt).getTime();

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

  if (now > closes) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
        Ended
      </span>
    );
  }

  const diffSec = Math.max(0, Math.floor((opens - now) / 1000));
  const mm = Math.floor(diffSec / 60);
  const ss = diffSec % 60;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Clock size={12} />
      Opens in {mm}m {String(ss).padStart(2, "0")}s
    </span>
  );
}

/* ------------------------------ component ------------------------------ */

export default function FreeClassesPage() {
  const [freeClasses, setFreeClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadFreeClasses = async () => {
    try {
      setLoading(true);
      const res = await getFreeClasses();
      setFreeClasses(res.data?.freeClasses || []);
    } catch (error) {
      console.error("Failed to load free classes:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load free classes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFreeClasses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this free class?"))
      return;
    try {
      setDeletingId(id);
      await deleteFreeClass(id);
      setFreeClasses((prev) => prev.filter((item) => item._id !== id));
      toast.success("Free class deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete free class"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Topbar
        title="Free Classes"
        subtitle="Open sessions for all registered users, with an end-of-class donation box"
      />

      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="All Free Classes"
          description="Free classes are open to any logged-in user — no purchase required."
          actionLabel="Add Free Class"
          actionHref="/admin/free-classes/new"
        />

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Participants</th>
                  <th className="px-5 py-3 font-medium">Donations</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Join Window</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-inkSoft"
                    >
                      Loading free classes...
                    </td>
                  </tr>
                ) : freeClasses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-inkSoft"
                    >
                      No free classes found.
                    </td>
                  </tr>
                ) : (
                  freeClasses.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium">{c.title}</div>
                        {c.description && (
                          <div className="text-xs text-inkSoft mt-1 max-w-xs truncate">
                            {c.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-inkSoft">
                        {c.teacher?.name || "Not assigned"}
                      </td>

                      <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                        {formatDateTime(c.dateTime)}
                        {c.durationMinutes && (
                          <div className="text-[11px] text-inkSoft mt-0.5">
                            {c.durationMinutes} min
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-inkSoft">
                        {c.participantCount ?? 0}
                      </td>

                      <td className="px-5 py-3.5 text-inkSoft">
                        {formatDonation(c.donationTotal)}
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge variant={getBadgeVariant(c.status)}>
                          {formatStatus(c.status)}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5">
                        <JoinWindowPill
                          joinability={c.joinability}
                          status={c.status}
                        />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/free-classes/${c._id}`}
                            className="p-2 rounded-lg hover:bg-muted transition"
                            title="View"
                          >
                            <Eye size={17} className="text-inkSoft" />
                          </Link>
                          <Link
                            href={`/admin/free-classes/${c._id}/edit`}
                            className="p-2 rounded-lg hover:bg-muted transition"
                            title="Edit"
                          >
                            <Pencil size={17} className="text-inkSoft" />
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === c._id}
                            onClick={() => handleDelete(c._id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={17} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}