"use client";

import { useEffect, useMemo, useState } from "react";

import Topbar from "@/components/admin/Topbar";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/admin/Badge";

import {
  Users,
  BookOpen,
  Radio,
  Flame,
  Wallet,
  Gift,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import {
  getDashboardStats,
  getRecentEnrollments,
  getUpcomingSessions,
} from "@/action/admin";

function formatCurrency(amount) {
  return `৳ ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(date) {
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

function formatSessionTime(date) {
  if (!date) return "—";

  const sessionDate = new Date(date);

  const now = new Date();

  const today = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    })
  );

  const target = new Date(
    sessionDate.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    })
  );

  const isToday =
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isTomorrow =
    tomorrow.getFullYear() === target.getFullYear() &&
    tomorrow.getMonth() === target.getMonth() &&
    tomorrow.getDate() === target.getDate();

  const time = sessionDate.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today, ${time}`;
  }

  if (isTomorrow) {
    return `Tomorrow, ${time}`;
  }

  return `${sessionDate.toLocaleDateString("en-IN", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${time}`;
}

function getEnrollmentStatus(enrollment) {
  /*
   * If your Enrollment model has a status field,
   * use it here.
   *
   * Otherwise check the related payment if your
   * backend later populates it.
   */
  if (enrollment.status) {
    return enrollment.status;
  }

  return "Paid";
}

function formatEnrollmentStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    freeClassesThisWeek: 0,
    pujaBookings: {
      total: 0,
      pending: 0,
    },
    revenueThisMonth: 0,
    donationsThisMonth: 0,
  });

  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        enrollmentsResponse,
        sessionsResponse,
      ] = await Promise.all([
        getDashboardStats(),
        getRecentEnrollments(),
        getUpcomingSessions(),
      ]);

      setStats({
        totalStudents:
          statsResponse?.data?.totalStudents || 0,

        activeCourses:
          statsResponse?.data?.activeCourses || 0,

        freeClassesThisWeek:
          statsResponse?.data?.freeClassesThisWeek || 0,

        pujaBookings:
          statsResponse?.data?.pujaBookings || {
            total: 0,
            pending: 0,
          },

        revenueThisMonth:
          statsResponse?.data?.revenueThisMonth || 0,

        donationsThisMonth:
          statsResponse?.data?.donationsThisMonth || 0,
      });

      setEnrollments(
        enrollmentsResponse?.data?.enrollments || []
      );

      const freeClasses =
        sessionsResponse?.data?.freeClasses || [];

      const bookings =
        sessionsResponse?.data?.bookings || [];

      /*
       * Convert both backend arrays into the same
       * structure for the UI.
       */
      const formattedFreeClasses = freeClasses.map(
        (session) => ({
          id: `free-class-${session._id}`,
          type: "Free Class",
          title: session.title,
          teacher: session.teacher?.name || "No teacher",
          dateTime: session.dateTime,
        })
      );

      const formattedBookings = bookings.map(
        (booking) => ({
          id: `booking-${booking._id}`,
          type: "Specific Puja",
          title:
            booking.package?.name ||
            "Specific Puja Booking",
          teacher: booking.user?.name
            ? `Booked by ${booking.user.name}`
            : "Customer booking",
          dateTime: booking.scheduledDateTime,
        })
      );

      const combinedSessions = [
        ...formattedFreeClasses,
        ...formattedBookings,
      ]
        .sort(
          (a, b) =>
            new Date(a.dateTime).getTime() -
            new Date(b.dateTime).getTime()
        )
        .slice(0, 5);

      setSessions(combinedSessions);
    } catch (err) {
      console.error("Failed to load dashboard:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to load dashboard data.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Convert backend enrollment data into the format
   * required by the table.
   */
  const recentEnrollments = useMemo(() => {
    return enrollments.map((enrollment) => ({
      id: enrollment._id,
      student:
        enrollment.student?.name || "Unknown Student",
      course:
        enrollment.course?.title || "Unknown Course",
      date: enrollment.createdAt,
      status: getEnrollmentStatus(enrollment),
    }));
  }, [enrollments]);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Overview of your platform's activity"
      />

      <main className="px-6 lg:px-10 py-8 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between gap-4">
            <p className="text-sm text-red-500">{error}</p>

            <button
              onClick={loadDashboard}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceMuted transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Students"
            value={stats.totalStudents.toLocaleString("en-IN")}
            icon={Users}
          />

          <StatCard
            label="Active Courses"
            value={stats.activeCourses.toLocaleString("en-IN")}
            icon={BookOpen}
          />

          <StatCard
            label="Free Classes (week)"
            value={stats.freeClassesThisWeek.toLocaleString(
              "en-IN"
            )}
            icon={Radio}
          />

          <StatCard
            label="Puja Bookings"
            value={stats.pujaBookings.total.toLocaleString(
              "en-IN"
            )}
            hint={`${stats.pujaBookings.pending} pending`}
            icon={Flame}
          />

          <StatCard
            label="Revenue (month)"
            value={formatCurrency(stats.revenueThisMonth)}
            icon={Wallet}
          />

          <StatCard
            label="Donations (month)"
            value={formatCurrency(stats.donationsThisMonth)}
            icon={Gift}
          />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Enrollments */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-display font-semibold">
                Recent Enrollments
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
              </div>
            ) : recentEnrollments.length === 0 ? (
              <div className="py-16 text-center text-sm text-inkSoft">
                No enrollments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-inkSoft border-b border-border">
                      <th className="px-5 py-3 font-medium">
                        Student
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Course
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentEnrollments.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                          {row.student}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft min-w-[220px]">
                          {row.course}
                        </td>

                        <td className="px-5 py-3.5 text-inkSoft whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              row.status === "paid" ||
                              row.status === "success" ||
                              row.status === "Paid"
                                ? "success"
                                : "warning"
                            }
                          >
                            {formatEnrollmentStatus(row.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold mb-4">
              Upcoming Sessions
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-inkSoft" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-10 text-center text-sm text-inkSoft">
                No upcoming sessions.
              </div>
            ) : (
              <ul className="space-y-4">
                {sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-col gap-1 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium text-sm">
                        {session.title}
                      </span>

                      <Badge
                        variant={
                          session.type === "Free Class"
                            ? "success"
                            : "warning"
                        }
                      >
                        {session.type}
                      </Badge>
                    </div>

                    <span className="text-xs text-inkSoft">
                      {session.teacher}
                    </span>

                    <span className="text-xs text-inkSoft">
                      {formatSessionTime(session.dateTime)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}