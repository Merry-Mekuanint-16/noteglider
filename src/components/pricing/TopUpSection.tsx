"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type TopUpProduct = {
  id: string;
  name: string;
  description?: string;
  displayPrice: string;
  priceAmount: number | null;
  priceCurrency: string | null;
};

export default function TopUpSection() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<TopUpProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUps = async () => {
      try {
        const res = await fetch("/api/polar/topups");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch top-ups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopUps();
  }, []);

  const handlePurchase = async (productId: string) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setPurchasingId(productId);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to start purchase. Please try again.");
      setPurchasingId(null);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-[#0f1f0f]">Need Extra Credits?</h3>
        <p className="mt-2 text-gray-500">Top up your account with a one-time credit pack.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 transition hover:border-[#22c55e] hover:shadow-lg"
          >
            <div className="flex-1">
              <h4 className="text-lg font-bold text-[#0f1f0f]">{product.name}</h4>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#22c55e]">{product.displayPrice}</span>
                <span className="text-sm text-gray-500">one-time</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">Credits never expire</p>
            </div>

            <Button
              onClick={() => handlePurchase(product.id)}
              disabled={!!purchasingId}
              className="mt-6 w-full rounded-xl bg-[#22c55e] py-3 font-bold text-white hover:bg-[#16a34a] transition"
            >
              {purchasingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Credits"}
            </Button>

            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                Instant delivery
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                Works with any plan
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                No expiration
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
