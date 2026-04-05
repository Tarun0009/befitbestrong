export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package, Heart, Star, ChevronRight,
  ShoppingBag, Dumbbell, Pencil, TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const STATUS_TEXT: Record<string, string> = {
  PENDING: "text-yellow-400",
  CONFIRMED: "text-blue-400",
  PACKED: "text-purple-400",
  SHIPPED: "text-sky-400",
  DELIVERED: "text-[#1A7A4A]",
  RETURNED: "text-[#8E8E93]",
  CANCELLED: "text-[#C0392B]",
};

type Tier = "IRON" | "STEEL" | "TITANIUM";
const TIER_STYLE: Record<Tier, { text: string; bg: string; border: string }> = {
  IRON: { text: "text-[#8E8E93]", bg: "bg-[#8E8E93]/10", border: "border-[#8E8E93]/20" },
  STEEL: { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  TITANIUM: { text: "text-[#FF5500]", bg: "bg-[#FF5500]/10", border: "border-[#FF5500]/20" },
};

const NEXT_TIER: Record<Tier, number | null> = {
  IRON: 5000,
  STEEL: 15000,
  TITANIUM: null,
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, orderCount, wishlistCount, recentOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.order.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        items: { take: 1, select: { productName: true } },
      },
    }),
  ]);

  if (!user) redirect("/login");

  const tier = TIER_STYLE[user.loyaltyTier as Tier] ?? TIER_STYLE.IRON;
  const nextTierPts = NEXT_TIER[user.loyaltyTier as Tier];
  const progress = nextTierPts
    ? Math.min(Math.round((user.loyaltyPoints / nextTierPts) * 100), 100)
    : 100;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ────────────────────── */}
      <div className="bg-linear-to-br from-[#FF5500]/15 via-[#1C1C1E] to-[#1C1C1E] border border-[#FF5500]/20 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#FF5500]/10 border-2 border-[#FF5500]/30 flex items-center justify-center shrink-0">
              <span className="font-(family-name:--font-bebas-neue) text-2xl text-[#FF5500]">
                {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-0.5">
                Member since {memberSince}
              </p>
              <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">
                {user.name ?? user.email}
              </h1>
              <span
                className={`inline-block mt-1.5 text-xs font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}
              >
                {user.loyaltyTier} Member
              </span>
            </div>
          </div>
          <Link
            href="/account/profile"
            className="flex items-center gap-1.5 text-[#8E8E93] hover:text-[#FF5500] text-xs font-medium transition-colors shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>

        {/* Points progress */}
        {nextTierPts ? (
          <div>
            <div className="flex justify-between text-xs text-[#8E8E93] mb-1.5">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {user.loyaltyPoints.toLocaleString("en-IN")} pts
              </span>
              <span>{nextTierPts.toLocaleString("en-IN")} pts for next tier</span>
            </div>
            <div className="h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5500] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-[#FF5500] text-xs font-bold uppercase tracking-widest">
            ★ Titanium — Highest Tier
          </p>
        )}
      </div>

      {/* ── Stats row ─────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Orders", value: orderCount, icon: Package, href: "/account/orders", color: "text-blue-400" },
          { label: "Iron Points", value: user.loyaltyPoints.toLocaleString("en-IN"), icon: Star, href: "/account/loyalty", color: "text-[#FF5500]" },
          { label: "Wishlist", value: wishlistCount, icon: Heart, href: "/account/wishlist", color: "text-rose-400" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/30 rounded-xl p-4 text-center transition-all group"
          >
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7]">{value}</p>
            <p className="text-[#8E8E93] text-xs mt-0.5 group-hover:text-[#F2F2F7] transition-colors">
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Recent orders ─────────────────────── */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#F2F2F7] font-semibold">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-[#FF5500] text-sm hover:text-[#CC4400] flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/30 rounded-xl px-5 py-4 transition-all group"
              >
                <div>
                  <p className="text-[#F2F2F7] font-mono text-sm font-medium group-hover:text-[#FF5500] transition-colors">
                    {order.orderNumber}
                  </p>
                  <p className="text-[#8E8E93] text-xs mt-0.5">
                    {order.items[0]?.productName ?? "Order"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold uppercase ${
                      STATUS_TEXT[order.status] ?? "text-[#8E8E93]"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-[#FF5500] font-semibold text-sm">
                    {formatPrice(Number(order.total), { compact: true })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#2C2C2E] group-hover:text-[#FF5500] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick actions ─────────────────────── */}
      <div>
        <h2 className="text-[#F2F2F7] font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/products"
            className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/30 rounded-xl p-4 flex items-center gap-3 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF5500]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5500]/20 transition-colors">
              <ShoppingBag className="w-4 h-4 text-[#FF5500]" />
            </div>
            <div>
              <p className="text-[#F2F2F7] text-sm font-medium">Shop Now</p>
              <p className="text-[#8E8E93] text-xs">Browse products</p>
            </div>
          </Link>
          <Link
            href="/gym-builder"
            className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/30 rounded-xl p-4 flex items-center gap-3 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF5500]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5500]/20 transition-colors">
              <Dumbbell className="w-4 h-4 text-[#FF5500]" />
            </div>
            <div>
              <p className="text-[#F2F2F7] text-sm font-medium">Gym Builder</p>
              <p className="text-[#8E8E93] text-xs">AI equipment plan</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Admin shortcut */}
      {user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="block bg-[#1C1C1E] border border-[#FF5500]/20 hover:border-[#FF5500]/40 rounded-xl p-4 text-center text-[#FF5500] hover:text-[#CC4400] font-bold uppercase tracking-widest text-sm transition-all"
        >
          Admin Panel →
        </Link>
      )}
    </div>
  );
}
