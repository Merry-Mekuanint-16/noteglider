import { type Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us - FilterNote",
  description: "Have a question or feedback? Contact the FilterNote support team. We're here to help you with our AI text humanizer.",
  keywords: ["ai humanizer", "AI detection bypass", "humanize AI text", "FilterNote contact", "support"],
  alternates: { canonical: "https://filternote.com/contact" },
};

export default async function ContactPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageNavbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section 
          className="py-16 px-4"
          style={{ 
            backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
              Contact
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-500">
              Tell us about your use case, partnership idea, or anything else on your mind.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Info Cards */}
              <div className="space-y-4">
                {/* Email Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-green-300 transition-colors">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-3">
                    Email
                  </span>
                  <p className="text-lg font-bold text-gray-900">Filternote.humanizer@gmail.com</p>
                  <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                </div>

                {/* Help Center Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-green-300 transition-colors">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-3">
                    Help Center
                  </span>
                  <p className="text-lg font-bold text-gray-900">Check our FAQ</p>
                  <p className="text-sm text-gray-500 mt-1">Find answers to common questions</p>
                  <Link href="/faq" className="inline-block mt-3 text-sm font-medium text-green-600 hover:text-green-700">
                    Go to FAQ →
                  </Link>
                </div>

                {/* Availability Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-green-300 transition-colors">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-3">
                    Availability
                  </span>
                  <p className="text-lg font-bold text-gray-900">24/7 Support</p>
                  <p className="text-sm text-gray-500 mt-1">We&apos;re always here to help</p>
                </div>
              </div>

              {/* Form */}
              <div className="rounded-xl border border-gray-200 bg-white p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
                <p className="text-sm text-gray-500 mb-6">Fill out the form and we&apos;ll get back to you.</p>
                <ContactForm initialEmail={userEmail} isEmailReadOnly />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
