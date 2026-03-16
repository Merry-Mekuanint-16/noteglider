"use client";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import Link from "next/link";

export default function PrivacyPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://filternote.com" },
      { "@type": "ListItem", position: 2, name: "Privacy", item: "https://filternote.com/privacy" },
    ],
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageNavbar />

      <main className="flex-1">
        <section
          className="py-16 px-4"
          style={{
            backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
              Your Data
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-500">
              How we handle and protect your information.
            </p>
            <div className="mt-4 inline-block text-sm text-gray-400 bg-gray-100 rounded-full px-4 py-2">
              Effective: January 2026
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8 space-y-8">
              
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Data We Gather</h2>
                <p className="text-gray-600">When you interact with FilterNote, we may collect:</p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li><strong className="text-gray-900">Account details:</strong> Email, name, and authentication credentials via our identity provider</li>
                  <li><strong className="text-gray-900">Payment records:</strong> Transaction history processed through secure third-party gateways</li>
                  <li><strong className="text-gray-900">Service metrics:</strong> Feature usage patterns and performance analytics</li>
                  <li><strong className="text-gray-900">Device info:</strong> Browser type, operating system, and general location</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">How We Apply This Data</h2>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Delivering and maintaining our humanization service</li>
                  <li>Processing payments and managing subscriptions</li>
                  <li>Sending service updates and support communications</li>
                  <li>Analyzing usage to improve features</li>
                  <li>Preventing fraud and ensuring platform security</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Text Processing</h2>
                <p className="text-gray-600">
                  Content submitted for humanization is processed in real-time. We do not permanently store your input text or output results on our servers. Processing occurs through encrypted connections, and text data is discarded after your session.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">External Services</h2>
                <p className="text-gray-600">We partner with trusted providers for:</p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Authentication (Clerk)</li>
                  <li>Payment processing (Polar/Stripe)</li>
                  <li>Analytics (privacy-focused tools)</li>
                  <li>AI processing infrastructure</li>
                </ul>
                <p className="text-gray-600 mt-2">Each partner maintains their own privacy standards and data handling practices.</p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Browser Storage</h2>
                <p className="text-gray-600">
                  We use cookies for session management and preferences. You can control cookie settings through your browser. Blocking cookies may limit certain features.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
                <p className="text-gray-600">You can:</p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Request a copy of your stored data</li>
                  <li>Ask us to correct inaccurate information</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Security Measures</h2>
                <p className="text-gray-600">
                  We implement industry-standard encryption, secure infrastructure, and regular security audits. However, no online service can guarantee absolute security.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Policy Updates</h2>
                <p className="text-gray-600">
                  We may revise this policy periodically. Significant changes will be communicated via email or site notification.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Get in Touch</h2>
                <div className="rounded-lg bg-green-50 border border-green-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">Privacy inquiries</p>
                  <Link href="mailto:Filternote.humanizer@gmail.com" className="font-semibold text-green-600 hover:text-green-700 text-lg">
                    Filternote.humanizer@gmail.com
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
