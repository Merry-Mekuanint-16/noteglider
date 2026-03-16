import { type Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "~/server/db";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CreditCard, Mail, User, Calendar, Key, Users } from "lucide-react";
import SubscriptionManagement from "~/components/SubscriptionManagement";

export const metadata: Metadata = {
  title: "Account - FilterNote",
  description: "Manage your FilterNote account and credits.",
  robots: { index: false, follow: true },
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/account");

  let userCredits = 0, userExtraCredits = 0, subscriptionPlan: string | null = null, subscriptionType: string | null = null, nextResetDate: Date | null = null, productId: string | null = null, hasApiAccess = false, isTeamMember = false;
  
  try {
    let dbUser = await db.user.findUnique({ where: { clerkId: user.id }, include: { team: { include: { owner: true } } } });
    if (!dbUser) {
      const email = user.emailAddresses[0]?.emailAddress || "";
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User";
      const newUser = await db.user.create({ data: { clerkId: user.id, email, name, image: user.imageUrl, emailVerified: user.emailAddresses[0]?.verification?.status === 'verified' } });
      dbUser = await db.user.findUnique({ where: { id: newUser.id }, include: { team: { include: { owner: true } } } });
    }
    const effectiveUser = dbUser?.team?.owner || dbUser;
    isTeamMember = !!dbUser?.team?.owner;
    userCredits = effectiveUser?.credits ?? 0;
    userExtraCredits = effectiveUser?.extraCredits ?? 0;
    subscriptionPlan = effectiveUser?.subscriptionPlan ?? null;
    subscriptionType = effectiveUser?.subscriptionType ?? null;
    nextResetDate = effectiveUser?.nextResetDate ?? null;
    productId = effectiveUser?.productId ?? null;
    hasApiAccess = subscriptionPlan?.toLowerCase().includes("large") || subscriptionPlan?.toLowerCase().includes("ultra") || false;
  } catch (error) { console.error("Error:", error); }

  const userEmail = user.primaryEmailAddress?.emailAddress ?? "No email";
  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username ?? "User";
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown";

  return (
    <div className="min-h-screen bg-white">
      <PageNavbar currentCredits={userCredits + userExtraCredits} isTeamMember={isTeamMember} />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-8"><h1 className="text-3xl font-black text-gray-900">Account Settings</h1><p className="mt-2 text-gray-500">Manage your FilterNote account</p></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SubscriptionManagement subscriptionPlan={subscriptionPlan} subscriptionType={subscriptionType} nextResetDate={nextResetDate} productId={productId} isTeamMember={isTeamMember} />

          <Card className="border-gray-200 bg-white">
            <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900"><User className="h-5 w-5 text-green-500" />Profile</CardTitle><CardDescription className="text-gray-500">Your details</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium text-gray-400">Full Name</label><p className="mt-1 font-semibold text-gray-900">{userName}</p></div>
              <div className="border-t border-gray-100 pt-4"><label className="flex items-center gap-2 text-sm font-medium text-gray-400"><Mail className="h-4 w-4" />Email</label><p className="mt-1 font-semibold text-gray-900">{userEmail}</p></div>
              <div className="border-t border-gray-100 pt-4"><label className="flex items-center gap-2 text-sm font-medium text-gray-400"><Calendar className="h-4 w-4" />Member Since</label><p className="mt-1 font-semibold text-gray-900">{createdAt}</p></div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900"><CreditCard className="h-5 w-5 text-green-500" />Credits</CardTitle><CardDescription className="text-gray-500">Your balance</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Available Credits</label>
                <p className="mt-2 text-4xl font-black text-green-500">{(userCredits + userExtraCredits).toLocaleString()}</p>
                <div className="mt-2 flex gap-4 text-sm text-gray-500"><div><span className="font-medium text-gray-900">Plan:</span> {userCredits.toLocaleString()}</div>{userExtraCredits > 0 && <div><span className="font-medium text-gray-900">Top-up:</span> {userExtraCredits.toLocaleString()}</div>}</div>
              </div>
              <div className="border-t border-gray-100 pt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Need more credits?</p>
                <p className="mt-1 text-sm text-gray-500">Visit pricing to get more credits.</p>
                <a href="/pricing" className="mt-3 inline-block rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600">View Pricing</a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-gray-200 bg-white">
            <CardHeader><CardTitle className="text-gray-900">Quick Links</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Link href="/" className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:border-green-300 hover:bg-green-50 transition"><p className="font-semibold text-gray-900">Humanizer</p><p className="mt-1 text-xs text-gray-500">Transform text</p></Link>
                <Link href="/pricing" className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:border-green-300 hover:bg-green-50 transition"><p className="font-semibold text-gray-900">Pricing</p><p className="mt-1 text-xs text-gray-500">View plans</p></Link>
                {(isTeamMember || hasApiAccess) && <Link href="/team" className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:border-green-300 hover:bg-green-50 transition"><Users className="h-5 w-5 text-green-500 mx-auto mb-1" /><p className="font-semibold text-gray-900">Team</p></Link>}
                {hasApiAccess && <Link href="/api-keys" className="rounded-lg border border-green-200 bg-green-50 p-4 text-center hover:border-green-300 transition"><Key className="h-5 w-5 text-green-500 mx-auto mb-1" /><p className="font-semibold text-gray-900">API Keys</p></Link>}
                <Link href="/faq" className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:border-green-300 hover:bg-green-50 transition"><p className="font-semibold text-gray-900">FAQ</p><p className="mt-1 text-xs text-gray-500">Help</p></Link>
                <Link href="/contact" className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:border-green-300 hover:bg-green-50 transition"><p className="font-semibold text-gray-900">Contact</p><p className="mt-1 text-xs text-gray-500">Support</p></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
