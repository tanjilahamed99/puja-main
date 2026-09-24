import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Topbar from '@/components/admin/Topbar';
import Field from '@/components/admin/Field';

export default function NewFreeClassPage() {
  return (
    <>
      <Topbar title="Add Free Class" subtitle="Schedule a new open session" />
      <main className="px-6 lg:px-10 py-8 max-w-2xl">
        <Link
          href="/admin/free-classes"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to free classes
        </Link>
        <form className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <Field label="Class title">
            <input type="text" placeholder="e.g. Ganesh Puja Basics" className="input" />
          </Field>
          <Field label="Description">
            <textarea rows={3} className="input" placeholder="What will this session cover?" />
          </Field>
          <Field label="Assign teacher">
            <select className="input">
              <option>Pandit R. Sharma</option>
              <option>Pandit K. Joshi</option>
              <option>Pandit S. Chatterjee</option>
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Date">
              <input type="date" className="input" />
            </Field>
            <Field label="Time">
              <input type="time" className="input" />
            </Field>
          </div>
          <p className="text-xs text-inkSoft">
            Only logged-in registered users will be able to join — guests are not permitted. A donation
            prompt is shown automatically at the end of the session.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold">
              Save Free Class
            </button>
            <Link href="/admin/free-classes" className="text-sm text-inkSoft font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
