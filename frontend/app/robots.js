const SITE_URL = "https://karmkandbharti.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/live/",
          "/admin/",
          "/teacher/",
          "/student/",
          "/certificates",
          "/checkout",
          "/payment",
        ],
      },
      // Block aggressive scrapers
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}