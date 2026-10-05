import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";

/* ------------------------------------------------------------------ */
/*  SITE CONSTANTS — language-independent                             */
/*  (name, tagline and description now live in messages/*.json → meta) */
/* ------------------------------------------------------------------ */
const SITE_URL = "https://karmkandbharti.com";
const OG_IMAGE = `${SITE_URL}/og/home.jpg`; // 1200×630 px
const TWITTER_HANDLE = "@karmkandbharti";

const OG_LOCALES = { hi: "hi_IN", en: "en_US" };

/* ------------------------------------------------------------------ */
/*  METADATA — now a function so title/description follow the language */
/* ------------------------------------------------------------------ */
export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations("meta");

  const siteName = t("siteName");
  const fullTitle = `${siteName} — ${t("tagline")}`;
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: fullTitle,
      template: `%s | ${siteName}`,
    },
    description,

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

    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,

    alternates: { canonical: "/" },

    openGraph: {
      type: "website",
      locale: OG_LOCALES[locale] ?? "hi_IN",
      alternateLocale: Object.values(OG_LOCALES).filter((l) => l !== OG_LOCALES[locale]),
      url: SITE_URL,
      siteName,
      title: fullTitle,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: fullTitle }],
    },

    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: fullTitle,
      description,
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
    },

    category: "education",
  };
}

export const viewport = {
  themeColor: "#8C2F1B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ------------------------------------------------------------------ */
/*  ROOT LAYOUT                                                       */
/* ------------------------------------------------------------------ */
export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const t = await getTranslations("meta");

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Eczar + Mukta both include Devanagari; Google serves it automatically when the page uses Hindi text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Eczar:wght@500;600;700&family=Mukta:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: t("siteName"),
              alternateName: locale === "hi" ? "Karmkand Bharti" : "कर्मकांड भारती",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description: t("description"),
              inLanguage: locale,
              address: { "@type": "PostalAddress", addressCountry: "IN" },
              areaServed: ["IN", "BD", "Worldwide"],
              sameAs: [],
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: t("siteName"),
              url: SITE_URL,
              inLanguage: locale,
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
        <NextIntlClientProvider>
          <Toaster position="top-right" richColors />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
