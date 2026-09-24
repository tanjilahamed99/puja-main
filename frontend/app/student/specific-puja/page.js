'use client';

import { useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const packages = [
  {
    id: 1,
    name: 'Griha Shanti Puja',
    teacher: 'Pandit R. Sharma',
    price: '৳2,999',
    description: 'A private puja performed for peace and protection in your household.',
    requiredInfoFields: ['Full name', 'Date of birth', 'Nakshatra (if known)'],
  },
  {
    id: 2,
    name: 'Personal Satyanarayan Puja',
    teacher: 'Pandit K. Joshi',
    price: '৳3,499',
    description: 'A one-on-one Satyanarayan Puja conducted for you and your family.',
    requiredInfoFields: ['Full name', 'Family members present'],
  },
];

const initialBookings = [
  { id: 101, packageName: 'Griha Shanti Puja', status: 'Confirmed', date: 'Sep 22, 10:00 AM' },
];

export default function SpecificPujaPage() {
  const [openForm, setOpenForm] = useState(null);
  const [bookings, setBookings] = useState(initialBookings);

  const handleBook = (e, pkg) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const info = {};
    pkg.requiredInfoFields.forEach((field) => {
      info[field] = formData.get(field);
    });

    // No backend wired up yet — this would call
    // POST /api/student/specific-puja/packages/:id/book with { method, participantInfo }
    setBookings((prev) => [
      ...prev,
      { id: Date.now(), packageName: pkg.name, status: 'Pending', date: 'To be scheduled' },
    ]);
    setOpenForm(null);
  };

  return (
    <>
      <Topbar title="Specific Puja" subtitle="A private, one-on-one puja booked just for you" />
      <main className="px-6 lg:px-10 py-8 space-y-10">
        <div>
          <PageHeader
            title="Available Puja Packages"
            description="After payment, this is scheduled individually and conducted in a private session for you."
          />
          <div className="grid sm:grid-cols-2 gap-5">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
                <h3 className="font-display text-lg font-semibold">{pkg.name}</h3>
                <p className="text-sm text-inkSoft">{pkg.teacher}</p>
                <p className="text-sm text-inkSoft">{pkg.description}</p>
                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">{pkg.price}</span>
                  <button
                    type="button"
                    onClick={() => setOpenForm(openForm === pkg.id ? null : pkg.id)}
                    className="bg-maroon text-ivory px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    {openForm === pkg.id ? 'Cancel' : 'Book This Puja'}
                  </button>
                </div>

                {openForm === pkg.id && (
                  <form onSubmit={(e) => handleBook(e, pkg)} className="pt-3 border-t border-border space-y-3">
                    {pkg.requiredInfoFields.map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-inkSoft mb-1">{field}</label>
                        <input name={field} type="text" required className="input" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-inkSoft mb-1">Payment method</label>
                      <select name="method" className="input">
                        <option value="phonepe">PhonePe</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-maroon text-ivory px-4 py-2.5 rounded-lg text-sm font-semibold"
                    >
                      Confirm &amp; Pay {pkg.price}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-4">My Bookings</h3>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Scheduled</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{b.packageName}</td>
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