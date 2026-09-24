import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Topbar from '@/components/admin/Topbar';
import Field from '@/components/admin/Field';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function NewCoursePage() {
  return (
    <>
      <Topbar title="Add Course" subtitle="Create a new subscription course" />
      <main className="px-6 lg:px-10 py-8 max-w-3xl">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-inkSoft mb-6 hover:text-maroon"
        >
          <ChevronLeft size={16} /> Back to courses
        </Link>

        <form className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <Field label="Course title">
            <input type="text" placeholder="e.g. Griha Pravesh Puja Basics" className="input" />
          </Field>

          <Field label="Description">
            <textarea rows={4} placeholder="What will students learn in this course?" className="input" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Category">
              <select className="input">
                <option>Griha Puja</option>
                <option>Festival Puja</option>
                <option>Everyday Rituals</option>
                <option>Vedic Basics</option>
              </select>
            </Field>
            <Field label="Price (one-time, full package)">
              <input type="text" placeholder="৳ 1,499" className="input" />
            </Field>
          </div>

          <Field label="Assign teacher">
            <select className="input">
              <option>Pandit R. Sharma</option>
              <option>Pandit K. Joshi</option>
              <option>Pandit S. Chatterjee</option>
            </select>
          </Field>

          <Field label="Class days">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-1.5 bg-ivorySoft px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                >
                  <input type="checkbox" className="accent-maroon" /> {d}
                </label>
              ))}
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Class time">
              <input type="time" className="input" />
            </Field>
            <Field label="Timezone">
              <select className="input">
                <option>Asia/Dhaka (GMT+6)</option>
                <option>Asia/Kolkata (GMT+5:30)</option>
              </select>
            </Field>
          </div>

          <p className="text-xs text-inkSoft">
            A LiveKit room will be generated automatically for each scheduled session once the course is saved.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="bg-maroon text-ivory px-5 py-2.5 rounded-lg text-sm font-semibold">
              Save Course
            </button>
            <Link href="/admin/courses" className="text-sm text-inkSoft font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
