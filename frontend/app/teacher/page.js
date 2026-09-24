import Topbar from '@/components/admin/Topbar';
import StatCard from '@/components/admin/StatCard';
import { BookOpen, Users, Radio, Flame } from 'lucide-react';

const upcomingSessions = [
  { id: 1, title: 'Griha Pravesh Puja Basics — Batch 2', type: 'Course', time: 'Today, 6:00 PM' },
  { id: 2, title: 'Ganesh Puja Basics (Free Class)', type: 'Free Class', time: 'Today, 7:00 PM' },
  { id: 3, title: 'Griha Shanti Puja — for Ritika Sharma', type: 'Specific Puja', time: 'Sep 22, 10:00 AM' },
];

const typeStyles = {
  Course: 'bg-[#FBF0DA] text-warning',
  'Free Class': 'bg-ivorySoft text-inkSoft',
  'Specific Puja': 'bg-[#F7E5E5] text-danger',
};

export default function TeacherDashboard() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Your courses, classes, and puja bookings at a glance" />
      <main className="px-6 lg:px-10 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="My Courses" value="2" icon={BookOpen} />
          <StatCard label="Total Students" value="111" icon={Users} />
          <StatCard label="Free Classes (week)" value="1" icon={Radio} />
          <StatCard label="Puja Bookings" value="1" hint="1 confirmed" icon={Flame} />
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display font-semibold">Upcoming Sessions</h3>
          </div>
          <ul>
            {upcomingSessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0 flex-wrap"
              >
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-inkSoft mt-0.5">{s.time}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${typeStyles[s.type]}`}
                >
                  {s.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}