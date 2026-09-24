'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, Radio, Flame, Award, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/student/courses', label: 'Browse Courses', icon: BookOpen },
  { href: '/student/my-courses', label: 'My Courses', icon: GraduationCap },
  { href: '/student/free-classes', label: 'Free Classes', icon: Radio },
  { href: '/student/specific-puja', label: 'Specific Puja', icon: Flame },
  { href: '/student/certificates', label: 'Certificates', icon: Award },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href, exact) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-50 bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] p-2.5 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[248px] shrink-0 z-50 flex flex-col
          bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)]
          transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <FlameMark />
            <span className="font-display text-lg font-semibold tracking-wide">Sanatan Path</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-[var(--sidebar-ink-soft)]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.94rem] font-medium transition-colors
                  ${active
                    ? 'bg-[var(--sidebar-active)] text-[#2B1B0E]'
                    : 'text-[var(--sidebar-ink-soft)] hover:bg-white/5 hover:text-[var(--sidebar-ink)]'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-5 border-t border-white/10 text-xs text-[var(--sidebar-ink-soft)]">
          Signed in as <span className="text-[var(--sidebar-ink)] font-medium">Ritika Sharma</span>
          <div className="mt-0.5 text-[var(--sidebar-ink-soft)]">Student</div>
        </div>
      </aside>
    </>
  );
}

function FlameMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3c1.6 3 2.4 5.4 1 7.6-.7 1.1-1 1.9-1 2.9 0 1.5 1.1 2.5 2.6 2.1 1.6-.5 2.4-2 2.4-3.9 2 2.2 3 4.8 3 7.3 0 4.7-3.6 8-8 8s-8-3.3-8-8c0-3.7 2.1-6.6 4.4-9.3C14.2 7.7 15.3 5.4 16 3z"
        fill="var(--sidebar-active)"
      />
    </svg>
  );
}