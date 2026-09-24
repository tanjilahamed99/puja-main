'use client';

import { Search, Bell } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur border-b border-border px-6 lg:px-10 py-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="pl-10 lg:pl-0">
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-inkSoft mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 w-56">
            <Search size={16} className="text-inkSoft" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-inkSoft"
            />
          </div>
          <button type="button" className="relative bg-surface border border-border rounded-lg p-2.5">
            <Bell size={17} className="text-inkSoft" />
          </button>
          <div className="w-9 h-9 rounded-full bg-maroon text-ivory flex items-center justify-center font-semibold text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
