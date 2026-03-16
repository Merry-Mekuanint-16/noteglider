import "~/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import CookieConsent from "~/components/CookieConsent";

export const metadata: Metadata = {
  title: "FilterNote: Free AI Humanizer to Bypass AI Detectors",
  metadataBase: new URL('https://filternote.com'),
  description: "FilterNote transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly with FilterNote.",
  keywords: [
    "ai humanizer",
    "humanize AI text",
    "humanizer",
    "AI text humanizer",
    "AI detection bypass",
    "AI content humanizer",
    "GPT detector bypass",
    "make AI text human",
    "undetectable AI content",
    "AI writing humanizer"
  ],
  authors: [{ name: "FilterNote" }],
  creator: "FilterNote",
  publisher: "FilterNote",
  alternates: {
    canonical: "https://filternote.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://filternote.com",
    siteName: "FilterNote",
    title: "FilterNote: Free AI Humanizer to Bypass AI Detectors",
    description: "Free AI humanizer transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly.",
    images: [
      {
        url: "/forOpenGraph.png",
        width: 1200,
        height: 630,
        alt: "FilterNote - AI Text Humanizer"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FilterNote: Free AI Humanizer to Bypass AI Detectors",
    description: "Free AI humanizer transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly.",
    images: ["/forOpenGraph.png"],
    site: "@filternote",
    creator: "@filternote",
  },
  verification: {
    google: "fhrf6bmdKSDHmXjyR_Hh5wXArwpgJVfHoT4c8hGEL0Q",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FilterNote",
    "url": "https://filternote.com",
    "description": "Transform AI-generated text into natural, human-like writing with our advanced AI humanizer.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://filternote.com/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://x.com/filternote",
      "https://www.linkedin.com/company/filternote"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FilterNote",
    "url": "https://filternote.com",
    "logo": "https://filternote.com/logo.png",
    "description": "Free AI humanizer for transforming AI-generated content into natural, human-like writing.",
    "email": "Filternote.humanizer@gmail.com",
    "sameAs": [
      "https://x.com/filternote",
      "https://www.linkedin.com/company/filternote"
    ]
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Google Tag (gtag.js) */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-KFJFFR02VR"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-KFJFFR02VR');
              `,
            }}
          />
          <title>FilterNote: Free AI Humanizer to Bypass AI Detectors</title>
          <link rel="canonical" href="https://filternote.com" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/logo.png" type="image/png" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body suppressHydrationWarning className="overflow-x-hidden">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          {children}
          <CookieConsent />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
