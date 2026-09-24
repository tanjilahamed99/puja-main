import Link from 'next/link';
import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const myCourses = [
  {
    id: 'griha-pravesh',
    title: 'Griha Pravesh Puja Basics',
    teacher: 'Pandit R. Sharma',
    status: 'Active',
    startDate: 'Sep 1, 2026',
  },
  {
    id: 'everyday-puja',
    title: 'Everyday Puja & Aarti',
    teacher: 'Pandit S. Chatterjee',
    status: 'Pending',
    startDate: 'Sep 18, 2026',
  },
  {
    id: 'satyanarayan',
    title: 'Satyanarayan Puja Vidhi',
    teacher: 'Pandit R. Sharma',
    status: 'Completed',
    startDate: 'Jul 5, 2026',
  },
];

const badgeVariant = { Active: 'success', Pending: 'warning', Completed: 'neutral' };

export default function MyCoursesPage() {
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
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {myCourses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium">{c.title}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.teacher}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.startDate}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={badgeVariant[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {c.status === 'Completed' ? (
                        <Link href="/student/certificates" className="text-maroon font-medium text-sm hover:underline">
                          View certificate
                        </Link>
                      ) : (
                        <Link href={`/student/courses/${c.id}`} className="text-maroon font-medium text-sm hover:underline">
                          Open
                        </Link>
                      )}
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