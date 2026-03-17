import { type Metadata } from "next";
import UnifiedHomePage from "./UnifiedHomePage";

export const metadata: Metadata = {
  title: "NoteGlider: AI-Powered Study Tool - Summaries, Flashcards, Quizzes & Audio",
  description: "Transform your notes into flashcards, quizzes, and summaries with AI. Focus with ambient sounds and track your progress.",
  keywords: [
    "AI study tool",
    "flashcards generator",
    "quiz maker",
    "note summarizer",
    "audio learning",
    "study smarter",
    "AI learning assistant",
    "student productivity",
    "exam preparation",
    "study notes"
  ],
  authors: [{ name: "NoteGlider" }],
  creator: "NoteGlider",
  publisher: "NoteGlider",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://noteglider.com",
  },
  openGraph: {
    title: "NoteGlider: AI-Powered Study Tool",
    description: "Transform your notes into flashcards, quizzes, and summaries with AI.",
    url: "https://noteglider.com",
    siteName: "NoteGlider",
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
    title: "NoteGlider: AI-Powered Study Tool",
    description: "Transform your notes into flashcards, quizzes, and summaries with AI.",
    images: ["/forOpengraph.png"],
    site: "@noteglider",
    creator: "@noteglider",
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
