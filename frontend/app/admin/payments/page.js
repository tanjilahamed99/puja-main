import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';
import StatCard from '@/components/admin/StatCard';
import { Wallet, Gift, Flame } from 'lucide-react';

const transactions = [
  { id: 1, user: 'Ritika Sharma', type: 'Subscription', item: 'Griha Pravesh Puja Basics', amount: '৳1,499', method: 'PhonePe', date: 'Sep 17, 2026', status: 'Success' },
  { id: 2, user: 'Anonymous', type: 'Donation', item: 'Ganesh Puja Basics (Free Class)', amount: '৳500', method: 'PayPal', date: 'Sep 17, 2026', status: 'Success' },
  { id: 3, user: 'Abir Hasan', type: 'Specific Puja', item: 'Personal Satyanarayan Puja', amount: '৳3,499', method: 'PhonePe', date: 'Sep 16, 2026', status: 'Pending' },
  { id: 4, user: 'Priya Nair', type: 'Subscription', item: 'Everyday Puja & Aarti', amount: '৳999', method: 'PayPal', date: 'Sep 15, 2026', status: 'Success' },
];

export default function PaymentsPage() {
  return (
    <>
      <Topbar title="Payments & Donations" subtitle="All transactions across courses, free-class donations, and specific puja" />
      <main className="px-6 lg:px-10 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Course Revenue (month)" value="৳ 2,84,000" icon={Wallet} />
          <StatCard label="Donations (month)" value="৳ 28,450" icon={Gift} />
          <StatCard label="Specific Puja Revenue" value="৳ 29,550" icon={Flame} />
        </div>

        <div>
          <PageHeader
            title="Recent Transactions"
            description="Includes subscriptions, free-class donations, and specific puja bookings."
          />
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Method</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{t.user}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{t.type}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{t.item}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{t.amount}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{t.method}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{t.date}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={t.status === 'Success' ? 'success' : 'warning'}>{t.status}</Badge>
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
