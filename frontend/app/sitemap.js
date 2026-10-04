const SITE_URL = "https://karmkandbharti.com";

// If your backend is at a different URL, call it to fetch dynamic content
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchCourses() {
  try {
    const res = await fetch(`${API_URL}/student/courses`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch {
    return [];
  }
}

async function fetchPujaPackages() {
  try {
    const res = await fetch(`${API_URL}/student/specific-puja/packages`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.packages || [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();

  /* ---------- Static pages ---------- */
  const staticPages = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/courses", priority: 0.9, freq: "daily" },
    { path: "/free-classes", priority: 0.9, freq: "daily" },
    { path: "/specific-puja", priority: 0.9, freq: "weekly" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.6, freq: "monthly" },
    { path: "/login", priority: 0.4, freq: "monthly" },
    { path: "/register", priority: 0.5, freq: "monthly" },
  ];

  const staticEntries = staticPages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  /* ---------- Dynamic: courses ---------- */
  const courses = await fetchCourses();
  const courseEntries = courses.map((c) => ({
    url: `${SITE_URL}/courses/${c._id}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  /* ---------- Dynamic: puja packages ---------- */
  const packages = await fetchPujaPackages();
  const pujaEntries = packages.map((p) => ({
    url: `${SITE_URL}/specific-puja/${p._id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...courseEntries, ...pujaEntries];
}