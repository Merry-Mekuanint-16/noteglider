"use client";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import Link from "next/link";

export default function ResponsibleUsePage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://filternote.com" },
      { "@type": "ListItem", position: 2, name: "Responsible Use", item: "https://filternote.com/responsible-use" },
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
              Guidelines
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Responsible Use
            </h1>
            <p className="text-lg text-gray-500">
              FilterNote empowers better writing. Here&apos;s how to use it thoughtfully.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Core Message */}
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
              <span className="inline-block rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white mb-3">
                Our Philosophy
              </span>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Writing Enhancement, Not Replacement</h2>
              <p className="text-gray-700">
                FilterNote exists to help you communicate more effectively. It&apos;s a tool for polishing your ideas, not generating them. Your thoughts, research, and creativity should always be the foundation.
              </p>
            </div>

            {/* Intended Purpose */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">What FilterNote Is For</h2>
              <p className="text-gray-600 mb-4">
                Our platform helps transform robotic-sounding text into natural prose. It&apos;s ideal for:
              </p>
              <ul className="space-y-2">
                {[
                  "Refining drafts you&apos;ve already written",
                  "Making technical content more readable",
                  "Adjusting tone for different audiences",
                  "Smoothing out awkward phrasing",
                  "Creating more engaging marketing copy",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="text-green-500 mt-1">✓</span>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Academic Context */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">For Students & Academics</h2>
              <p className="text-gray-600 mb-4">
                Educational institutions have varying policies on AI tools. Before using FilterNote for academic work:
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <ul className="space-y-2">
                  {[
                    "Review your institution&apos;s AI usage guidelines",
                    "Consult with instructors when uncertain",
                    "Understand the difference between editing assistance and content generation",
                    "Always submit work that represents your own understanding",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="text-amber-600 mt-1">!</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best Practices */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Best Practices</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Start with your words", desc: "Write your initial draft before using FilterNote" },
                  { title: "Review the output", desc: "Always read and verify the humanized text" },
                  { title: "Keep your voice", desc: "Ensure the result still sounds like you" },
                  { title: "Be transparent", desc: "Disclose tool usage when required" },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Use */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Professional Applications</h2>
              <p className="text-gray-600">
                For business and professional contexts, FilterNote helps create polished communications that connect with readers. Whether you&apos;re crafting emails, reports, or content marketing, the goal is authentic engagement—not deception.
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Questions?</h3>
              <p className="text-gray-600">
                Reach out at{" "}
                <Link href="mailto:Filternote.humanizer@gmail.com" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
                  Filternote.humanizer@gmail.com
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
