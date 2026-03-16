"use client";

import { useRouter } from "next/navigation";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import PolarPricing from "~/components/pricing/PolarPricing";
import TopUpSection from "~/components/pricing/TopUpSection";
import { Button } from "~/components/ui/button";

interface PricingPageClientProps { 
  isTeamMember?: boolean; 
  hasSubscription?: boolean; 
  subscriptionPlan?: string | null; 
}

export default function PricingPageClient({ isTeamMember = false, hasSubscription = false, subscriptionPlan }: PricingPageClientProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageNavbar isTeamMember={isTeamMember} />
      
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
              Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0f1f0f] mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-500">
              Pick a plan. Start humanizing. No hidden fees.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-5xl">
            <PolarPricing isTeamMember={isTeamMember} subscriptionPlan={subscriptionPlan} />
            
            {hasSubscription && (
              <div className="mt-16">
                <TopUpSection />
              </div>
            )}
          </div>
        </section>

        {/* Help CTA */}
        <section 
          className="py-16 px-4"
          style={{ 
            backgroundImage: `linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black text-[#0f1f0f] mb-4">Need Help Choosing?</h2>
            <p className="text-gray-500 mb-8">
              Not sure which plan is right for you? Contact our support team for personalized recommendations.
            </p>
            <Button 
              onClick={() => router.push("/contact")}
              className="rounded-full border-2 border-[#22c55e] bg-transparent px-8 py-3 font-bold text-[#22c55e] hover:bg-[#22c55e] hover:text-white transition-all"
            >
              Contact Support
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
