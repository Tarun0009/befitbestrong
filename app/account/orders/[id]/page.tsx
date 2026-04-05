export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PACKED:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED:   "bg-[#0A4FA6]/20 text-[#0A4FA6] border-[#0A4FA6]/20",
  DELIVERED: "bg-[#1A7A4A]/20 text-[#1A7A4A] border-[#1A7A4A]/20",
  RETURNED:  "bg-[#8E8E93]/20 text-[#8E8E93] border-[#8E8E93]/20",
  CANCELLED: "bg-[#C0392B]/20 text-[#C0392B] border-[#C0392B]/20",
};

const statusSteps = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: true,
      shippingAddress: true,
    },
  });

  if (!order) notFound();

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account/orders" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
              Order {order.orderNumber}
            </h1>
            <p className="text-[#8E8E93] text-xs mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Confirmation banner (shown for new orders) */}
        {order.status === "CONFIRMED" && (
          <div className="flex items-center gap-3 bg-[#1A7A4A]/10 border border-[#1A7A4A]/20 rounded-xl px-5 py-4 mb-6">
            <CheckCircle className="w-5 h-5 text-[#1A7A4A] shrink-0" />
            <div>
              <p className="text-[#1A7A4A] font-semibold text-sm">Order confirmed!</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">You&apos;ll receive updates as your order is packed and shipped.</p>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusColors[order.status] ?? "bg-[#2C2C2E] text-[#8E8E93]"}`}>
            {order.status}
          </span>
          <span className="text-[#8E8E93] text-sm">
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </div>

        {/* Progress tracker (only for active orders) */}
        {currentStep >= 0 && order.status !== "CANCELLED" && order.status !== "RETURNED" && (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-[#2C2C2E] mx-8" />
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-[#FF5500] mx-8 transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%`, right: "auto" }} />
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i <= currentStep ? "bg-[#FF5500] border-[#FF5500] text-white" : "bg-[#0A0A0A] border-[#2C2C2E] text-[#8E8E93]"}`}>
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs uppercase tracking-wide font-bold hidden sm:block ${i <= currentStep ? "text-[#FF5500]" : "text-[#8E8E93]"}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Items */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2C2C2E] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF5500]" />
              <h2 className="text-[#F2F2F7] font-semibold text-sm">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-[#2C2C2E]">
              {order.items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F2F2F7] font-medium text-sm">{item.productName}</p>
                    {item.variantTitle && <p className="text-[#8E8E93] text-xs mt-0.5">{item.variantTitle}</p>}
                    <p className="text-[#8E8E93] text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="price-tag text-sm shrink-0">{formatPrice(Number(item.totalPrice), { compact: true })}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#FF5500]" />
                <h2 className="text-[#F2F2F7] font-semibold text-sm">Shipping Address</h2>
              </div>
              <div className="text-[#8E8E93] text-sm space-y-0.5">
                <p className="text-[#F2F2F7] font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment summary */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-[#FF5500]" />
              <h2 className="text-[#F2F2F7] font-semibold text-sm">Payment Summary</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#8E8E93]">Subtotal</span><span className="text-[#F2F2F7]">{formatPrice(Number(order.subtotal), { compact: true })}</span></div>
              {Number(order.discount) > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">−{formatPrice(Number(order.discount), { compact: true })}</span></div>}
              <div className="flex justify-between"><span className="text-[#8E8E93]">Shipping</span><span className={Number(order.shippingCost) === 0 ? "text-[#1A7A4A]" : "text-[#F2F2F7]"}>{Number(order.shippingCost) === 0 ? "FREE" : formatPrice(Number(order.shippingCost), { compact: true })}</span></div>
              <div className="flex justify-between"><span className="text-[#8E8E93]">GST</span><span className="text-[#F2F2F7]">{formatPrice(Number(order.gst), { compact: true })}</span></div>
              <div className="flex justify-between font-bold border-t border-[#2C2C2E] pt-2 mt-2">
                <span className="text-[#F2F2F7]">Total</span>
                <span className="price-tag text-base">{formatPrice(Number(order.total), { compact: true })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/products" className="flex-1 text-center border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="flex-1 text-center bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors">
            All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
