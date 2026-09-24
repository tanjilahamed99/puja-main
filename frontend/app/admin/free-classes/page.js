import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const freeClasses = [
  { id: 1, title: 'Ganesh Puja Basics', teacher: 'Pandit R. Sharma', time: 'Today, 7:00 PM', participants: 210, donations: '৳4,200', status: 'Scheduled' },
  { id: 2, title: 'Introduction to Mantras', teacher: 'Pandit S. Chatterjee', time: 'Sep 21, 6:00 PM', participants: 0, donations: '—', status: 'Scheduled' },
  { id: 3, title: 'Navratri Evening Aarti', teacher: 'Pandit K. Joshi', time: 'Sep 12, 7:30 PM', participants: 340, donations: '৳9,850', status: 'Completed' },
];

export default function FreeClassesPage() {
  return (
    <>
      <Topbar title="Free Classes" subtitle="Open sessions for all registered users, with an end-of-class donation box" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="All Free Classes"
          description="Free classes are open to any logged-in user — no purchase required."
          actionLabel="Add Free Class"
          actionHref="/admin/free-classes/new"
        />
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Participants</th>
                  <th className="px-5 py-3 font-medium">Donations</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {freeClasses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium">{c.title}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.teacher}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.time}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.participants}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{c.donations}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.status === 'Scheduled' ? 'warning' : 'success'}>{c.status}</Badge>
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
