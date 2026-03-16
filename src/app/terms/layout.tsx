import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - FilterNote",
  description: "Read the Terms of Service for FilterNote. Understand our terms and guidelines for using our AI humanizer service.",
  keywords: ["ai humanizer", "FilterNote terms", "terms of service", "user agreement"],
  alternates: { canonical: "https://filternote.com/terms" },
  openGraph: {
    title: "Terms of Service - FilterNote",
    description: "Read the terms of service for FilterNote AI humanizer.",
    url: "https://filternote.com/terms",
    siteName: "FilterNote",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - FilterNote",
    description: "Read the terms of service for FilterNote.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
