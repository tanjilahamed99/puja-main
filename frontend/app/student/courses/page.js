import Link from 'next/link';
import Topbar from '@/components/admin/Topbar';

const courses = [
  {
    id: 'griha-pravesh',
    title: 'Griha Pravesh Puja Basics',
    teacher: 'Pandit R. Sharma',
    category: 'Griha Puja',
    price: '৳1,499',
    schedule: 'Mon, Wed · 6:00 PM',
    enrolled: true,
  },
  {
    id: 'durga-puja',
    title: 'Durga Puja Rituals for Families',
    teacher: 'Pandit K. Joshi',
    category: 'Festival Puja',
    price: '৳1,999',
    schedule: 'Tue, Thu · 7:00 PM',
    enrolled: false,
  },
  {
    id: 'everyday-puja',
    title: 'Everyday Puja & Aarti',
    teacher: 'Pandit S. Chatterjee',
    category: 'Everyday Rituals',
    price: '৳999',
    schedule: 'Sat · 9:00 AM',
    enrolled: true,
  },
];

export default function BrowseCoursesPage() {
  return (
    <>
      <Topbar title="Browse Courses" subtitle="Full guided courses with a real syllabus, teacher, and schedule" />
      <main className="px-6 lg:px-10 py-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/student/courses/${c.id}`}
              className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-maroon transition-colors"
            >
              <span className="inline-flex self-start text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
                {c.category}
              </span>
              <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
              <p className="text-sm text-inkSoft">{c.teacher}</p>
              <p className="text-sm text-inkSoft">{c.schedule}</p>
              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <span className="font-display text-lg font-semibold">{c.price}</span>
                {c.enrolled ? (
                  <span className="text-xs font-semibold text-success">Enrolled</span>
                ) : (
                  <span className="text-xs font-semibold text-maroon">Enroll →</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}