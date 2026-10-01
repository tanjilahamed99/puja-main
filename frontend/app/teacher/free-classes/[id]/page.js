"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CalendarDays, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import Badge from "@/components/admin/Badge";

import { getMyFreeClasses } from "@/action/teacher";

function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "2-digit",
    month: "long",
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

export default function TeacherFreeClassDetailPage() {
  const params = useParams();
  const router = useRouter();

  const classId = params?.id;

  const [freeClass, setFreeClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) return;
    loadFreeClass();
  }, [classId]);

  const loadFreeClass = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyFreeClasses();
      const classes = response?.data?.freeClasses || [];
      const foundClass = classes.find((item) => String(item._id) === String(classId));

      if (!foundClass) {
        setError("Free class not found or not assigned to you.");
        setFreeClass(null);
        return;
      }

      setFreeClass(foundClass);
    } catch (err) {
      console.error("Failed to load free class:", err);
      const message = err?.response?.data?.message || "Failed to load free class.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const goLive = () => {
    router.push(`/live/teacher/${classId}`);
  };

  if (loading) {
    return (
      <>
        <Topbar title="Free Class" subtitle="Loading..." />
        <main className="px-6 lg:px-10 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
          </div>
        </main>
      </>
    );
  }

  if (!freeClass) {
    return (
      <>
        <Topbar
          title="Free Class Not Found"
          subtitle={error || "The requested free class could not be found."}
        />
        <main className="px-6 lg:px-10 py-8">
          <Link
            href="/teacher/free-classes"
            className="inline-flex items-center gap-1 text-maroon font-medium text-sm hover:underline"
          >
            <ChevronLeft size={16} />
            Back to free classes
          </Link>
        </main>
      </>
    );
  }

  // A teacher can start a scheduled class (which flips it live), or
  // rejoin one that's already live. Completed/cancelled classes get no
  // live-session button at all.
  const canGoLive = freeClass.status === "scheduled" || freeClass.status === "live";

  return (
    <>
      <Topbar title={freeClass.title} subtitle="Free Class" />

      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/teacher/free-classes"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} />
          Back to free classes
        </Link>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-xl font-semibold">{freeClass.title}</h1>
              <p className="text-sm text-inkSoft mt-2">Free class assigned to you by the admin.</p>
            </div>
            <Badge variant={getStatusVariant(freeClass.status)}>{formatStatus(freeClass.status)}</Badge>
          </div>

          {freeClass.description && (
            <div>
              <h3 className="font-medium text-sm mb-2">Description</h3>
              <p className="text-sm text-inkSoft leading-6 whitespace-pre-wrap">
                {freeClass.description}
              </p>
            </div>
          )}

          <div className="border-t border-border pt-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-maroon">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">Date & Time</p>
                <p className="text-sm text-inkSoft mt-1">{formatDateTime(freeClass.dateTime)}</p>
                <p className="text-xs text-inkSoft mt-1">Asia/Dhaka</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-maroon">
                <Video size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">Live Class</p>
                {freeClass.liveKitRoomId ? (
                  <>
                    <p className="text-sm text-success mt-1">LiveKit room is configured.</p>
                    <p className="text-xs text-inkSoft mt-1 break-all">
                      Room: {freeClass.liveKitRoomId}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-inkSoft mt-1">
                    LiveKit room has not been configured yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="font-medium text-sm mb-3">Class Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-ivorySoft rounded-lg p-4">
                <p className="text-xs text-inkSoft">Status</p>
                <p className="text-sm font-medium mt-1">{formatStatus(freeClass.status)}</p>
              </div>
              <div className="bg-ivorySoft rounded-lg p-4">
                <p className="text-xs text-inkSoft">Created</p>
                <p className="text-sm font-medium mt-1">{formatDateTime(freeClass.createdAt)}</p>
              </div>
            </div>
          </div>

          {canGoLive && freeClass.liveKitRoomId && (
            <div className="border-t border-border pt-5">
              <button
                type="button"
                onClick={goLive}
                className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
              >
                <Video size={16} />
                {freeClass.status === "live" ? "Rejoin Live Class" : "Start Live Class"}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}