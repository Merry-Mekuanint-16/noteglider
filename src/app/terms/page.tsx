"use client";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import Link from "next/link";

export default function TermsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://filternote.com" },
      { "@type": "ListItem", position: 2, name: "Terms", item: "https://filternote.com/terms" },
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
              Agreement
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-500">
              The rules that govern your use of FilterNote.
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
                <h2 className="text-xl font-bold text-gray-900">Agreement to Terms</h2>
                <p className="text-gray-600">
                  By creating an account or using FilterNote, you enter into a binding agreement with us. If these terms don&apos;t work for you, please don&apos;t use the service.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">The Service</h2>
                <p className="text-gray-600">
                  FilterNote transforms AI-generated or robotic-sounding text into natural, human-like writing. We offer:
                </p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Real-time text humanization</li>
                  <li>Multiple writing tone options</li>
                  <li>Credit-based processing system</li>
                  <li>Usage history (for logged-in users)</li>
                  <li>API access on select plans</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Your Account</h2>
                <p className="text-gray-600">You&apos;re responsible for:</p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Keeping login credentials secure</li>
                  <li>All activity under your account</li>
                  <li>Providing accurate registration information</li>
                  <li>Notifying us of unauthorized access</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Prohibited Activities</h2>
                <p className="text-gray-600">Don&apos;t use FilterNote to:</p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Break any laws or regulations</li>
                  <li>Generate spam, malware, or harmful content</li>
                  <li>Violate intellectual property rights</li>
                  <li>Attack or probe our infrastructure</li>
                  <li>Resell access without authorization</li>
                  <li>Circumvent usage limits through automation</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Billing & Credits</h2>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li><strong className="text-gray-900">Credits:</strong> Each word processed consumes one credit</li>
                  <li><strong className="text-gray-900">Subscriptions:</strong> Billed monthly or annually, auto-renew unless cancelled</li>
                  <li><strong className="text-gray-900">Top-ups:</strong> Additional credits available for purchase</li>
                  <li><strong className="text-gray-900">Refunds:</strong> Contact support within 7 days if unsatisfied</li>
                  <li><strong className="text-gray-900">Cancellation:</strong> Cancel anytime; access continues until period ends</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Content Ownership</h2>
                <p className="text-gray-600">
                  You retain ownership of text you submit and receive. By using the service, you grant us a limited license to process your content solely for delivering the humanization service.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">API Terms</h2>
                <p className="text-gray-600">If you have API access:</p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>Keep API keys confidential</li>
                  <li>Don&apos;t share keys with third parties</li>
                  <li>Respect rate limits</li>
                  <li>Rotate keys if compromised</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">No Guarantees</h2>
                <p className="text-gray-600">
                  FilterNote is provided &quot;as is.&quot; We strive for quality but cannot guarantee:
                </p>
                <ul className="space-y-2 ml-4 list-disc list-outside text-gray-600">
                  <li>100% uptime or error-free operation</li>
                  <li>That output will pass every AI detector</li>
                  <li>Suitability for every specific use case</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Liability Limits</h2>
                <p className="text-gray-600">
                  Our liability is limited to the amount you&apos;ve paid us in the past 12 months. We&apos;re not liable for indirect damages, lost profits, or consequences of service interruptions.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Account Termination</h2>
                <p className="text-gray-600">
                  We may suspend or terminate accounts that violate these terms. You can delete your account anytime through settings or by contacting support.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Changes to Terms</h2>
                <p className="text-gray-600">
                  We may update these terms. Material changes will be announced via email or site notice. Continued use after changes means acceptance.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Questions</h2>
                <div className="rounded-lg bg-green-50 border border-green-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">Legal inquiries</p>
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
