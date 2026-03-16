import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible Use - FilterNote",
  description: "Learn how to use FilterNote responsibly and ethically. Understand our guidelines for academic integrity and ethical content creation.",
  keywords: [
    "ai humanizer",
    "responsible AI use",
    "academic integrity",
    "ethical writing",
    "FilterNote guidelines",
    "AI ethics",
    "content creation ethics",
    "academic honesty",
  ],
  alternates: {
    canonical: "https://filternote.com/responsible-use",
  },
  openGraph: {
    title: "Responsible Use - FilterNote | AI Humanizer",
    description: "Learn how to use FilterNote responsibly and ethically.",
    url: "https://filternote.com/responsible-use",
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
    title: "Responsible Use - FilterNote",
    description: "Learn how to use FilterNote responsibly and ethically.",
    images: ["/forOpengraph.png"],
  },
};

export default function ResponsibleUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
