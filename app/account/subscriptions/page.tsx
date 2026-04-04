export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dumbbell, ArrowLeft, Zap } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import SubscriptionActions from "@/components/account/SubscriptionActions";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-400 border border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  CANCELLED: "bg-[#2C2C2E] text-[#8E8E93]",
};

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
};

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const active = subscriptions.find((s) => s.status === "ACTIVE");

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#FF5500]" />
            <span className="font-(family-name:--font-bebas-neue) text-xl tracking-wider">BeFitBeStrong</span>
          </Link>
          <Link
            href="/account"
            className="text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Account
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mb-8">
          My Subscriptions
        </h1>

        {subscriptions.length === 0 ? (
          /* Empty state */
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-[#FF5500]/40" />
            </div>
            <h2 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide mb-2">
              No Active Subscriptions
            </h2>
            <p className="text-[#8E8E93] text-sm mb-6">
              Join Iron Club to unlock exclusive discounts, double loyalty points, and more.
            </p>
            <Link
              href="/iron-club"
              className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
            >
              <Zap className="w-4 h-4" />
              Join Iron Club
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active subscription featured */}
            {active && (
              <div className="bg-[#1C1C1E] border border-[#FF5500]/20 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF5500]/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#FF5500]" />
                    </div>
                    <div>
                      <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
                        {active.planName}
                      </h2>
                      <p className="text-[#8E8E93] text-sm">
                        {CYCLE_LABELS[active.billingCycle]} Plan
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      STATUS_COLORS[active.status] ?? ""
                    }`}
                  >
                    {active.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-0.5">
                      Price
                    </p>
                    <p className="text-[#F2F2F7] font-semibold">
                      {formatPrice(Number(active.price), { compact: true })} / {CYCLE_LABELS[active.billingCycle].toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-0.5">
                      Next Billing
                    </p>
                    <p className="text-[#F2F2F7] font-semibold">
                      {formatDate(active.nextBillingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-0.5">
                      Member Since
                    </p>
                    <p className="text-[#F2F2F7] font-semibold">
                      {formatDate(active.createdAt)}
                    </p>
                  </div>
                </div>

                <SubscriptionActions
                  subscriptionId={active.id}
                  status={active.status}
                />
              </div>
            )}

            {/* Past subscriptions */}
            {subscriptions.filter((s) => s.status !== "ACTIVE").length > 0 && (
              <div>
                <h3 className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-3">
                  Past Subscriptions
                </h3>
                <div className="space-y-3">
                  {subscriptions
                    .filter((s) => s.status !== "ACTIVE")
                    .map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[#F2F2F7] font-medium text-sm">{sub.planName}</p>
                          <p className="text-[#8E8E93] text-xs">
                            {CYCLE_LABELS[sub.billingCycle]} ·{" "}
                            {formatPrice(Number(sub.price), { compact: true })} ·{" "}
                            {formatDate(sub.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            STATUS_COLORS[sub.status] ?? ""
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {!active && (
              <div className="text-center pt-4">
                <Link
                  href="/iron-club/subscribe"
                  className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Re-join Iron Club
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
