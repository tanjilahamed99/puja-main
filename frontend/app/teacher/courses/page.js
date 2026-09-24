import Link from 'next/link';
import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const myCourses = [
  {
    id: 'griha-pravesh',
    title: 'Griha Pravesh Puja Basics',
    students: 64,
    days: 'Mon, Wed',
    time: '6:00 PM',
    status: 'Active',
  },
  {
    id: 'satyanarayan',
    title: 'Satyanarayan Puja Vidhi',
    students: 47,
    days: 'Fri',
    time: '5:00 PM',
    status: 'Draft',
  },
];

export default function TeacherCoursesPage() {
  return (
    <>
      <Topbar title="My Courses" subtitle="Courses assigned to you by the admin" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Assigned Courses"
          description="Open a course to view enrolled students and mark attendance."
        />
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Students</th>
                  <th className="px-5 py-3 font-medium">Schedule</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {myCourses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium">{c.title}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.students}</td>
                    <td className="px-5 py-3.5 text-inkSoft">
                      {c.days} · {c.time}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.status === 'Active' ? 'success' : 'neutral'}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/teacher/courses/${c.id}`}
                        className="text-maroon font-medium text-sm hover:underline"
                      >
                        View class
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}