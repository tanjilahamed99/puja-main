import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const packages = [
  { id: 1, name: 'Griha Shanti Puja', teacher: 'Pandit R. Sharma', price: '৳2,999', status: 'Active' },
  { id: 2, name: 'Personal Satyanarayan Puja', teacher: 'Pandit K. Joshi', price: '৳3,499', status: 'Active' },
  { id: 3, name: 'Navgraha Shanti Puja', teacher: 'Pandit S. Chatterjee', price: '৳4,200', status: 'Draft' },
];

const bookings = [
  { id: 1, user: 'Ritika Sharma', package: 'Griha Shanti Puja', date: 'Sep 21, 10:00 AM', status: 'Confirmed' },
  { id: 2, user: 'Abir Hasan', package: 'Personal Satyanarayan Puja', date: 'Sep 23, 5:00 PM', status: 'Pending' },
];

export default function SpecificPujaPage() {
  return (
    <>
      <Topbar title="Specific Puja" subtitle="One-on-one paid puja sessions booked by individual users" />
      <main className="px-6 lg:px-10 py-8 space-y-10">
        <div>
          <PageHeader
            title="Puja Packages"
            description="Each package is a private session for a single paying participant."
            actionLabel="Add Package"
            actionHref="/admin/specific-puja/new"
          />
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Teacher / Priest</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{p.name}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{p.teacher}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{p.price}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Recent Bookings</h3>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Scheduled</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{b.user}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{b.package}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{b.date}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={b.status === 'Confirmed' ? 'success' : 'warning'}>{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
