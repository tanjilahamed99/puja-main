# Sanatan Path — Admin Panel

Next.js (JavaScript, App Router — no TypeScript) admin panel for the Sanatan Path puja learning platform.

## Getting started

```
npm install
npm run dev
```

Open http://localhost:3000 — it links straight into `/admin`.

## Where things live

- `app/admin/*` — every admin page: Dashboard, Courses, Free Classes, Specific Puja, Users, Payments & Donations
- `components/admin/*` — shared admin UI: Sidebar, Topbar, StatCard, Badge, PageHeader, Field
- `app/globals.css` — **every theme color lives here as a CSS variable** (`--color-maroon`, `--color-gold`, etc). Change a value once and it updates everywhere — sidebar, buttons, badges, borders, tables.

## Pages included

- **Dashboard** — stats overview, recent enrollments, upcoming sessions
- **Courses** — list + "Add Course" form (title, price, teacher, schedule/days/time)
- **Free Classes** — list + "Add Free Class" form
- **Specific Puja** — packages list, recent bookings, + "Add Package" form
- **Users** — student/teacher/admin list with role filter tabs
- **Payments & Donations** — combined transactions table (subscriptions, donations, specific puja)

All pages are responsive: the sidebar collapses into a slide-out menu below the `lg` breakpoint, and tables scroll horizontally on small screens instead of breaking layout.

## What's mocked (on purpose)

Every table uses hard-coded sample data, and forms don't submit anywhere yet — there's no backend or database wired up. This is a UI-first pass. Next steps would be:

1. Wire these pages to your Express + MongoDB API
2. Add authentication (JWT + role middleware)
3. Build the public-facing site (landing page, course catalog, student dashboard, teacher dashboard)
4. Add the language switcher (English / Hindi / Bangla) — intentionally left for later, as discussed
