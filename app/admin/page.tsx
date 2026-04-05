export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { prisma } from "@/lib/db";
import {
  Package, ShoppingBag, Users, TrendingUp,
  AlertTriangle, ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PACKED: "bg-purple-500/10 text-purple-400",
  SHIPPED: "bg-[#0A4FA6]/20 text-[#0A4FA6]",
  DELIVERED: "bg-[#1A7A4A]/20 text-[#1A7A4A]",
  CANCELLED: "bg-[#C0392B]/20 text-[#C0392B]",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const [
    todayRevenue,
    yesterdayRevenue,
    todayOrders,
    yesterdayOrders,
    totalCustomers,
    yesterdayCustomers,
    activeProducts,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    // Today revenue
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, paymentStatus: { in: ["PAID", "PENDING"] } },
      _sum: { total: true },
    }),
    // Yesterday revenue
    prisma.order.aggregate({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart }, paymentStatus: { in: ["PAID", "PENDING"] } },
      _sum: { total: true },
    }),
    // Today orders
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    // Yesterday orders
    prisma.order.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    // Total customers
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    // Yesterday total customers (to calc growth)
    prisma.user.count({ where: { createdAt: { lt: todayStart } } }),
    // Active products
    prisma.product.count({ where: { isActive: true } }),
    // Recent 5 orders
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        guestEmail: true,
        user: { select: { name: true, email: true } },
      },
    }),
    // Low stock variants
    prisma.productVariant.count({
      where: { stockQuantity: { lte: 5 }, isActive: true },
    }),
  ]);

  const todayRev = Number(todayRevenue._sum.total ?? 0);
  const yestRev = Number(yesterdayRevenue._sum.total ?? 0);
  const revChange = yestRev > 0 ? Math.round(((todayRev - yestRev) / yestRev) * 100) : 0;
  const orderChange = yesterdayOrders > 0 ? Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100) : 0;
  const newCustomers = totalCustomers - yesterdayCustomers;

  const stats = [
    {
      label: "Revenue Today",
      value: formatPrice(todayRev, { compact: true }),
      change: `${revChange >= 0 ? "+" : ""}${revChange}%`,
      up: revChange >= 0,
      icon: TrendingUp,
    },
    {
      label: "Orders Today",
      value: String(todayOrders),
      change: `${orderChange >= 0 ? "+" : ""}${orderChange}%`,
      up: orderChange >= 0,
      icon: ShoppingBag,
    },
    {
      label: "Total Customers",
      value: totalCustomers.toLocaleString("en-IN"),
      change: `+${newCustomers} today`,
      up: true,
      icon: Users,
    },
    {
      label: "Products Active",
      value: String(activeProducts),
      change: lowStockVariants > 0 ? `${lowStockVariants} low stock` : "All stocked",
      up: lowStockVariants === 0,
      icon: Package,
    },
  ];

  return (
    <AdminLayout activeHref="/admin">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Overview</h1>
          <p className="text-[#8E8E93] text-xs">
            Today, {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors"
        >
          + Add Product
        </Link>
      </header>

      <div className="p-4 sm:p-8 space-y-8">
        {/* Live Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, up, icon: Icon }) => (
            <div key={label} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-medium">{label}</p>
                <Icon className="w-4 h-4 text-[#8E8E93]" />
              </div>
              <p className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">{value}</p>
              <p className={`text-xs mt-1 font-medium ${up ? "text-[#1A7A4A]" : "text-[#C0392B]"}`}>
                {change} vs yesterday
              </p>
            </div>
          ))}
        </div>

        {/* Low stock alert */}
        {lowStockVariants > 0 && (
          <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#C0392B] mt-0.5 shrink-0" />
            <div>
              <p className="text-[#F2F2F7] text-sm font-semibold">Low Stock Alert</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">
                {lowStockVariants} variant{lowStockVariants !== 1 ? "s are" : " is"} critically low (≤5 units).{" "}
                <Link href="/admin/inventory" className="text-[#FF5500] hover:underline">View inventory →</Link>
              </p>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F2F2F7] font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[#FF5500] text-sm hover:text-[#CC4400] flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-8 text-center text-[#8E8E93] text-sm">
              No orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden min-w-125">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2C2C2E]">
                      {["Order", "Customer", "Amount", "Status", "Time"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, i) => (
                      <tr key={order.id} className={`border-b border-[#2C2C2E] hover:bg-[#2C2C2E]/30 transition-colors ${i === recentOrders.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/orders/${order.id}`} className="text-[#FF5500] hover:text-[#CC4400] font-mono text-xs transition-colors">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-[#F2F2F7] text-xs">
                          {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "Guest"}
                        </td>
                        <td className="px-5 py-3.5 price-tag text-sm">{formatPrice(Number(order.total), { compact: true })}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${statusColors[order.status] ?? "bg-[#2C2C2E] text-[#8E8E93]"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#8E8E93] text-xs">{timeAgo(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[#F2F2F7] font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Create Coupon", href: "/admin/marketing/coupons/new", icon: "🎫" },
              { label: "Add Product", href: "/admin/products/new", icon: "📦" },
              { label: "Inventory", href: "/admin/inventory", icon: "📊" },
              { label: "Reviews", href: "/admin/reviews", icon: "⭐" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/40 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all group"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-[#8E8E93] group-hover:text-[#F2F2F7] text-xs font-medium transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
