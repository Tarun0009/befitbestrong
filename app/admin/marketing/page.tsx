export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus } from "lucide-react";
import CouponToggle from "@/components/admin/CouponToggle";
import FlashSaleManager from "@/components/admin/FlashSaleManager";

export default async function AdminMarketingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const [coupons, flashSaleProducts] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({
      where: { saleEndsAt: { not: null }, isActive: true },
      select: { id: true, name: true, slug: true, basePrice: true, salePrice: true, saleEndsAt: true },
      orderBy: { saleEndsAt: "asc" },
    }),
  ]);

  return (
    <AdminLayout activeHref="/admin/marketing">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4">
        <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Marketing</h1>
        <p className="text-[#8E8E93] text-xs">{coupons.length} coupons · {flashSaleProducts.length} active flash sales</p>
      </header>

      <div className="p-4 sm:p-8 space-y-10">
        {/* ── Coupons ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F2F2F7] font-bold">Coupons</h2>
            <Link
              href="/admin/marketing/coupons/new"
              className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors"
            >
              <Plus className="w-4 h-4" /> New Coupon
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden min-w-150">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2C2C2E]">
                    {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[#8E8E93]">No coupons yet</td></tr>
                  ) : coupons.map((c, i) => (
                    <tr key={c.id} className={`border-b border-[#2C2C2E] ${i === coupons.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3 font-mono text-[#FF5500] font-bold text-xs">{c.code}</td>
                      <td className="px-4 py-3 text-[#8E8E93] text-xs capitalize">{c.type.toLowerCase().replace("_", " ")}</td>
                      <td className="px-4 py-3 text-[#F2F2F7] text-xs">
                        {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED" ? `₹${c.value}` : "Free ship"}
                      </td>
                      <td className="px-4 py-3 text-[#8E8E93] text-xs">
                        {c.minOrderValue ? `₹${c.minOrderValue}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#8E8E93] text-xs">
                        {c.usesCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-[#8E8E93] text-xs">
                        {c.validTo ? new Date(c.validTo).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <CouponToggle id={c.id} isActive={c.isActive} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Flash Sales ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F2F2F7] font-bold">Flash Sales</h2>
          </div>
          <FlashSaleManager initialSales={flashSaleProducts.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            basePrice: Number(p.basePrice),
            salePrice: p.salePrice ? Number(p.salePrice) : null,
            saleEndsAt: p.saleEndsAt?.toISOString() ?? null,
          }))} />
        </div>
      </div>
    </AdminLayout>
  );
}
