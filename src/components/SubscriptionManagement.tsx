"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Package, Calendar, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SubscriptionDetails { subscriptionPlan?: string | null; subscriptionType?: string | null; nextResetDate?: string | null; productId?: string | null; billingCycle?: string; status?: string | null; cancelAtPeriodEnd?: boolean; currentPeriodEnd?: string | null; isTeamMember?: boolean; }
interface SubscriptionManagementProps { subscriptionPlan?: string | null; subscriptionType?: string | null; nextResetDate?: Date | null; productId?: string | null; isTeamMember?: boolean; }

export default function SubscriptionManagement({ subscriptionPlan: initialPlan, subscriptionType: initialType, nextResetDate: initialResetDate, productId: initialProductId, isTeamMember: initialIsTeamMember = false }: SubscriptionManagementProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<SubscriptionDetails>({ subscriptionPlan: initialPlan, subscriptionType: initialType, nextResetDate: initialResetDate?.toISOString() || null, productId: initialProductId, billingCycle: "N/A", isTeamMember: initialIsTeamMember });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch("/api/subscription/details");
        if (response.ok) { const data = await response.json(); setDetails(prev => ({ ...prev, ...data })); }
      } catch (error) { console.error("Failed:", error); } finally { setIsLoading(false); }
    };
    fetchDetails();
  }, []);

  const hasActiveSubscription = !!details.subscriptionPlan;
  const planName = details.subscriptionPlan ? formatPlanName(details.subscriptionPlan) : "Free";
  const billingCycle = details.billingCycle || "N/A";
  const nextResetDate = details.nextResetDate ? new Date(details.nextResetDate) : null;

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel subscription? You'll retain access until the end of your billing period.")) return;
    setIsCanceling(true);
    try {
      const response = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      toast.success(data.message || "Canceled");
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed"); } finally { setIsCanceling(false); }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Leave team? You will lose access to shared credits.")) return;
    setIsCanceling(true);
    try {
      const response = await fetch("/api/team/leave", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      toast.success("Left team");
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed"); } finally { setIsCanceling(false); }
  };

  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900"><Package className="h-5 w-5 text-green-500" />Subscription</CardTitle>
        <CardDescription className="text-gray-500">Manage your plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-green-500" /></div>
        ) : hasActiveSubscription ? (
          <>
            <div><label className="text-sm font-medium text-gray-400">Current Plan</label><p className="mt-1 text-2xl font-bold text-green-500">{planName}</p>{details.cancelAtPeriodEnd && <p className="mt-1 text-sm text-amber-500">Cancels at period end</p>}</div>
            <div className="border-t border-gray-100 pt-4"><label className="flex items-center gap-2 text-sm font-medium text-gray-400"><CreditCard className="h-4 w-4" />Billing</label><p className="mt-1 font-semibold text-gray-900">{billingCycle}</p></div>
            {nextResetDate && (<div className="border-t border-gray-100 pt-4"><label className="flex items-center gap-2 text-sm font-medium text-gray-400"><Calendar className="h-4 w-4" />Next Renewal</label><p className="mt-1 font-semibold text-gray-900">{new Date(nextResetDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>)}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <Link href="/pricing"><Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50" disabled={details.isTeamMember}>{details.isTeamMember ? "Managed by Team Owner" : "Change Plan"}</Button></Link>
              {details.isTeamMember ? (
                <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50" onClick={handleLeaveTeam} disabled={isCanceling}>Leave Team</Button>
              ) : (
                <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50" onClick={handleCancelSubscription} disabled={isCanceling || details.cancelAtPeriodEnd}>{details.cancelAtPeriodEnd ? "Cancellation Scheduled" : "Cancel Subscription"}</Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div><label className="text-sm font-medium text-gray-400">Current Plan</label><p className="mt-1 text-2xl font-bold text-gray-400">Free</p><p className="mt-1 text-sm text-gray-500">Upgrade to unlock more credits</p></div>
            <div className="border-t border-gray-100 pt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">Ready to upgrade?</p>
              <p className="mt-1 text-sm text-gray-500">Get more credits and premium features.</p>
              <Link href="/pricing"><Button className="mt-3 w-full bg-green-500 text-white hover:bg-green-600">View Plans<ExternalLink className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatPlanName(plan: string): string {
  if (plan.toLowerCase().includes("small")) return "Starter";
  if (plan.toLowerCase().includes("medium")) return "Professional";
  if (plan.toLowerCase().includes("large") || plan.toLowerCase().includes("ultra")) return "ULTRA";
  return plan;
}
