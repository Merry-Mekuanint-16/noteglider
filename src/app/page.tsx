import { type Metadata } from "next";
import UnifiedHomePage from "./UnifiedHomePage";

export const metadata: Metadata = {
  title: "FilterNote: Free AI Humanizer to Bypass AI Detectors",
  description: "FilterNote transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly with FilterNote.",
  keywords: [
    "AI text humanizer",
    "humanize AI text",
    "AI detection bypass",
    "text paraphrasing",
    "natural writing",
    "AI content",
    "human-like text",
    "content creation",
    "writing tool",
    "AI writing assistant"
  ],
  authors: [{ name: "FilterNote" }],
  creator: "FilterNote",
  publisher: "FilterNote",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://filternote.com",
  },
  openGraph: {
    title: "FilterNote: Free AI Humanizer to Bypass AI Detectors",
    description: "FilterNote transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly.",
    url: "https://filternote.com",
    siteName: "FilterNote",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "FilterNote OpenGraph Image"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FilterNote: Free AI Humanizer to Bypass AI Detectors",
    description: "Free AI humanizer transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly.",
    images: ["/forOpengraph.png"],
    site: "@filternote",
    creator: "@filternote",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FilterNote",
            "description": "AI Text Humanizer - Transform AI-generated text into natural, human-like writing that passes detection tests.",
            "url": "https://filternote.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "5.99",
              "priceCurrency": "USD",
              "priceValidUntil": "2026-12-31",
              "description": "Small pack with 3 credits"
            },
            "creator": {
              "@type": "Organization",
              "name": "FilterNote"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1000",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "AI Text Humanization",
              "Smart Paraphrasing",
              "AI Detection Bypass",
              "Multiple Presets",
              "Fast Processing",
              "History Tracking"
            ]
          })
        }}
      />
      <UnifiedHomePage />
    </>
  );
}
