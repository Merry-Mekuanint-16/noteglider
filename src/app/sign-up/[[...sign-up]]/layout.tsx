import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - FilterNote",
  description: "Create your free FilterNote account to access our AI humanizer.",
  keywords: ["ai humanizer", "sign up", "create account", "FilterNote"],
  openGraph: {
    title: "Sign Up - FilterNote",
    description: "Join FilterNote to transform AI-generated text into natural writing.",
    url: "https://filternote.com/sign-up",
    siteName: "FilterNote",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - FilterNote",
    description: "Create your account to access AI text humanization.",
  },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://filternote.com" },
      { "@type": "ListItem", position: 2, name: "Sign Up", item: "https://filternote.com/sign-up" },
    ],
  };

  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
