"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { deleteFreeClass, getFreeClasses } from "@/action/admin";


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
    const confirmed = window.confirm(
      "Are you sure you want to delete this free class?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteFreeClass(id);

      setFreeClasses((prev) =>
        prev.filter((item) => item._id !== id)
      );

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

  const formatDateTime = (date) => {
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
  };

  const formatDonation = (amount) => {
    if (!amount) return "—";

    return `৳${Number(amount).toLocaleString("en-IN")}`;
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case "scheduled":
        return "warning";

      case "live":
        return "success";

      case "completed":
        return "success";

      case "cancelled":
        return "danger";

      default:
        return "warning";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
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
                  <th className="px-5 py-3 font-medium">
                    Class
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Teacher
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Time
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Participants
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Donations
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-inkSoft"
                    >
                      Loading free classes...
                    </td>
                  </tr>
                ) : freeClasses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                      {/* Class */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium">
                          {c.title}
                        </div>

                        {c.description && (
                          <div className="text-xs text-inkSoft mt-1 max-w-xs truncate">
                            {c.description}
                          </div>
                        )}
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-3.5 text-inkSoft">
                        {c.teacher?.name || "Not assigned"}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                        {formatDateTime(c.dateTime)}
                      </td>

                      {/* Participants */}
                      <td className="px-5 py-3.5 text-inkSoft">
                        {c.participantCount ?? 0}
                      </td>

                      {/* Donations */}
                      <td className="px-5 py-3.5 text-inkSoft">
                        {formatDonation(c.donationTotal)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge variant={getBadgeVariant(c.status)}>
                          {formatStatus(c.status)}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/free-classes/${c._id}`}
                            className="p-2 rounded-lg hover:bg-muted transition"
                            title="View"
                          >
                            <Eye
                              size={17}
                              className="text-inkSoft"
                            />
                          </Link>

                          <Link
                            href={`/admin/free-classes/${c._id}/edit`}
                            className="p-2 rounded-lg hover:bg-muted transition"
                            title="Edit"
                          >
                            <Pencil
                              size={17}
                              className="text-inkSoft"
                            />
                          </Link>

                          <button
                            type="button"
                            disabled={deletingId === c._id}
                            onClick={() => handleDelete(c._id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2
                              size={17}
                              className="text-red-500"
                            />
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