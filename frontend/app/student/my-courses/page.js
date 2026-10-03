"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import JoinPujaButton from "@/components/JoinPujaButton";
import { getMyEnrollments, getCourseLiveKitToken } from "@/action/student";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const badgeVariant = {
  active: "success",
  pending: "warning",
  completed: "neutral",
  cancelled: "danger",
};

const statusLabel = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyEnrollments();
        setEnrollments(data.enrollments || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Could not load your courses. Please try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Topbar title="My Courses" subtitle="Courses you're enrolled in" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Enrollment History"
          description="A completed course has a certificate waiting for you."
        />

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="px-5 py-3 font-medium">Started</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Session</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-inkSoft"
                    >
                      Loading your courses…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-danger"
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && enrollments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-inkSoft"
                    >
                      You haven&apos;t enrolled in any courses yet.{" "}
                      <Link
                        href="/student/courses"
                        className="text-maroon font-medium hover:underline"
                      >
                        Browse courses
                      </Link>
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  enrollments.map((e) => {
                    const course = e.course;
                    const canJoin =
                      e.status === "active" &&
                      course?.liveKitRoomId &&
                      e.joinability;

                    return (
                      <tr
                        key={e._id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5 font-medium">
                          {course?.title || "Course removed"}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {course?.teacher?.name || "Teacher TBD"}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatDate(e.startDate)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={badgeVariant[e.status] || "neutral"}>
                            {statusLabel[e.status] || e.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {e.status === "completed" ? (
                            <Link
                              href="/student/certificates"
                              className="text-maroon font-medium text-sm hover:underline"
                            >
                              View certificate
                            </Link>
                          ) : canJoin ? (
                            <JoinPujaButton
                              bookingId={course._id}
                              opensAt={e.joinability.opensAt}
                              closesAt={e.joinability.closesAt}
                              canJoin={e.joinability.canJoin}
                              joinPath={`/live/course/student/${course._id}`}
                              fetchToken={getCourseLiveKitToken}
                              label="Join Class"
                              size="sm"
                            />
                          ) : course ? (
                            <Link
                              href={`/student/courses/${course._id}`}
                              className="text-maroon font-medium text-sm hover:underline"
                            >
                              Open
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}