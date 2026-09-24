import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Topbar from '@/components/admin/Topbar';
import Field from '@/components/admin/Field';

export default function NewPujaPackagePage() {
  return (
    <>
      <Topbar title="Add Puja Package" subtitle="Create a new private, one-on-one puja offering" />
      <main className="px-6 lg:px-10 py-8 max-w-2xl">
        <Link
          href="/admin/specific-puja"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to specific puja
        </Link>
        <form className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <Field label="Puja name">
            <input type="text" placeholder="e.g. Griha Shanti Puja" className="input" />
          </Field>
          <Field label="Description">
            <textarea rows={3} className="input" placeholder="What does this puja involve?" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Price (one-time, full package)">
              <input type="text" placeholder="৳ 2,999" className="input" />
            </Field>
            <Field label="Assign teacher / priest">
              <select className="input">
                <option>Pandit R. Sharma</option>
                <option>Pandit K. Joshi</option>
                <option>Pandit S. Chatterjee</option>
              </select>
            </Field>
          </div>
          <Field label="Information needed from participant">
            <textarea rows={2} className="input" placeholder="e.g. Full name, date of birth, nakshatra" />
          </Field>
          <p className="text-xs text-inkSoft">
            After payment, this puja is scheduled individually and conducted in a private LiveKit room for
            that one participant.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold">
              Save Package
            </button>
            <Link href="/admin/specific-puja" className="text-sm text-inkSoft font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
