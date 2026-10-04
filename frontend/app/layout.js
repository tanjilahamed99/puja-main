import { Toaster } from "sonner";
import "./globals.css";

/* ------------------------------------------------------------------ */
/*  SITE CONSTANTS — change these once, used everywhere               */
/* ------------------------------------------------------------------ */
const SITE_URL = "https://karmkandbharti.com";       // your real domain
const SITE_NAME = "Karmkand Bharti";
const SITE_TAGLINE = "Learn Hindu Puja & Rituals Live";
const SITE_DESCRIPTION =
  "Learn authentic Hindu puja, rituals, and Vedic practices through live online classes — subscription courses, free weekly sessions, and one-on-one specific puja bookings.";
const OG_IMAGE = `${SITE_URL}/og/home.jpg`;           // 1200×630 px
const TWITTER_HANDLE = "@karmkandbharti";             // if you have one

/* ------------------------------------------------------------------ */
/*  METADATA                                                          */
/* ------------------------------------------------------------------ */
export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,

  keywords: [
    "Hindu puja online",
    "learn puja rituals",
    "Griha Pravesh Puja",
    "Satyanarayan Puja",
    "Durga Puja rituals",
    "Vedic classes online",
    "live puja classes",
    "online pandit",
    "Hindu rituals course",
    "puja vidhi",
    "Karmkand",
    "कर्मकांड",
    "पूजा विधि",
  ],

  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["hi_IN", "bn_BD"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Learn Hindu Puja & Rituals Live`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.webmanifest",

  verification: {
    google: "PASTE_YOUR_GOOGLE_SEARCH_CONSOLE_CODE_HERE",
    // yandex: "...",
    // bing: "...",
  },

  category: "education",
};

export const viewport = {
  themeColor: "#8C2F1B",           // your maroon
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ------------------------------------------------------------------ */
/*  ROOT LAYOUT                                                       */
/* ------------------------------------------------------------------ */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Eczar:wght@500;600;700&family=Mukta:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Organization structured data — Google uses this for the knowledge panel */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: SITE_NAME,
              alternateName: "कर्मकांड भारती",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description: SITE_DESCRIPTION,
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
              areaServed: ["IN", "BD", "Worldwide"],
              sameAs: [
                // Fill these with your real profiles
                // "https://www.youtube.com/@karmkandbharti",
                // "https://www.facebook.com/karmkandbharti",
                // "https://www.instagram.com/karmkandbharti",
              ],
            }),
          }}
        />

        {/* Website structured data — enables the Google sitelinks search box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>

      <body className="bg-ivory text-ink font-body">
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}