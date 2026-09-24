'use client';

import { useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import { Heart } from 'lucide-react';

const initialClasses = [
  { id: 1, title: 'Ganesh Puja Basics', teacher: 'Pandit R. Sharma', time: 'Today, 7:00 PM', joined: false, donated: false },
  { id: 2, title: 'Introduction to Mantras', teacher: 'Pandit S. Chatterjee', time: 'Sep 21, 6:00 PM', joined: false, donated: false },
];

export default function FreeClassesPage() {
  const [classes, setClasses] = useState(initialClasses);
  const [donationAmount, setDonationAmount] = useState({});

  const join = (id) => {
    // No backend wired up yet — this would call
    // POST /api/student/free-classes/:id/join
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, joined: true } : c)));
  };

  const donate = (id) => {
    const amount = donationAmount[id];
    if (!amount) return;
    // No backend wired up yet — this would call
    // POST /api/student/free-classes/:id/donate with { amount, method }
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, donated: true } : c)));
  };

  return (
    <>
      <Topbar title="Free Classes" subtitle="Open to any logged-in member — no purchase needed" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="Upcoming Free Classes"
          description="Join a session for free. A donation box appears once the class ends, entirely optional."
        />
        <div className="space-y-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display font-semibold">{c.title}</h3>
                  <p className="text-sm text-inkSoft mt-0.5">
                    {c.teacher} · {c.time}
                  </p>
                </div>
                {!c.joined ? (
                  <button
                    type="button"
                    onClick={() => join(c.id)}
                    className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold"
                  >
                    Join Class
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-success">Joined</span>
                )}
              </div>

              {c.joined && !c.donated && (
                <div className="mt-4 pt-4 border-t border-border bg-ivorySoft -mx-5 -mb-5 px-5 py-4 rounded-b-xl">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Heart size={16} className="text-maroon" />
                    Enjoyed the class? Consider a donation to support the platform.
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="number"
                      min="1"
                      placeholder="Amount (৳)"
                      onChange={(e) =>
                        setDonationAmount((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="input w-40"
                    />
                    <button
                      type="button"
                      onClick={() => donate(c.id)}
                      className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold"
                    >
                      Donate
                    </button>
                    <button
                      type="button"
                      onClick={() => setClasses((prev) => prev.map((x) => (x.id === c.id ? { ...x, donated: true } : x)))}
                      className="text-sm text-inkSoft font-medium"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {c.donated && (
                <p className="mt-4 pt-4 border-t border-border text-sm text-success font-medium">
                  Thank you! 🙏
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}