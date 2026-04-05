export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, TrendingUp, Gift, CheckCircle2, ShoppingBag } from "lucide-react";

type LoyaltyTier = "IRON" | "STEEL" | "TITANIUM";

const TX_EARN = new Set(["EARN", "BONUS", "REFERRAL"]);

const ALL_TIERS: { tier: LoyaltyTier; label: string; pointsNeeded: number | null; color: string; bg: string; border: string; benefits: string[] }[] = [
  {
    tier: "IRON",
    label: "Iron",
    pointsNeeded: null,
    color: "text-[#8E8E93]",
    bg: "bg-[#8E8E93]/10",
    border: "border-[#8E8E93]/20",
    benefits: ["1 pt per ₹1 spent", "Birthday bonus", "Early access sales"],
  },
  {
    tier: "STEEL",
    label: "Steel",
    pointsNeeded: 5000,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    benefits: ["1.5× points", "Free shipping ≥₹999", "Priority support"],
  },
  {
    tier: "TITANIUM",
    label: "Titanium",
    pointsNeeded: 15000,
    color: "text-[#FF5500]",
    bg: "bg-[#FF5500]/10",
    border: "border-[#FF5500]/20",
    benefits: ["2× points on all orders", "Always free shipping", "Exclusive products", "Personal shopper"],
  },
];

const TIER_COLOR: Record<LoyaltyTier, string> = {
  IRON: "text-[#8E8E93]",
  STEEL: "text-blue-400",
  TITANIUM: "text-[#FF5500]",
};

export default async function LoyaltyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { loyaltyPoints: true, loyaltyTier: true },
  });

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (!user) redirect("/login");

  const nextTierPts = user.loyaltyTier === "IRON" ? 5000 : user.loyaltyTier === "STEEL" ? 15000 : null;
  const progress = nextTierPts ? Math.min(Math.round((user.loyaltyPoints / nextTierPts) * 100), 100) : 100;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">
        Iron Points
      </h1>

      {/* ── Balance card ─────────────────────── */}
      <div className="bg-linear-to-br from-[#FF5500]/20 to-[#1C1C1E] border border-[#FF5500]/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">
              Your Balance
            </p>
            <p className="font-(family-name:--font-bebas-neue) text-6xl text-[#FF5500] tracking-wide leading-none">
              {user.loyaltyPoints.toLocaleString("en-IN")}
            </p>
            <p className="text-[#8E8E93] text-sm mt-1">Iron Points</p>
          </div>
          <div className="text-right">
            <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">Tier</p>
            <p className={`font-(family-name:--font-bebas-neue) text-3xl tracking-wide ${TIER_COLOR[user.loyaltyTier as LoyaltyTier]}`}>
              {user.loyaltyTier}
            </p>
            <Star className={`w-5 h-5 ml-auto mt-1 ${TIER_COLOR[user.loyaltyTier as LoyaltyTier]}`} />
          </div>
        </div>

        {nextTierPts ? (
          <div>
            <div className="flex justify-between text-xs text-[#8E8E93] mb-2">
              <span>{user.loyaltyPoints.toLocaleString("en-IN")} pts</span>
              <span>{nextTierPts.toLocaleString("en-IN")} pts to next tier</span>
            </div>
            <div className="h-2 bg-[#2C2C2E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5500] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[#8E8E93] text-xs mt-2">
              {(nextTierPts - user.loyaltyPoints).toLocaleString("en-IN")} more points needed
            </p>
          </div>
        ) : (
          <p className="text-[#FF5500] text-xs font-bold uppercase tracking-widest">
            ★ Maximum tier reached
          </p>
        )}
      </div>

      {/* ── Tier comparison ───────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-[#FF5500]" />
          <h2 className="text-[#F2F2F7] font-semibold">Tier Benefits</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALL_TIERS.map(({ tier, label, pointsNeeded, color, bg, border, benefits }) => {
            const isActive = user.loyaltyTier === tier;
            return (
              <div
                key={tier}
                className={`rounded-xl p-4 border transition-all ${
                  isActive
                    ? `${bg} ${border} ring-1 ring-inset ${border}`
                    : "bg-[#1C1C1E] border-[#2C2C2E] opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className={`font-(family-name:--font-bebas-neue) text-lg tracking-wide ${color}`}>
                    {label}
                  </p>
                  {isActive && (
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${bg} ${color}`}>
                      Current
                    </span>
                  )}
                </div>
                {pointsNeeded && (
                  <p className="text-[#8E8E93] text-xs mb-3">
                    From {pointsNeeded.toLocaleString("en-IN")} pts
                  </p>
                )}
                <ul className="space-y-1.5">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs text-[#8E8E93]">
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? color : "text-[#3C3C3E]"}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Earn more CTA ────────────────────── */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[#F2F2F7] font-semibold text-sm">Earn more points</p>
          <p className="text-[#8E8E93] text-xs mt-0.5">Shop products to earn 1 pt per ₹1 spent</p>
        </div>
        <Link
          href="/products"
          className="shrink-0 flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-4 py-2 rounded-lg text-xs transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Shop Now
        </Link>
      </div>

      {/* ── Transaction history ───────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#8E8E93]" />
          <h2 className="text-[#F2F2F7] font-semibold">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-8 text-center text-[#8E8E93] text-sm">
            No transactions yet. Start shopping to earn points!
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isCredit = TX_EARN.has(tx.type);
              return (
                <div
                  key={tx.id}
                  className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[#F2F2F7] text-sm">{tx.description ?? tx.type}</p>
                    <p className="text-[#8E8E93] text-xs mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isCredit ? "text-[#1A7A4A]" : "text-[#C0392B]"}`}>
                      {isCredit ? "+" : "−"}{tx.points} pts
                    </p>
                    <p className="text-[#8E8E93] text-xs">
                      {tx.balanceAfter.toLocaleString("en-IN")} balance
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
