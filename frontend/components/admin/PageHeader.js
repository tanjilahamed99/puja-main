import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, description, actionLabel, actionHref }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="text-sm text-inkSoft mt-1 max-w-xl">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-maroon text-ivory px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition shrink-0"
        >
          <Plus size={16} /> {actionLabel}
        </Link>
      )}
    </div>
  );
}
