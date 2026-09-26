import Link from 'next/link';
import { CheckCircle2, Users, BookOpen, Globe2, Heart, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const stats = [
  { value: '40+', label: 'Guided courses' },
  { value: '1,200+', label: 'Students taught' },
  { value: '120', label: 'Weekly free sessions' },
  { value: '3', label: 'Languages supported' },
];

const steps = [
  {
    title: 'Choose your path',
    description: 'Enroll in a full course, drop into a free class, or book a specific puja just for you.',
  },
  {
    title: 'Meet your teacher live',
    description: 'Every session runs as a real-time video class — ask questions and follow along as you go.',
  },
  {
    title: 'Track your progress',
    description: 'Finish a course and get a certificate. Keep returning to free classes any week you like.',
  },
];

const featuredCourses = [
  {
    title: 'Griha Pravesh Puja Basics',
    teacher: 'Pandit R. Sharma',
    category: 'Griha Puja',
    price: '৳1,499',
    schedule: 'Mon, Wed · 6:00 PM',
  },
  {
    title: 'Durga Puja Rituals for Families',
    teacher: 'Pandit K. Joshi',
    category: 'Festival Puja',
    price: '৳1,999',
    schedule: 'Tue, Thu · 7:00 PM',
  },
  {
    title: 'Everyday Puja & Aarti',
    teacher: 'Pandit S. Chatterjee',
    category: 'Everyday Rituals',
    price: '৳999',
    schedule: 'Sat · 9:00 AM',
  },
];

const teachers = [
  { name: 'Pandit R. Sharma', focus: 'Griha Puja & Vedic Basics', initials: 'RS' },
  { name: 'Pandit K. Joshi', focus: 'Festival Puja & Family Rituals', initials: 'KJ' },
  { name: 'Pandit S. Chatterjee', focus: 'Everyday Puja & Mantras', initials: 'SC' },
];

const testimonials = [
  {
    quote:
      'I grew up watching my grandmother perform Griha Pravesh but never learned the steps myself. This course finally gave me the confidence to do it for my own home.',
    name: 'Ritika Sharma',
    role: 'Student, Griha Pravesh Puja Basics',
  },
  {
    quote:
      'The free classes are a wonderful way to try things out before committing. I joined on a whim and ended up learning mantras I still use every morning.',
    name: 'Abir Hasan',
    role: 'Free Class participant',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-maroonDeep mb-5">
                <Sparkles size={16} />
                Live virtual sessions, guided by real teachers
              </div>
              <h1 className="font-display font-semibold text-ink leading-[1.08] text-4xl sm:text-5xl lg:text-[3.4rem] max-w-xl">
                Learn puja the way it was meant to be taught
              </h1>
              <p className="text-inkSoft text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
                Structured courses, open community classes, and one-on-one personal puja — all
                conducted live online, in Hindi, Bangla, or English.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  href="/register"
                  className="bg-maroon text-ivory text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:opacity-90 transition"
                >
                  Browse Courses
                </Link>
                <a
                  href="#free-classes"
                  className="border border-border text-ink text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:border-maroon transition-colors"
                >
                  Join a Free Class
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-border">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl sm:text-3xl font-semibold text-maroon">{s.value}</p>
                    <p className="text-xs sm:text-sm text-inkSoft mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-[0_18px_40px_-20px_rgba(140,47,27,0.25)] relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-2xl"
                  style={{ background: 'radial-gradient(circle, rgba(244,200,106,0.5), transparent 65%)' }}
                />
                <svg viewBox="0 0 240 220" className="relative w-full h-auto">
                  <ellipse cx="120" cy="170" rx="78" ry="18" fill="var(--color-gold)" opacity="0.22" />
                  <path
                    d="M60 150c0-28 22-40 60-40s60 12 60 40c0 16-14 28-60 28s-60-12-60-28z"
                    fill="var(--color-maroon)"
                  />
                  <path
                    d="M70 148c0-20 18-30 50-30s50 10 50 30"
                    stroke="var(--color-gold-soft)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    d="M120 108c-14-18-16-32-4-46 3 12 9 18 16 22 4-8 2-16-2-24 14 10 22 24 22 38 0 16-14 28-32 28-10 0-18-6-18-14 0-4 2-8 6-14z"
                    fill="var(--color-gold)"
                  />
                  <path
                    d="M120 100c-7-10-8-18-2-26 1 7 5 10 9 12 2-4 1-9-1-13 8 6 12 13 12 21 0 8-7 14-16 14-5 0-9-3-9-7 0-2 1-4 3-7z"
                    fill="#F8E39A"
                  />
                </svg>
                <p className="text-center text-sm text-inkSoft mt-2 relative">
                  Today at 7:00 PM — Ganesh Puja basics (Free)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-xl mb-12">
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">How it works</h2>
              <p className="text-inkSoft mt-3">
                Three simple steps, whether you&apos;re joining a free session or enrolling in a full course.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
              {steps.map((step, i) => (
                <div key={step.title} className="border-t-2 border-maroon pt-5">
                  <span className="font-display text-xl font-semibold text-goldDeep">
                    0{i + 1}
                  </span>
                  <h3 className="font-display font-semibold text-lg mt-2">{step.title}</h3>
                  <p className="text-inkSoft text-sm mt-2 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two ways to learn */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-12">
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Two ways to learn</h2>
            <p className="text-inkSoft mt-3">
              Structured guidance for the dedicated student, and an open door for anyone curious.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div id="courses" className="bg-surface border border-border rounded-2xl p-7 sm:p-8 flex flex-col gap-4">
              <span className="inline-flex self-start text-xs font-bold text-maroon bg-[#F7E5E5] px-3 py-1 rounded-full">
                Subscription Courses
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-semibold">
                Full guided courses with a real syllabus
              </h3>
              <p className="text-inkSoft text-sm leading-relaxed">
                Enroll once, get a fixed teacher and schedule, and learn a puja tradition end to end.
              </p>
              <ul className="space-y-2.5 mt-2">
                {[
                  'Assigned teacher & fixed weekly schedule',
                  'One-time payment — full course, no subscriptions',
                  'Certificate on completion',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="text-maroon shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm text-inkSoft">Starting from ৳999 per course</span>
                <Link href="/register" className="text-sm font-semibold text-maroon hover:underline">
                  Browse courses →
                </Link>
              </div>
            </div>

            <div
              id="free-classes"
              className="bg-[linear-gradient(165deg,var(--color-maroon)_0%,var(--color-maroon-deep)_100%)] text-[#F8E9CE] rounded-2xl p-7 sm:p-8 flex flex-col gap-4"
            >
              <span className="inline-flex self-start text-xs font-bold px-3 py-1 rounded-full bg-white/15">
                Free Classes &amp; Specific Puja
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-semibold">
                Open sessions for everyone, and a private puja for you
              </h3>
              <p className="text-[#EAD3B0] text-sm leading-relaxed">
                Join any weekly free class at no cost, and support the platform with a donation if you wish.
              </p>
              <ul className="space-y-2.5 mt-2">
                {[
                  'Open to any logged-in member — no purchase needed',
                  'Optional donation at the end of class',
                  'Book a private, one-on-one specific puja anytime',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div id="specific-puja" className="mt-auto pt-5 border-t border-white/20 flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm text-[#EAD3B0]">Free to join · specific puja booked separately</span>
                <Link href="/register" className="text-sm font-semibold text-ivory hover:underline">
                  Join a class →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured courses */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
              <div className="max-w-xl">
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Popular courses</h2>
                <p className="text-inkSoft mt-3">A few of the courses students come back for.</p>
              </div>
              <Link href="/register" className="text-sm font-semibold text-maroon hover:underline whitespace-nowrap">
                View all courses →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((c) => (
                <div key={c.title} className="bg-ivory border border-border rounded-xl p-5 flex flex-col gap-3">
                  <span className="inline-flex self-start text-xs font-semibold text-maroon bg-[#F7E5E5] px-2.5 py-1 rounded-full">
                    {c.category}
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
                  <p className="text-sm text-inkSoft">{c.teacher}</p>
                  <p className="text-sm text-inkSoft">{c.schedule}</p>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{c.price}</span>
                    <Link href="/register" className="text-xs font-semibold text-maroon hover:underline">
                      Enroll →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Teachers */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-12">
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Learn from real teachers</h2>
            <p className="text-inkSoft mt-3">Every session is taught live — no pre-recorded videos.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div key={t.name} className="flex flex-col items-center text-center gap-3 p-6 bg-surface border border-border rounded-xl">
                <div className="w-14 h-14 rounded-full bg-maroon text-ivory flex items-center justify-center font-display font-semibold text-lg">
                  {t.initials}
                </div>
                <h3 className="font-display font-semibold">{t.name}</h3>
                <p className="text-sm text-inkSoft">{t.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-xl mb-12">
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-ink">What students say</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <blockquote key={t.name} className="bg-ivory border border-border rounded-xl p-6 sm:p-7">
                  <p className="text-ink text-[0.95rem] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-5 text-sm">
                    <span className="font-semibold text-ink">{t.name}</span>
                    <span className="text-inkSoft"> · {t.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <div className="grid sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <BookOpen size={22} className="text-maroon shrink-0" />
              <div>
                <h4 className="font-display font-semibold">Structured curriculum</h4>
                <p className="text-sm text-inkSoft mt-1">Every course follows a clear syllabus, not ad-hoc sessions.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <Users size={22} className="text-maroon shrink-0" />
              <div>
                <h4 className="font-display font-semibold">Real, live teachers</h4>
                <p className="text-sm text-inkSoft mt-1">Ask questions in the moment — nothing pre-recorded.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <Globe2 size={22} className="text-maroon shrink-0" />
              <div>
                <h4 className="font-display font-semibold">Learn in your language</h4>
                <p className="text-sm text-inkSoft mt-1">Hindi, Bangla, or English — switch anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <div className="bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] rounded-2xl px-6 sm:px-12 py-12 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sidebar-active)] mb-3 justify-center lg:justify-start">
                <Heart size={16} />
                Free to join
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-md">
                Ready to start? Your first class is free.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/register"
                className="bg-[var(--sidebar-active)] text-[#2B1B0E] text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:opacity-90 transition"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="border border-white/25 text-[var(--sidebar-ink)] text-sm font-semibold px-6 py-3.5 rounded-lg text-center hover:bg-white/5 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}