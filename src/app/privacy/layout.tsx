import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - FilterNote",
  description: "Read the Privacy Policy for FilterNote. Learn how we handle and protect your data.",
  keywords: ["ai humanizer", "FilterNote privacy", "privacy policy", "data protection"],
  alternates: { canonical: "https://filternote.com/privacy" },
  openGraph: {
    title: "Privacy Policy - FilterNote",
    description: "Learn how FilterNote protects your privacy.",
    url: "https://filternote.com/privacy",
    siteName: "FilterNote",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - FilterNote",
    description: "Read the privacy policy for FilterNote.",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
