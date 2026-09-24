import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const courses = [
  { id: 1, title: 'Griha Pravesh Puja Basics', teacher: 'Pandit R. Sharma', students: 64, price: '৳1,499', status: 'Active' },
  { id: 2, title: 'Durga Puja Rituals for Families', teacher: 'Pandit K. Joshi', students: 112, price: '৳1,999', status: 'Active' },
  { id: 3, title: 'Everyday Puja & Aarti', teacher: 'Pandit S. Chatterjee', students: 89, price: '৳999', status: 'Active' },
  { id: 4, title: 'Satyanarayan Puja Vidhi', teacher: 'Pandit R. Sharma', students: 47, price: '৳1,299', status: 'Draft' },
];

export default function CoursesPage() {
  return (
    <>
      <Topbar title="Courses" subtitle="Manage subscription-based courses, teachers, and schedules" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="All Courses"
          description="Create a course, assign a teacher, and set its schedule."
          actionLabel="Add Course"
          actionHref="/admin/courses/new"
        />
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="px-5 py-3 font-medium">Students</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium">{c.title}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.teacher}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.students}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.price}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.status === 'Active' ? 'success' : 'neutral'}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button type="button" className="text-maroon font-medium text-sm hover:underline">
                        Edit
                      </button>
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
