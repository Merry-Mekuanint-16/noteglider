import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - FilterNote",
  description: "Sign in to your FilterNote account to access our AI humanizer.",
  keywords: ["ai humanizer", "sign in", "login", "FilterNote"],
  openGraph: {
    title: "Sign In - FilterNote",
    description: "Sign in to access FilterNote's AI text humanization tools.",
    url: "https://filternote.com/sign-in",
    siteName: "FilterNote",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - FilterNote",
    description: "Sign in to your account to start humanizing text.",
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://filternote.com" },
      { "@type": "ListItem", position: 2, name: "Sign In", item: "https://filternote.com/sign-in" },
    ],
  };

  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
