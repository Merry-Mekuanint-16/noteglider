import { type Metadata } from "next";
import Link from "next/link";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";

export const metadata: Metadata = {
  title: "FAQ - FilterNote",
  description: "Get answers about our AI humanizer. Learn how to bypass AI detectors and humanize your content naturally with FilterNote.",
  keywords: ["ai humanizer", "humanizer", "AI humanizer FAQ", "bypass AI detectors", "AI detection bypass", "humanize AI text"],
  alternates: { canonical: "https://filternote.com/faq" },
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        { question: "What is FilterNote?", answer: "FilterNote is an AI-powered text humanizer that transforms AI-generated content into natural, undetectable writing. Our advanced AI humanizer helps you bypass AI detectors while preserving the original meaning." },
        { question: "How does the AI humanizer work?", answer: "Our AI humanizer uses advanced natural language processing to analyze and rewrite your text. It adds human-like variations and adjusts sentence structures to make content indistinguishable from human writing." },
        { question: "Is FilterNote free to use?", answer: "FilterNote offers a free trial with limited credits. After that, you can purchase affordable credit packages to continue humanizing your content." },
      ],
    },
    {
      category: "Credits & Pricing",
      questions: [
        { question: "What are credits and how do they work?", answer: "Credits are used to humanize your text. One credit equals one word of text processed. You can view your remaining credits in your account." },
        { question: "Can I get a refund?", answer: "If you're not satisfied with the results, contact our support team within 7 days of purchase and we'll work with you to find a solution." },
      ],
    },
    {
      category: "AI Detection & Quality",
      questions: [
        { question: "Can FilterNote bypass AI detectors?", answer: "Yes! FilterNote is designed to bypass AI detection tools like Turnitin, GPTZero, Originality.ai, and others with a very high success rate." },
        { question: "Will the humanized text maintain the original meaning?", answer: "Absolutely! Our AI humanizer preserves the core message and intent while making it sound more natural and human-like." },
      ],
    },
    {
      category: "Technical & Support",
      questions: [
        { question: "What file formats are supported?", answer: "You can paste text directly or upload .txt, .docx, or .pdf files." },
        { question: "Is there a word limit?", answer: "The word limit depends on your credit balance. Each humanization request processes text based on your available credits." },
        { question: "How do I contact support?", answer: "You can reach our support team through our contact page or by emailing support@filternote.com." },
      ],
    },
  ];

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
            <span className="inline-block rounded-full bg-[#22c55e]/10 px-4 py-2 text-sm font-bold text-[#22c55e] mb-4">
              FAQ
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0f1f0f] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-500">
              Everything you need to know about FilterNote
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-3xl space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-[#0f1f0f] mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div 
                      key={faqIndex} 
                      className="rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-[#22c55e] transition-colors"
                    >
                      <h3 className="text-lg font-bold text-[#0f1f0f] mb-2">{faq.question}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section 
          className="py-16 px-4"
          style={{ 
            backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black text-[#0f1f0f] mb-4">Still have questions?</h2>
            <p className="text-gray-500 mb-8">Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <button className="rounded-full bg-[#22c55e] px-8 py-3 font-bold text-white hover:bg-[#16a34a] transition-all">
                  Contact Support
                </button>
              </Link>
              <Link href="/pricing">
                <button className="rounded-full border-2 border-[#22c55e] px-8 py-3 font-bold text-[#22c55e] hover:bg-[#22c55e] hover:text-white transition-all">
                  View Pricing
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
