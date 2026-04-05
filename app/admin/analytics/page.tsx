export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import { formatPrice } from "@/lib/utils";

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}

function buildLast30DaysMap(): Map<string, Date> {
  const map = new Map<string, Date>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    map.set(formatShortDate(d), d);
  }
  return map;
}

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all data in parallel
  const [
    paidOrders,
    allOrders,
    orderItemsGrouped,
    allOrderStatuses,
    newUsers,
    totalCustomers,
  ] = await Promise.all([
    // Paid orders in last 30 days for revenue chart
    prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { total: true, createdAt: true },
    }),
    // All paid orders for total revenue + avg order value
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { total: true },
    }),
    // Top products by order count
    prisma.orderItem.groupBy({
      by: ["productName"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    // Order status counts
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // New users last 30 days
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    // Total customers
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  // Build revenue by day (last 30 days)
  const dayMap = buildLast30DaysMap();
  const revenueByDay = new Map<string, number>();
  dayMap.forEach((_, label) => revenueByDay.set(label, 0));

  for (const order of paidOrders) {
    const label = formatShortDate(order.createdAt);
    if (revenueByDay.has(label)) {
      revenueByDay.set(label, (revenueByDay.get(label) ?? 0) + Number(order.total));
    }
  }

  const revenueData = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
    orders: 0,
  }));

  // Status breakdown
  const statusData = allOrderStatuses.map((s) => ({
    status: s.status,
    count: s._count.id,
  }));

  // Top products
  const topProducts = orderItemsGrouped.map((item) => ({
    name:
      item.productName.length > 18
        ? item.productName.slice(0, 18) + "…"
        : item.productName,
    orders: item._count.id,
  }));

  // New users by day
  const usersByDay = new Map<string, number>();
  dayMap.forEach((_, label) => usersByDay.set(label, 0));
  for (const user of newUsers) {
    const label = formatShortDate(user.createdAt);
    if (usersByDay.has(label)) {
      usersByDay.set(label, (usersByDay.get(label) ?? 0) + 1);
    }
  }
  const newUsersData = Array.from(usersByDay.entries()).map(([date, users]) => ({
    date,
    users,
  }));

  // Summary stats
  const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = allOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      sub: "All paid orders",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      sub: "Paid orders",
    },
    {
      label: "Total Customers",
      value: totalCustomers.toLocaleString("en-IN"),
      sub: "Registered accounts",
    },
    {
      label: "Avg Order Value",
      value: formatPrice(avgOrderValue),
      sub: "Per paid order",
    },
  ];

  return (
    <AdminLayout activeHref="/admin/analytics">
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wider">
            Analytics
          </h1>
          <p className="text-[#8E8E93] text-sm mt-1">
            Store performance overview — last 30 days
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5"
            >
              <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <p className="text-[#F2F2F7] text-2xl font-bold">{card.value}</p>
              <p className="text-[#8E8E93] text-xs mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <AnalyticsCharts
          revenueData={revenueData}
          statusData={statusData}
          topProducts={topProducts}
          newUsersData={newUsersData}
        />
      </div>
    </AdminLayout>
  );
}
