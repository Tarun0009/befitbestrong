import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, TrendingUp, Gift } from "lucide-react";
type LoyaltyTier = "IRON" | "STEEL" | "TITANIUM";

const tierColors: Record<LoyaltyTier, string> = {
  IRON: "text-[#8E8E93]",
  STEEL: "text-[#C0C0C0]",
  TITANIUM: "text-[#FF5500]",
};

const tierBenefits: Record<LoyaltyTier, string[]> = {
  IRON: ["1 point per ₹1 spent", "Birthday bonus points", "Early access sales"],
  STEEL: ["1.5× points on purchases", "Free shipping above ₹999", "Priority support"],
  TITANIUM: ["2× points on all purchases", "Always free shipping", "Exclusive products", "Personal shopper"],
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

  const nextTierPoints = user.loyaltyTier === "IRON" ? 5000 : user.loyaltyTier === "STEEL" ? 15000 : null;
  const progress = nextTierPoints ? Math.min((user.loyaltyPoints / nextTierPoints) * 100, 100) : 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
            Iron Points
          </h1>
        </div>

        {/* Points card */}
        <div className="bg-gradient-to-br from-[#FF5500]/20 to-[#1C1C1E] border border-[#FF5500]/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold">Your Balance</p>
              <p className="font-(family-name:--font-bebas-neue) text-5xl text-[#FF5500] tracking-wide">
                {user.loyaltyPoints.toLocaleString("en-IN")}
              </p>
              <p className="text-[#8E8E93] text-sm">Iron Points</p>
            </div>
            <div className="text-right">
              <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">Tier</p>
              <p className={`font-(family-name:--font-bebas-neue) text-2xl tracking-wide ${tierColors[user.loyaltyTier]}`}>
                {user.loyaltyTier}
              </p>
              <Star className={`w-5 h-5 mx-auto mt-1 ${tierColors[user.loyaltyTier]}`} />
            </div>
          </div>

          {nextTierPoints && (
            <div>
              <div className="flex justify-between text-xs text-[#8E8E93] mb-1.5">
                <span>{user.loyaltyPoints.toLocaleString("en-IN")} pts</span>
                <span>{nextTierPoints.toLocaleString("en-IN")} pts for next tier</span>
              </div>
              <div className="h-2 bg-[#2C2C2E] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5500] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Tier benefits */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-[#FF5500]" />
            <p className="text-[#F2F2F7] font-semibold text-sm">{user.loyaltyTier} Tier Benefits</p>
          </div>
          <ul className="space-y-2">
            {tierBenefits[user.loyaltyTier].map((b) => (
              <li key={b} className="flex items-center gap-2 text-[#8E8E93] text-sm">
                <span className="w-1.5 h-1.5 bg-[#FF5500] rounded-full shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Transaction history */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#8E8E93]" />
            <h2 className="text-[#F2F2F7] font-semibold">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <p className="text-[#8E8E93] text-sm text-center py-8">No transactions yet. Start shopping to earn points!</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[#F2F2F7] text-sm">{tx.description ?? tx.type}</p>
                    <p className="text-[#8E8E93] text-xs mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tx.type === "EARN" || tx.type === "BONUS" || tx.type === "REFERRAL" ? "text-[#1A7A4A]" : "text-[#C0392B]"}`}>
                      {tx.type === "EARN" || tx.type === "BONUS" || tx.type === "REFERRAL" ? "+" : "-"}{tx.points} pts
                    </p>
                    <p className="text-[#8E8E93] text-xs">{tx.balanceAfter} balance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
