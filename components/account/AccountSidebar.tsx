"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Package, Heart, MapPin, Star, Zap,
  Settings, LayoutDashboard, Share2,
} from "lucide-react";

const NAV = [
  { label: "Overview", href: "/account", icon: LayoutDashboard, exact: true },
  { label: "My Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Loyalty Points", href: "/account/loyalty", icon: Star },
  { label: "Referral", href: "/account/referral", icon: Share2 },
  { label: "Subscriptions", href: "/account/subscriptions", icon: Zap },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

type Tier = "IRON" | "STEEL" | "TITANIUM";

const TIER: Record<Tier, { text: string; bg: string; border: string; label: string }> = {
  IRON: {
    text: "text-[#8E8E93]",
    bg: "bg-[#8E8E93]/10",
    border: "border-[#8E8E93]/20",
    label: "Iron",
  },
  STEEL: {
    text: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    label: "Steel",
  },
  TITANIUM: {
    text: "text-[#FF5500]",
    bg: "bg-[#FF5500]/10",
    border: "border-[#FF5500]/20",
    label: "Titanium",
  },
};

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  loyaltyTier: string;
  loyaltyPoints: number;
}

export default function AccountSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const tier = TIER[user.loyaltyTier as Tier] ?? TIER.IRON;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────── */}
      <div className="hidden lg:flex flex-col gap-4">
        {/* User card */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#FF5500]/10 border-2 border-[#FF5500]/30 flex items-center justify-center shrink-0">
              <span className="font-(family-name:--font-bebas-neue) text-xl text-[#FF5500]">
                {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[#F2F2F7] font-semibold text-sm truncate">
                {user.name ?? "My Account"}
              </p>
              <p className="text-[#8E8E93] text-xs truncate">{user.email}</p>
            </div>
          </div>
          <div className={`flex items-center justify-between ${tier.bg} border ${tier.border} rounded-lg px-3 py-2`}>
            <span className={`text-xs font-bold uppercase tracking-widest ${tier.text}`}>
              {tier.label} Tier
            </span>
            <span className={`text-xs font-semibold ${tier.text}`}>
              {user.loyaltyPoints.toLocaleString("en-IN")} pts
            </span>
          </div>
        </div>

        {/* Nav list */}
        <nav className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden">
          {NAV.map(({ label, href, icon: Icon, exact }, i) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  i < NAV.length - 1 ? "border-b border-[#2C2C2E]" : ""
                } ${
                  isActive
                    ? "bg-[#FF5500]/10 text-[#FF5500] font-semibold"
                    : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#2C2C2E]/40"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Mobile horizontal pill nav ──────── */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          {NAV.map(({ label, href, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#FF5500] text-white"
                    : "bg-[#1C1C1E] border border-[#2C2C2E] text-[#8E8E93] hover:text-[#F2F2F7]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
