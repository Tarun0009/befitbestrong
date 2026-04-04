import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Package, ShoppingBag, Users, TrendingUp,
  AlertTriangle, ArrowUpRight,
} from "lucide-react";

// Placeholder stats — will come from DB queries
const stats = [
  { label: "Revenue Today", value: "₹1,24,500", change: "+18%", up: true, icon: TrendingUp },
  { label: "Orders Today", value: "47", change: "+12%", up: true, icon: ShoppingBag },
  { label: "Total Customers", value: "5,234", change: "+8%", up: true, icon: Users },
  { label: "Products Active", value: "342", change: "-2", up: false, icon: Package },
];

const recentOrders = [
  { id: "BFS-12345678", customer: "Rahul Sharma", amount: 9999, status: "CONFIRMED", time: "2 min ago" },
  { id: "BFS-12345677", customer: "Priya Patel", amount: 3799, status: "SHIPPED", time: "18 min ago" },
  { id: "BFS-12345676", customer: "Arjun Singh", amount: 28999, status: "PENDING", time: "45 min ago" },
  { id: "BFS-12345675", customer: "Sneha Nair", amount: 1299, status: "DELIVERED", time: "1 hr ago" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PACKED: "bg-purple-500/10 text-purple-400",
  SHIPPED: "bg-[#0A4FA6]/20 text-[#0A4FA6]",
  DELIVERED: "bg-[#1A7A4A]/20 text-[#1A7A4A]",
  CANCELLED: "bg-[#C0392B]/20 text-[#C0392B]",
};

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") {
    redirect("/");
  }

  return (
    <AdminLayout activeHref="/admin">
      {/* Top bar */}
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
            Overview
          </h1>
          <p className="text-[#8E8E93] text-xs">Today, {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, up, icon: Icon }) => (
            <div key={label} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-medium">{label}</p>
                <Icon className="w-4 h-4 text-[#8E8E93]" />
              </div>
              <p className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">
                {value}
              </p>
              <p className={`text-xs mt-1 font-medium ${up ? "text-[#1A7A4A]" : "text-[#C0392B]"}`}>
                {change} vs yesterday
              </p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#C0392B] mt-0.5 shrink-0" />
          <div>
            <p className="text-[#F2F2F7] text-sm font-semibold">Low Stock Alert</p>
            <p className="text-[#8E8E93] text-xs mt-0.5">
              3 products are critically low: Adjustable Dumbbell Set (3 left), Power Cage (5 left), BCAAs 500g (2 left).{" "}
              <Link href="/admin/inventory" className="text-[#FF5500] hover:underline">View inventory →</Link>
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F2F2F7] font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[#FF5500] text-sm hover:text-[#CC4400] flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden min-w-125">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2C2C2E]">
                    {["Order", "Customer", "Amount", "Status", "Time"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={order.id} className={`border-b border-[#2C2C2E] hover:bg-[#2C2C2E]/30 transition-colors ${i === recentOrders.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/orders/${order.id}`} className="text-[#FF5500] hover:text-[#CC4400] font-mono text-xs transition-colors">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#F2F2F7]">{order.customer}</td>
                      <td className="px-5 py-3.5 price-tag text-sm">₹{order.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#8E8E93] text-xs">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[#F2F2F7] font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Create Coupon", href: "/admin/marketing/coupons/new", icon: "🎫" },
              { label: "Add Product", href: "/admin/products/new", icon: "📦" },
              { label: "View Returns", href: "/admin/orders?status=RETURNED", icon: "↩️" },
              { label: "Export Orders", href: "/admin/orders/export", icon: "📊" },
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
