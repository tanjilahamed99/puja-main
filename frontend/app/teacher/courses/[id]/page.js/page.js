'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import Topbar from '@/components/admin/Topbar';

const COURSES = {
  'griha-pravesh': {
    title: 'Griha Pravesh Puja Basics',
    schedule: 'Mon, Wed · 6:00 PM (Asia/Dhaka)',
    students: [
      { id: 's1', name: 'Ritika Sharma', email: 'ritika@example.com' },
      { id: 's2', name: 'Abir Hasan', email: 'abir@example.com' },
      { id: 's3', name: 'Priya Nair', email: 'priya@example.com' },
      { id: 's4', name: 'Sourav Das', email: 'sourav@example.com' },
    ],
  },
  satyanarayan: {
    title: 'Satyanarayan Puja Vidhi',
    schedule: 'Fri · 5:00 PM (Asia/Dhaka)',
    students: [
      { id: 's5', name: 'Meera Iyer', email: 'meera@example.com' },
      { id: 's6', name: 'Rohan Dutta', email: 'rohan@example.com' },
    ],
  },
};

export default function TeacherCourseDetailPage({ params }) {
  const course = COURSES[params.id];
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [saved, setSaved] = useState(false);

  if (!course) {
    return (
      <>
        <Topbar title="Course not found" />
        <main className="px-6 lg:px-10 py-8">
          <Link href="/teacher/courses" className="text-maroon font-medium text-sm hover:underline">
            Back to my courses
          </Link>
        </main>
      </>
    );
  }

  const setStatus = (studentId, status) => {
    setSaved(false);
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // No backend wired up yet — this would POST to
    // /api/teacher/courses/:id/attendance with { date, records }
    setSaved(true);
  };

  return (
    <>
      <Topbar title={course.title} subtitle={course.schedule} />
      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to my courses
        </Link>

        <form
          onSubmit={handleSave}
          className="bg-surface border border-border rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-lg font-semibold">Mark Attendance</h2>
              <p className="text-sm text-inkSoft mt-1">Select present/absent for each student, then save.</p>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSaved(false);
              }}
              className="input w-auto"
            />
          </div>

          <ul className="divide-y divide-border">
            {course.students.map((student) => {
              const status = attendance[student.id] || 'present';
              return (
                <li key={student.id} className="flex items-center justify-between gap-4 py-3.5 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-inkSoft">{student.email}</p>
                  </div>
                  <div className="flex bg-ivorySoft rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setStatus(student.id, 'present')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        status === 'present' ? 'bg-success text-ivory' : 'text-inkSoft'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(student.id, 'absent')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        status === 'absent' ? 'bg-danger text-ivory' : 'text-inkSoft'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold">
              Save Attendance
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
                <Check size={16} /> Saved for {date}
              </span>
            )}
          </div>
        </form>
      </main>
    </>
  );
}