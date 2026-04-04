import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Package, Heart, MapPin, Star, LogOut, Zap } from "lucide-react";

const navItems = [
  { label: "My Orders", href: "/account/orders", icon: Package, desc: "Track and manage your orders" },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart, desc: "Products you've saved" },
  { label: "Addresses", href: "/account/addresses", icon: MapPin, desc: "Manage shipping addresses" },
  { label: "Loyalty Points", href: "/account/loyalty", icon: Star, desc: "View your Iron Points balance" },
  { label: "Subscriptions", href: "/account/subscriptions", icon: Zap, desc: "Manage your Iron Club membership" },
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string; name?: string | null; email?: string | null; role?: string };

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
            href="/api/auth/signout"
            className="text-[#8E8E93] hover:text-[#FF5500] text-sm transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile card */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center shrink-0">
            <span className="font-(family-name:--font-bebas-neue) text-2xl text-[#FF5500]">
              {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
              {user.name ?? "My Account"}
            </h1>
            <p className="text-[#8E8E93] text-sm">{user.email}</p>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-block mt-1.5 text-xs font-bold uppercase tracking-widest text-[#FF5500] hover:text-[#CC4400] transition-colors"
              >
                Admin Panel →
              </Link>
            )}
          </div>
        </div>

        {/* Nav grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navItems.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/40 rounded-xl p-5 flex items-start gap-4 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5500]/20 transition-colors">
                <Icon className="w-5 h-5 text-[#FF5500]" />
              </div>
              <div>
                <p className="text-[#F2F2F7] font-semibold text-sm group-hover:text-white transition-colors">{label}</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
