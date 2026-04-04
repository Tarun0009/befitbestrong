import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const { status: statusParam, page: pageParam } = await searchParams;
  const status = statusParam as typeof ALL_STATUSES[number] | undefined;
  const page = parseInt(pageParam ?? "1");
  const take = 20;
  const skip = (page - 1) * take;

  const where = status ? { status: status as never } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, select: { productName: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  return (
    <AdminLayout activeHref="/admin/orders">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4">
        <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Orders</h1>
        <p className="text-[#8E8E93] text-xs">{total} total orders</p>
      </header>

      <div className="p-4 sm:p-8">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1">
          <Link
            href="/admin/orders"
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors shrink-0 ${
              !status ? "bg-[#FF5500] text-white" : "bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F2F2F7] border border-[#2C2C2E]"
            }`}
          >
            All ({total})
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors shrink-0 ${
                status === s ? "bg-[#FF5500] text-white" : "bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F2F2F7] border border-[#2C2C2E]"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden min-w-175">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C2C2E]">
                  {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#8E8E93]">No orders found</td>
                  </tr>
                ) : orders.map((order, i) => (
                  <tr key={order.id} className={`border-b border-[#2C2C2E] hover:bg-[#2C2C2E]/30 transition-colors ${i === orders.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-[#FF5500] hover:text-[#CC4400] font-mono text-xs transition-colors">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#F2F2F7] text-xs">{order.user?.name ?? order.guestEmail ?? "Guest"}</p>
                      <p className="text-[#8E8E93] text-xs">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">
                      {order.items[0]?.productName}
                    </td>
                    <td className="px-4 py-3 price-tag text-xs">
                      {formatPrice(Number(order.total), { compact: true })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        order.paymentStatus === "PAID" ? "bg-[#1A7A4A]/20 text-[#1A7A4A]" :
                        order.paymentStatus === "FAILED" ? "bg-[#C0392B]/20 text-[#C0392B]" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-[#8E8E93] text-sm">
              Showing {skip + 1}–{Math.min(skip + take, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={`/admin/orders?${status ? `status=${status}&` : ""}page=${page - 1}`}
                  className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded hover:border-[#FF5500]/40 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-[#8E8E93]" />
                </Link>
              )}
              <span className="text-[#F2F2F7] text-sm px-3">{page} / {totalPages}</span>
              {page < totalPages && (
                <Link href={`/admin/orders?${status ? `status=${status}&` : ""}page=${page + 1}`}
                  className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded hover:border-[#FF5500]/40 transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
