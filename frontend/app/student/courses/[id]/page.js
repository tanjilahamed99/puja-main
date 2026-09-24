'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import Topbar from '@/components/admin/Topbar';

const COURSES = {
  'griha-pravesh': {
    title: 'Griha Pravesh Puja Basics',
    teacher: 'Pandit R. Sharma',
    category: 'Griha Puja',
    price: '৳1,499',
    schedule: 'Mon, Wed · 6:00 PM (Asia/Dhaka)',
    description:
      'Learn the essential rituals performed when moving into a new home — from the items you need to the mantras chanted at each step.',
    enrolled: true,
  },
  'durga-puja': {
    title: 'Durga Puja Rituals for Families',
    teacher: 'Pandit K. Joshi',
    category: 'Festival Puja',
    price: '৳1,999',
    schedule: 'Tue, Thu · 7:00 PM (Asia/Dhaka)',
    description: 'A complete guide to performing Durga Puja at home, across all the key days of the festival.',
    enrolled: false,
  },
  'everyday-puja': {
    title: 'Everyday Puja & Aarti',
    teacher: 'Pandit S. Chatterjee',
    category: 'Everyday Rituals',
    price: '৳999',
    schedule: 'Sat · 9:00 AM (Asia/Dhaka)',
    description: 'Daily rituals and aarti for a peaceful household — a great starting point if you are new to regular puja.',
    enrolled: true,
  },
};

export default function CourseDetailPage({ params }) {
  const course = COURSES[params.id];
  const [enrolled, setEnrolled] = useState(course?.enrolled || false);
  const [method, setMethod] = useState('phonepe');

  if (!course) {
    return (
      <>
        <Topbar title="Course not found" />
        <main className="px-6 lg:px-10 py-8">
          <Link href="/student/courses" className="text-maroon font-medium text-sm hover:underline">
            Back to courses
          </Link>
        </main>
      </>
    );
  }

  const handleEnroll = (e) => {
    e.preventDefault();
    // No backend wired up yet — this would call
    // POST /api/student/courses/:id/enroll with { method }
    setEnrolled(true);
  };

  return (
    <>
      <Topbar title={course.title} subtitle={course.teacher} />
      <main className="px-6 lg:px-10 py-8 max-w-2xl">
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to courses
        </Link>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <span className="inline-flex text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
            {course.category}
          </span>
          <p className="text-sm text-inkSoft leading-relaxed">{course.description}</p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-inkSoft">Teacher</p>
              <p className="font-medium mt-0.5">{course.teacher}</p>
            </div>
            <div>
              <p className="text-inkSoft">Schedule</p>
              <p className="font-medium mt-0.5">{course.schedule}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            {enrolled ? (
              <div className="flex items-center gap-2 text-success font-medium text-sm">
                <CheckCircle2 size={18} />
                You&apos;re enrolled — the class link will appear on your dashboard before each session.
              </div>
            ) : (
              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="font-display text-2xl font-semibold">{course.price}</span>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="input w-auto"
                  >
                    <option value="phonepe">Pay with PhonePe</option>
                    <option value="paypal">Pay with PayPal</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-maroon text-ivory px-6 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Enroll Now — Full Package
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}