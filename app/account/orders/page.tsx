export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PACKED: "bg-purple-500/10 text-purple-400",
  SHIPPED: "bg-[#0A4FA6]/20 text-[#0A4FA6]",
  DELIVERED: "bg-[#1A7A4A]/20 text-[#1A7A4A]",
  RETURNED: "bg-[#8E8E93]/20 text-[#8E8E93]",
  CANCELLED: "bg-[#C0392B]/20 text-[#C0392B]",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 2,
        include: { variant: { include: { product: { include: { images: { take: 1 } } } } } },
      },
    },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide mb-6">
        My Orders
      </h1>
      <div>

        {orders.length === 0 ? (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-[#2C2C2E] mx-auto mb-4" />
            <p className="text-[#8E8E93] mb-4">No orders yet</p>
            <Link href="/products" className="bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-6 py-2.5 rounded transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-[#2C2C2E]">
                  <div>
                    <p className="text-[#F2F2F7] font-mono text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-[#8E8E93] text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="price-tag text-sm">{formatPrice(Number(order.total), { compact: true })}</span>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="text-[#8E8E93] text-sm">
                    {order.items.map((item) => item.productName).join(", ")}
                    {order.items.length < (order as typeof order & { _count?: { items: number } })._count?.items! ? " +" : ""}
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-[#FF5500] hover:text-[#CC4400] text-sm transition-colors"
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
