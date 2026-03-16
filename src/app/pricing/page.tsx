import { type Metadata } from "next";
import PricingPageClient from "~/components/PricingPageClient";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Pricing - FilterNote",
  description: "Choose your AI humanizer plan. Affordable pricing to bypass AI detectors and transform your content naturally with FilterNote.",
  keywords: ["ai humanizer pricing", "humanizer plans", "AI text humanizer cost", "humanize AI text pricing"],
  alternates: { canonical: "https://filternote.com/pricing" },
};

export default async function PricingPage() {
  const user = await currentUser();
  let isTeamMember = false;
  let hasSubscription = false;
  let subscriptionPlan: string | null = null;

  if (user) {
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: { team: { include: { owner: true } } }
    });

    if (!dbUser) {
      const email = user.emailAddresses[0]?.emailAddress || "";
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User";
      
      const newUser = await db.user.create({
        data: {
          clerkId: user.id,
          email,
          name,
          image: user.imageUrl,
          emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
        }
      });
      
      dbUser = await db.user.findUnique({
        where: { id: newUser.id },
        include: { team: { include: { owner: true } } }
      });
    }
    
    if (dbUser) {
      if (dbUser.team?.owner && dbUser.team.ownerId !== dbUser.id) {
        isTeamMember = true;
      }
      if (dbUser.subscriptionPlan) {
        hasSubscription = true;
        subscriptionPlan = dbUser.subscriptionPlan;
      }
    }
  }

  return <PricingPageClient isTeamMember={isTeamMember} hasSubscription={hasSubscription} subscriptionPlan={subscriptionPlan} />;
}
