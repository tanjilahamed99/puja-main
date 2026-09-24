import Topbar from '@/components/admin/Topbar';
import StatCard from '@/components/admin/StatCard';
import Badge from '@/components/admin/Badge';
import { Users, BookOpen, Radio, Flame, Wallet, Gift } from 'lucide-react';

const recentEnrollments = [
  { id: 1, student: 'Ritika Sharma', course: 'Griha Pravesh Puja Basics', date: 'Sep 17, 2026', status: 'Paid' },
  { id: 2, student: 'Abir Hasan', course: 'Durga Puja Rituals for Families', date: 'Sep 16, 2026', status: 'Paid' },
  { id: 3, student: 'Priya Nair', course: 'Everyday Puja & Aarti', date: 'Sep 15, 2026', status: 'Pending' },
  { id: 4, student: 'Sourav Das', course: 'Satyanarayan Puja Vidhi', date: 'Sep 14, 2026', status: 'Paid' },
];

const upcomingSessions = [
  { id: 1, title: 'Ganesh Puja Basics (Free Class)', teacher: 'Pandit R. Sharma', time: 'Today, 7:00 PM' },
  { id: 2, title: 'Satyanarayan Puja Vidhi — Batch 3', teacher: 'Pandit K. Joshi', time: 'Tomorrow, 6:00 PM' },
  { id: 3, title: 'Specific Puja — Griha Shanti', teacher: 'Pandit R. Sharma', time: 'Sep 21, 10:00 AM' },
];

export default function AdminDashboard() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of your platform's activity" />
      <main className="px-6 lg:px-10 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Students" value="1,284" icon={Users} />
          <StatCard label="Active Courses" value="42" icon={BookOpen} />
          <StatCard label="Free Classes (week)" value="18" icon={Radio} />
          <StatCard label="Puja Bookings" value="9" hint="3 pending" icon={Flame} />
          <StatCard label="Revenue (month)" value="৳ 3,42,000" icon={Wallet} />
          <StatCard label="Donations (month)" value="৳ 28,450" icon={Gift} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-display font-semibold">Recent Enrollments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Course</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{row.student}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{row.course}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{row.date}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={row.status === 'Paid' ? 'success' : 'warning'}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold mb-4">Upcoming Sessions</h3>
            <ul className="space-y-4">
              {upcomingSessions.map((s) => (
                <li key={s.id} className="flex flex-col gap-0.5 pb-4 border-b border-border last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{s.title}</span>
                  <span className="text-xs text-inkSoft">
                    {s.teacher} · {s.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
