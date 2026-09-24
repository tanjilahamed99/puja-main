import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Sanatan Path</h1>
      <p className="text-inkSoft max-w-sm">
        The public site is coming next. For now, jump straight into the admin panel.
      </p>
      <Link
        href="/admin"
        className="bg-maroon text-ivory px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
      >
        Go to Admin Panel
      </Link>
    </main>
  );
}
