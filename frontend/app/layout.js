import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Sanatan Path — Admin",
  description: "Admin panel for the Sanatan Path puja learning platform",
};

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
      </head>
      <body className="bg-ivory text-ink font-body">
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}
