import { type Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import ApiKeysClient from "~/components/ApiKeysClient";

export const metadata: Metadata = {
  title: "API Keys - FilterNote | Free AI Humanizer API",
  description: "Manage your API keys for FilterNote integration. ULTRA plan users get API access to integrate AI humanizer into their systems.",
  keywords: ["ai humanizer api", "humanizer api key", "API integration", "developer api", "AI text humanizer API"],
  robots: { index: false, follow: true },
};

export default async function ApiKeysPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/api-keys");

  let userInfo = null;
  let apiKeys: { id: string; name: string; key: string; createdAt: Date; lastUsed: Date | null; }[] = [];
  
  try { 
    userInfo = await db.user.findUnique({ 
      where: { clerkId: user.id }, 
      select: { subscriptionPlan: true, credits: true, id: true } 
    }); 
    
    if (userInfo?.id) {
      const dbApiKeys = await db.apiKey.findMany({
        where: { userId: userInfo.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, key: true, createdAt: true, lastUsed: true }
      });
      apiKeys = dbApiKeys;
    }
  } catch (error) { 
    console.error("Error fetching user info:", error); 
  }

  const hasApiAccess = userInfo?.subscriptionPlan?.toLowerCase().includes("large") || userInfo?.subscriptionPlan?.toLowerCase().includes("ultra");

  return (
    <div className="min-h-screen bg-white">
      <PageNavbar currentCredits={userInfo?.credits} />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ApiKeysClient initialApiKeys={apiKeys} hasApiAccess={hasApiAccess ?? false} />
      </main>
      <SiteFooter />
    </div>
  );
}
