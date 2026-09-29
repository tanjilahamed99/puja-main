"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Loader2,
  CalendarDays,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";

import { getMyFreeClasses } from "@/action/teacher";

function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusVariant(status) {
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
      return "neutral";
  }
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TeacherFreeClassesPage() {
  const [freeClasses, setFreeClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFreeClasses();
  }, []);

  const loadFreeClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyFreeClasses();

      setFreeClasses(
        response?.data?.freeClasses || []
      );
    } catch (err) {
      console.error(
        "Failed to load free classes:",
        err
      );

      const message =
        err?.response?.data?.message ||
        "Failed to load free classes.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title="My Free Classes"
        subtitle="Free classes assigned to you by the admin"
      />

      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Assigned Free Classes"
          description="View your upcoming and previous free classes."
        />

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-danger">
                {error}
              </p>

              <button
                onClick={loadFreeClasses}
                className="mt-4 px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceMuted transition"
              >
                Try Again
              </button>
            </div>
          ) : freeClasses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-inkSoft">
                No free classes have been assigned to you.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">
                      Class
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Date & Time
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Live Class
                    </th>

                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>

                <tbody>
                  {freeClasses.map((freeClass) => (
                    <tr
                      key={freeClass._id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium">
                          {freeClass.title}
                        </div>

                        {freeClass.description && (
                          <div className="text-xs text-inkSoft mt-1 max-w-md truncate">
                            {freeClass.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />

                          {formatDateTime(
                            freeClass.dateTime
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          variant={getStatusVariant(
                            freeClass.status
                          )}
                        >
                          {formatStatus(
                            freeClass.status
                          )}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5">
                        {freeClass.liveKitRoomId ? (
                          <span className="inline-flex items-center gap-1.5 text-success text-xs font-medium">
                            <Video size={14} />
                            LiveKit Ready
                          </span>
                        ) : (
                          <span className="text-xs text-inkSoft">
                            Not configured
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/teacher/free-classes/${freeClass._id}`}
                          className="inline-flex items-center gap-1.5 text-maroon font-medium text-sm hover:underline"
                        >
                          <Eye size={15} />
                          View class
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}