import Link from 'next/link';
import Topbar from '@/components/admin/Topbar';
import StatCard from '@/components/admin/StatCard';
import Badge from '@/components/admin/Badge';
import { BookOpen, Award, Radio, Flame } from 'lucide-react';

const myCourses = [
  { id: 'griha-pravesh', title: 'Griha Pravesh Puja Basics', teacher: 'Pandit R. Sharma', status: 'Active' },
  { id: 'everyday-puja', title: 'Everyday Puja & Aarti', teacher: 'Pandit S. Chatterjee', status: 'Pending' },
];

const upcoming = [
  { id: 1, title: 'Ganesh Puja Basics (Free Class)', time: 'Today, 7:00 PM', type: 'Free Class' },
  { id: 2, title: 'Griha Shanti Puja (Specific Puja)', time: 'Sep 22, 10:00 AM', type: 'Specific Puja' },
];

export default function StudentDashboard() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Your courses, classes, and puja bookings" />
      <main className="px-6 lg:px-10 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Enrolled Courses" value="2" icon={BookOpen} />
          <StatCard label="Certificates Earned" value="1" icon={Award} />
          <StatCard label="Upcoming Free Classes" value="1" icon={Radio} />
          <StatCard label="Puja Bookings" value="1" hint="1 confirmed" icon={Flame} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold">Continue Learning</h3>
              <Link href="/student/my-courses" className="text-sm text-maroon font-medium hover:underline">
                View all
              </Link>
            </div>
            <ul>
              {myCourses.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0 flex-wrap"
                >
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-inkSoft mt-0.5">{c.teacher}</p>
                  </div>
                  <Badge variant={c.status === 'Active' ? 'success' : 'warning'}>{c.status}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold mb-4">Upcoming</h3>
            <ul className="space-y-4">
              {upcoming.map((u) => (
                <li key={u.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <p className="font-medium text-sm">{u.title}</p>
                  <p className="text-xs text-inkSoft mt-0.5">{u.time}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}