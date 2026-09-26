'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#courses', label: 'Courses' },
  { href: '#free-classes', label: 'Free Classes' },
  { href: '#specific-puja', label: 'Specific Puja' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 sm:h-[72px]">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <FlameMark />
          <span className="font-display text-lg sm:text-xl font-semibold tracking-wide text-ink">
            Sanatan Path
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm text-inkSoft">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-maroon transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-inkSoft hover:text-maroon transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-maroon text-ivory text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="lg:hidden text-ink p-1.5"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-ivory px-5 py-5 space-y-4">
          <nav className="flex flex-col gap-3 text-sm text-inkSoft">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-1.5 hover:text-maroon transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2.5 pt-2 border-t border-border">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink text-center py-2.5 border border-border rounded-lg"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="bg-maroon text-ivory text-sm font-semibold text-center py-2.5 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function FlameMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3c1.6 3 2.4 5.4 1 7.6-.7 1.1-1 1.9-1 2.9 0 1.5 1.1 2.5 2.6 2.1 1.6-.5 2.4-2 2.4-3.9 2 2.2 3 4.8 3 7.3 0 4.7-3.6 8-8 8s-8-3.3-8-8c0-3.7 2.1-6.6 4.4-9.3C14.2 7.7 15.3 5.4 16 3z"
        fill="var(--color-maroon)"
      />
    </svg>
  );
}