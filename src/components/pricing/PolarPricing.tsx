"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type BillingCycle = "monthly" | "yearly";

type ProductPriceOption = {
  id: string;
  displayPrice: string;
  priceAmount: number | null;
  priceCurrency: string | null;
  priceType: "one_time" | "recurring" | null;
  recurringInterval: string | null;
};

type Product = {
  key: string;
  name: string;
  description?: string | null;
  uiDescription?: string;
  monthly: ProductPriceOption | null;
  yearly: ProductPriceOption | null;
};

function parseFeatures(description?: string | null): string[] {
  if (!description) return ["Transform AI text instantly", "Download results with one click", "Flexible cancellation policy"];
  const lines = description.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const features: string[] = [];
  for (const line of lines) {
    if (line.includes('**Credits reset:**')) continue;
    if (line.startsWith('•') || line.startsWith('-')) {
      const cleaned = line.replace(/^[•\-]\s*/, '').trim();
      if (cleaned) features.push(cleaned);
    }
  }
  return features.length > 0 ? features : ["Transform AI text instantly", "Download results with one click", "Flexible cancellation policy"];
}

function formatCurrency(amount: number, currency?: string | null) {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: currency ?? "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

interface PolarPricingProps {
  isTeamMember?: boolean;
  subscriptionPlan?: string | null;
}

export default function PolarPricing({ isTeamMember = false, subscriptionPlan }: PolarPricingProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ctaLoadingId, setCtaLoadingId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const isLifetime = subscriptionPlan === 'lifetime';

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/polar/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (active) setProducts(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const onSubscribe = async (productId: string) => {
    try {
      setCtaLoadingId(productId);
      if (!isSignedIn) {
        router.push("/sign-in");
        setCtaLoadingId(null);
        return;
      }
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch {
      alert("Failed to create checkout. Please try again.");
      setCtaLoadingId(null);
    }
  };

  const hasYearlyPlans = useMemo(() => !!products?.some((plan) => plan.yearly), [products]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="inline-flex items-center gap-3 rounded-full border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin text-[#22c55e]" /> Loading plans…
        </div>
      </div>
    );
  }

  if (error || !products?.length) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error || "No products available."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hasYearlyPlans && (
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border-2 border-gray-200 bg-white p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                billingCycle === "monthly" ? "bg-[#22c55e] text-white" : "text-gray-600 hover:text-[#22c55e]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition flex items-center gap-2 ${
                billingCycle === "yearly" ? "bg-[#22c55e] text-white" : "text-gray-600 hover:text-[#22c55e]"
              }`}
            >
              Yearly
              {billingCycle === "yearly" && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">Save 50%</span>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
        {products.map((product, index) => {
          const features = parseFeatures(product.uiDescription ?? product.description);
          const isPopular = index === 1 && products.length > 1;
          const option = billingCycle === "yearly" ? (product.yearly ?? product.monthly) : (product.monthly ?? product.yearly);
          const productId = option?.id;
          
          let price = "";
          let period = "";
          if (option?.priceAmount) {
            const amount = option.priceAmount / 100;
            if (option.recurringInterval === "year") {
              price = formatCurrency(amount / 12, option.priceCurrency);
              period = "/mo (billed yearly)";
            } else {
              price = formatCurrency(amount, option.priceCurrency);
              period = "/month";
            }
          }

          return (
            <div
              key={product.key}
              className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 transition hover:shadow-xl ${
                isPopular ? "border-[#22c55e] shadow-lg ring-2 ring-[#22c55e]/20" : "border-gray-200"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#22c55e] px-4 py-1 text-xs font-bold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0f1f0f]">{product.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#0f1f0f]">{price || "Free"}</span>
                  <span className="text-sm text-gray-500">{period}</span>
                </div>
              </div>

              <Button
                className={`w-full rounded-xl py-3 font-bold transition ${
                  isPopular
                    ? "bg-[#22c55e] text-white hover:bg-[#16a34a]"
                    : "bg-gray-100 text-[#0f1f0f] hover:bg-gray-200 border-2 border-gray-200"
                }`}
                onClick={() => productId && onSubscribe(productId)}
                disabled={!productId || !!ctaLoadingId || isLifetime || isTeamMember}
              >
                {isLifetime ? "Lifetime Active" : isTeamMember ? "Managed by Team" : ctaLoadingId === productId ? "Processing…" : "Get Started"}
              </Button>

              <ul className="mt-6 space-y-3 flex-1">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="h-5 w-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-center text-xs text-gray-400">No hidden fees · Cancel anytime</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
