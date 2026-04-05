"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Trash2, Tag, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/Providers";

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  product: { name: string; slug: string; image: string };
  variant: { option1?: string | null; option2?: string | null; price: number; stockQuantity: number };
}

interface CartData {
  id: string;
  items: CartItem[];
  subtotal: number;
  couponCode: string | null;
}

const FREE_SHIPPING_THRESHOLD = 2999;

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const { refreshCart } = useCart();

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function updateQty(itemId: string, qty: number) {
    setUpdating(itemId);
    await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    await fetchCart();
    refreshCart();
    setUpdating(null);
  }

  async function removeItem(itemId: string) {
    setUpdating(itemId);
    await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    await fetchCart();
    refreshCart();
    setUpdating(null);
  }

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: cart?.subtotal ?? 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon");
      } else {
        setCouponApplied({ code: couponCode.trim(), discount: data.discount });
        setCouponCode("");
      }
    } finally {
      setValidating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  const couponDiscount = couponApplied?.discount ?? 0;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const gst = Math.round((subtotal - couponDiscount) * 0.18);
  const total = subtotal - couponDiscount + shippingCost + gst;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
          <ShoppingCart className="w-16 h-16 text-[#2C2C2E]" />
          <div className="text-center">
            <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mb-2">
              Your cart is empty
            </h1>
            <p className="text-[#8E8E93]">Add some products to get started</p>
          </div>
          <Link href="/products" className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded transition-colors">
            Shop Now
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mb-8">
          Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {amountToFreeShipping > 0 && (
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4">
                <p className="text-[#8E8E93] text-sm mb-2">
                  Add <span className="text-[#F2F2F7] font-semibold">{formatPrice(amountToFreeShipping, { compact: true })}</span> more for{" "}
                  <span className="text-[#1A7A4A] font-semibold">FREE shipping</span>
                </p>
                <div className="h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5500] rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
                </div>
              </div>
            )}

            {items.map((item) => {
              const busy = updating === item.id;
              return (
                <div key={item.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 flex gap-4">
                  <Link href={`/products/${item.product.slug}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg bg-[#2C2C2E]" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="text-[#F2F2F7] font-semibold text-sm hover:text-[#FF5500] transition-colors line-clamp-2">
                      {item.product.name}
                    </Link>
                    {(item.variant.option1 || item.variant.option2) && (
                      <p className="text-[#8E8E93] text-xs mt-0.5">
                        {[item.variant.option1, item.variant.option2].filter(Boolean).join(" / ")}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
                      <div className="flex items-center border border-[#2C2C2E] rounded">
                        <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} disabled={busy || item.quantity <= 1} className="px-2.5 py-1 text-[#8E8E93] hover:text-[#F2F2F7] text-sm disabled:opacity-40">−</button>
                        <span className="px-3 py-1 text-[#F2F2F7] text-sm font-mono min-w-10 text-center flex items-center justify-center">
                          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : item.quantity}
                        </span>
                        <button onClick={() => updateQty(item.id, Math.min(item.quantity + 1, item.variant.stockQuantity))} disabled={busy || item.quantity >= item.variant.stockQuantity} className="px-2.5 py-1 text-[#8E8E93] hover:text-[#F2F2F7] text-sm disabled:opacity-40">+</button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="price-tag text-base">{formatPrice(item.variant.price * item.quantity, { compact: true })}</span>
                        <button onClick={() => removeItem(item.id)} disabled={busy} className="text-[#8E8E93] hover:text-[#C0392B] transition-colors disabled:opacity-40" aria-label="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 sticky top-24 space-y-4">
              <h2 className="text-[#F2F2F7] font-bold text-lg">Order Summary</h2>

              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-mono font-bold text-sm">{couponApplied.code}</span>
                    <span className="text-green-400 text-xs">−{formatPrice(couponApplied.discount, { compact: true })}</span>
                  </div>
                  <button onClick={() => setCouponApplied(null)} className="text-[#8E8E93] hover:text-red-400 text-xs">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && validateCoupon()}
                      placeholder="Promo code"
                      className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors font-mono"
                    />
                  </div>
                  <button onClick={validateCoupon} disabled={validating || !couponCode.trim()} className="px-4 py-2.5 bg-[#2C2C2E] hover:bg-[#FF5500] text-[#8E8E93] hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-400 text-xs">{couponError}</p>}

              <div className="space-y-2.5 text-sm border-t border-[#2C2C2E] pt-4">
                <div className="flex justify-between"><span className="text-[#8E8E93]">Subtotal</span><span className="text-[#F2F2F7]">{formatPrice(subtotal, { compact: true })}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">−{formatPrice(couponDiscount, { compact: true })}</span></div>}
                <div className="flex justify-between"><span className="text-[#8E8E93]">Shipping</span><span className={shippingCost === 0 ? "text-[#1A7A4A] font-medium" : "text-[#F2F2F7]"}>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost, { compact: true })}</span></div>
                <div className="flex justify-between"><span className="text-[#8E8E93]">GST (18%)</span><span className="text-[#F2F2F7]">{formatPrice(gst, { compact: true })}</span></div>
              </div>

              <div className="flex justify-between items-center border-t border-[#2C2C2E] pt-4">
                <span className="text-[#F2F2F7] font-bold">Total</span>
                <span className="price-tag text-2xl">{formatPrice(total, { compact: true })}</span>
              </div>

              <Link href="/checkout" className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-[#8E8E93] text-xs">Secure checkout • SSL encrypted</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
