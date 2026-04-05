export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import InventoryAdjust from "@/components/admin/InventoryAdjust";

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    orderBy: { stockQuantity: "asc" },
    include: {
      product: { select: { name: true, category: { select: { name: true } } } },
    },
  });

  const lowStock = variants.filter((v) => v.stockQuantity <= v.lowStockAlert);
  const outOfStock = variants.filter((v) => v.stockQuantity === 0);

  return (
    <AdminLayout activeHref="/admin/inventory">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4">
        <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Inventory</h1>
        <p className="text-[#8E8E93] text-xs">{variants.length} SKUs · {outOfStock.length} out of stock · {lowStock.length} low stock</p>
      </header>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#C0392B] mt-0.5 shrink-0" />
            <div>
              <p className="text-[#F2F2F7] text-sm font-semibold">Low Stock Alert ({lowStock.length} SKUs)</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">
                {lowStock.slice(0, 3).map((v) => `${v.sku} (${v.stockQuantity} left)`).join(", ")}
                {lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Inventory table */}
        <div className="overflow-x-auto">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden min-w-175">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C2C2E]">
                  {["SKU", "Product", "Category", "Variant", "Stock", "Alert At", "Adjust"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id} className={`border-b border-[#2C2C2E] ${i === variants.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3 font-mono text-[#8E8E93] text-xs">{v.sku}</td>
                    <td className="px-4 py-3 text-[#F2F2F7] text-xs max-w-45 truncate">{v.product.name}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{v.product.category.name}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">
                      {[v.option1Value, v.option2Value].filter(Boolean).join(" / ") || "Default"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${
                        v.stockQuantity === 0 ? "text-[#C0392B]" :
                        v.stockQuantity <= v.lowStockAlert ? "text-yellow-400" :
                        "text-[#1A7A4A]"
                      }`}>
                        {v.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{v.lowStockAlert}</td>
                    <td className="px-4 py-3">
                      <InventoryAdjust variantId={v.id} currentStock={v.stockQuantity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
