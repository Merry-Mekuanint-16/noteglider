import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";

export type PolarProductSummary = {
  id: string;
  name: string;
  description?: string | null;
  uiDescription?: string; // Custom UI description for better presentation
  priceAmount?: number | null; // in cents
  priceCurrency?: string | null;
  priceType?: "one_time" | "recurring" | null;
  recurringInterval?: string | null; // month, year, etc.
  displayPrice?: string;
};

export type PolarPricingTier = {
  key: string;
  name: string;
  description?: string | null;
  uiDescription?: string;
  monthly?: PolarProductSummary | null;
  yearly?: PolarProductSummary | null;
};

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

// Custom UI descriptions for better presentation
const UI_DESCRIPTIONS: Record<string, string> = {
  "small": `

• 5,000 words / mo
• Up to 600 words per request
• Basic Humanization Engine
• Bypass all AI detectors (incl. Turnitin & GPTZero)
• Error free rewriting
• Default humanization preset
• All languages supported
• Customer support

**Credits reset:** Monthly for subscriptions`,

  "medium": `

• 20,000 words / mo
• Up to 2,000 words per request
• Faster processing
• Advanced Humanization Engine
• Bypass all AI detectors (incl. Turnitin & GPTZero)
• Error free rewriting
• All core humanization presets
• All languages supported
• Priority email support

**Credits reset:** Monthly for subscriptions`,

  "large": `
  
• 45,000 words / mo
• Up to 3,000 words per request
• Priority processing
• Advanced Humanization Engine
• Bypass all AI detectors (incl. Turnitin & GPTZero)
• Error free rewriting
• All core humanization presets
• All languages supported
• API access for integrations
• Team support
• Dedicated support & onboarding

**Credits reset:** Monthly for subscriptions`
};

export async function fetchPolarProductsFromEnv(): Promise<PolarPricingTier[]> {
  const tierConfigs = [
    {
      key: "small",
      monthlyId: env.POLAR_PRODUCT_SMALL,
      yearlyId: env.POLAR_PRODUCT_YEARLY_SMALL,
    },
    {
      key: "medium",
      monthlyId: env.POLAR_PRODUCT_MEDIUM,
      yearlyId: env.POLAR_PRODUCT_YEARLY_MEDIUM,
    },
    {
      key: "large",
      monthlyId: env.POLAR_PRODUCT_LARGE,
      yearlyId: env.POLAR_PRODUCT_YEARLY_LARGE,
    },
  ].filter((config) => config.monthlyId || config.yearlyId);

  if (tierConfigs.length === 0) return [];

  const results: PolarPricingTier[] = [];

  for (const tier of tierConfigs) {
    const [monthly, yearly] = await Promise.all([
      fetchPolarProduct(tier.monthlyId),
      fetchPolarProduct(tier.yearlyId),
    ]);

    const canonical = monthly ?? yearly;

    if (!canonical) {
      continue;
    }

    results.push({
      key: tier.key,
      name: canonical.name,
      description: canonical.description ?? null,
      uiDescription: UI_DESCRIPTIONS[tier.key] ?? canonical.description ?? null,
      monthly: monthly ?? null,
      yearly: yearly ?? null,
    });
  }

  return results;
}

export async function fetchPolarTopUpsFromEnv(): Promise<PolarProductSummary[]> {
  const topUpIds = [
    env.POLAR_CREDITS_5000,
    env.POLAR_CREDITS_20000,
    env.POLAR_CREDITS_45000,
  ].filter(Boolean) as string[];

  if (topUpIds.length === 0) return [];

  const results: PolarProductSummary[] = [];

  for (const id of topUpIds) {
    const product = await fetchPolarProduct(id);
    if (product) {
      results.push(product);
    }
  }

  return results;
}

export async function fetchPolarProduct(productId?: string | null): Promise<PolarProductSummary | null> {
  if (!productId) return null;

  try {
    const product = await polarClient.products.get({ id: productId });
    const price: any =
      product.prices?.find((p: any) => p.amountType === "fixed" && !p.isArchived) ??
      product.prices?.[0];

    const summary: PolarProductSummary = {
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      priceAmount: price?.priceAmount ?? null,
      priceCurrency: price?.priceCurrency ?? null,
      priceType: price?.type ?? null,
      recurringInterval: price?.recurringInterval ?? null,
    };

    summary.displayPrice = formatPolarPrice(summary);

    return summary;
  } catch (err) {
    console.error("Failed to fetch Polar product", productId, err);
    return null;
  }
}

export function formatPolarPrice(product: PolarProductSummary): string {
  if (!product.priceAmount || !product.priceCurrency) return "";
  const amount = (product.priceAmount / 100).toFixed(2);
  const isRecurring = product.priceType === "recurring";
  const interval = product.recurringInterval ? `/${product.recurringInterval}` : "";
  return `${currencySymbol(product.priceCurrency)}${amount}${isRecurring ? interval : ""}`;
}

function currencySymbol(code: string): string {
  try {
    return (0).toLocaleString(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/0+([.,]0+)?$/, "");
  } catch {
    // Fallback to $ if unknown
    return "$";
  }
}


