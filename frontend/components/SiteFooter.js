import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <FlameMark />
            <span className="font-display text-lg font-semibold text-ink">Sanatan Path</span>
          </div>
          <p className="text-sm text-inkSoft mt-3 leading-relaxed max-w-xs">
            Learn puja and Hindu rituals through live, guided classes — structured courses, open
            community sessions, and personal puja bookings.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-4">Learn</h4>
          <ul className="space-y-2.5 text-sm text-inkSoft">
            <li><a href="#courses" className="hover:text-maroon transition-colors">Subscription Courses</a></li>
            <li><a href="#free-classes" className="hover:text-maroon transition-colors">Free Classes</a></li>
            <li><a href="#specific-puja" className="hover:text-maroon transition-colors">Specific Puja</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-4">Account</h4>
          <ul className="space-y-2.5 text-sm text-inkSoft">
            <li><Link href="/login" className="hover:text-maroon transition-colors">Log in</Link></li>
            <li><Link href="/register" className="hover:text-maroon transition-colors">Create an account</Link></li>
            <li><Link href="/forgot-password" className="hover:text-maroon transition-colors">Forgot password</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm text-inkSoft">
            <li><a href="#" className="hover:text-maroon transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-maroon transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-maroon transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-inkSoft">
          <p>&copy; {new Date().getFullYear()} Sanatan Path. All rights reserved.</p>
          <p>Made with care, for anyone learning to practice puja.</p>
        </div>
      </div>
    </footer>
  );
}

function FlameMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3c1.6 3 2.4 5.4 1 7.6-.7 1.1-1 1.9-1 2.9 0 1.5 1.1 2.5 2.6 2.1 1.6-.5 2.4-2 2.4-3.9 2 2.2 3 4.8 3 7.3 0 4.7-3.6 8-8 8s-8-3.3-8-8c0-3.7 2.1-6.6 4.4-9.3C14.2 7.7 15.3 5.4 16 3z"
        fill="var(--color-maroon)"
      />
    </svg>
  );
}