'use client';

import { useState } from 'react';
import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/admin/Badge';

const allUsers = [
  { id: 1, name: 'Ritika Sharma', email: 'ritika@example.com', role: 'Student', joined: 'Aug 2, 2026' },
  { id: 2, name: 'Pandit R. Sharma', email: 'r.sharma@example.com', role: 'Teacher', joined: 'Jan 10, 2026' },
  { id: 3, name: 'Abir Hasan', email: 'abir@example.com', role: 'Student', joined: 'Sep 4, 2026' },
  { id: 4, name: 'Pandit K. Joshi', email: 'k.joshi@example.com', role: 'Teacher', joined: 'Feb 22, 2026' },
  { id: 5, name: 'Tanjil Admin', email: 'admin@sanatanpath.com', role: 'Admin', joined: 'Jan 1, 2026' },
  { id: 6, name: 'Priya Nair', email: 'priya@example.com', role: 'Student', joined: 'Sep 12, 2026' },
];

const TABS = ['All', 'Student', 'Teacher', 'Admin'];

export default function UsersPage() {
  const [tab, setTab] = useState('All');
  const filtered = tab === 'All' ? allUsers : allUsers.filter((u) => u.role === tab);

  return (
    <>
      <Topbar title="Users" subtitle="Students, teachers, and admins on the platform" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader title="All Users" description="Manage roles and view account details." />

        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-maroon text-ivory'
                  : 'bg-surface border border-border text-inkSoft'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium">{u.name}</td>
                    <td className="px-5 py-3.5 text-inkSoft">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.role === 'Admin' ? 'danger' : u.role === 'Teacher' ? 'warning' : 'neutral'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-inkSoft">{u.joined}</td>
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
