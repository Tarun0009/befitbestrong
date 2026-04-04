"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Tag, Loader2, ChevronRight } from "lucide-react";

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

interface AddressForm {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const SHIPPING_THRESHOLD = 2999;
const SHIPPING_COST = 99;
const GST_RATE = 0.18;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const [address, setAddress] = useState<AddressForm>({
    fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [guestEmail, setGuestEmail] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{
    discount: number;
    description: string;
    code: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } finally {
      setLoadingCart(false);
    }
  }

  // Derived totals
  const subtotal = cart?.subtotal ?? 0;
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = couponResult?.discount ?? 0;
  const gst = Math.round((subtotal - discount) * GST_RATE);
  const total = subtotal + shipping + gst - discount;
  const ironPoints = Math.floor(total); // 1 point per ₹1

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    setCouponResult(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon");
        return;
      }
      setCouponResult({ discount: data.discount, description: data.description, code: data.code });
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  }

  function removeCoupon() {
    setCouponResult(null);
    setCouponCode("");
    setCouponError(null);
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cart) return;

    const missingAddress =
      !address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode;
    if (missingAddress) {
      setOrderError("Please fill in all required address fields.");
      return;
    }
    if (!session?.user && !guestEmail) {
      setOrderError("Please enter your email to continue as guest.");
      return;
    }

    setPlacing(true);
    setOrderError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          paymentMethod: "COD",
          guestEmail: !session?.user ? guestEmail : undefined,
          shippingAddress: address,
          couponCode: couponResult?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Failed to place order");
        return;
      }
      setOrderSuccess({ orderNumber: data.order.orderNumber });
    } catch {
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // Success state
  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wide mb-2">
              Order Placed!
            </h1>
            <p className="text-[#8E8E93] mb-2">
              Your order <span className="text-[#F2F2F7] font-mono font-semibold">{orderSuccess.orderNumber}</span> has been confirmed.
            </p>
            <p className="text-[#8E8E93] text-sm mb-8">
              You&apos;ve earned <span className="text-[#FF5500] font-semibold">{ironPoints} Iron Points</span> for this order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {session?.user && (
                <Link
                  href="/account/orders"
                  className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
                >
                  Track Order
                </Link>
              )}
              <Link
                href="/products"
                className="border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mb-8">
          Checkout
        </h1>

        {loadingCart ? (
          <div className="flex items-center justify-center py-16 text-[#8E8E93]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading your cart...
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-[#2C2C2E] mx-auto mb-3" />
            <p className="text-[#8E8E93] mb-4">Your cart is empty.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-[#FF5500] font-bold uppercase tracking-widest text-sm"
            >
              Shop Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left column: address + guest email */}
              <div className="lg:col-span-3 space-y-6">
                {/* Guest email */}
                {!session?.user && (
                  <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5">
                    <h2 className="font-(family-name:--font-bebas-neue) text-xl text-[#F2F2F7] tracking-wide mb-4">
                      Contact
                    </h2>
                    <div>
                      <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                      />
                    </div>
                    <p className="text-[#8E8E93] text-xs mt-2">
                      Already have an account?{" "}
                      <Link href="/login?callbackUrl=/checkout" className="text-[#FF5500] hover:underline">
                        Log in
                      </Link>
                    </p>
                  </div>
                )}

                {/* Shipping Address */}
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5">
                  <h2 className="font-(family-name:--font-bebas-neue) text-xl text-[#F2F2F7] tracking-wide mb-4">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { field: "fullName" as const, label: "Full Name", placeholder: "John Doe", span: 1 },
                      { field: "phone" as const, label: "Phone", placeholder: "+91 98765 43210", span: 1 },
                      { field: "line1" as const, label: "Address Line 1", placeholder: "Building, Street", span: 2 },
                      { field: "line2" as const, label: "Address Line 2 (optional)", placeholder: "Area, Landmark", span: 2 },
                      { field: "city" as const, label: "City", placeholder: "Mumbai", span: 1 },
                      { field: "state" as const, label: "State", placeholder: "Maharashtra", span: 1 },
                      { field: "pincode" as const, label: "Pincode", placeholder: "400001", span: 1 },
                    ].map(({ field, label, placeholder, span }) => (
                      <div key={field} className={span === 2 ? "sm:col-span-2" : ""}>
                        <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={address[field]}
                          onChange={(e) => setAddress((a) => ({ ...a, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5">
                  <h2 className="font-(family-name:--font-bebas-neue) text-xl text-[#F2F2F7] tracking-wide mb-4">
                    Coupon Code
                  </h2>
                  {couponResult ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-mono font-bold text-sm">{couponResult.code}</span>
                        <span className="text-green-400 text-sm">— {couponResult.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[#8E8E93] hover:text-red-400 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm font-mono focus:outline-none focus:border-[#FF5500] transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateCoupon())}
                      />
                      <button
                        type="button"
                        onClick={validateCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-5 py-2.5 bg-[#2C2C2E] hover:bg-[#FF5500] text-[#F2F2F7] hover:text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors disabled:opacity-50"
                      >
                        {validatingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-400 text-sm mt-2">{couponError}</p>
                  )}
                </div>
              </div>

              {/* Right column: Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5 sticky top-6">
                  <h2 className="font-(family-name:--font-bebas-neue) text-xl text-[#F2F2F7] tracking-wide mb-4">
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                    {cart.items.map((item) => {
                      const variantLabel = [item.variant.option1, item.variant.option2]
                        .filter(Boolean)
                        .join(" / ");
                      return (
                        <div key={item.id} className="flex items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-[#2C2C2E] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F2F2F7] text-xs font-medium line-clamp-1">
                              {item.product.name}
                            </p>
                            {variantLabel && (
                              <p className="text-[#8E8E93] text-xs">{variantLabel}</p>
                            )}
                            <p className="text-[#8E8E93] text-xs">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-[#F2F2F7] text-sm font-semibold shrink-0">
                            {formatPrice(item.variant.price * item.quantity, { compact: true })}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#2C2C2E] pt-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8E8E93]">Subtotal</span>
                      <span className="text-[#F2F2F7]">{formatPrice(subtotal, { compact: true })}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Coupon Discount</span>
                        <span className="text-green-400">−{formatPrice(discount, { compact: true })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8E8E93]">Shipping</span>
                      <span className={shipping === 0 ? "text-green-400" : "text-[#F2F2F7]"}>
                        {shipping === 0 ? "FREE" : formatPrice(shipping, { compact: true })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8E8E93]">GST (18%)</span>
                      <span className="text-[#F2F2F7]">{formatPrice(gst, { compact: true })}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-[#2C2C2E] pt-3">
                      <span className="text-[#F2F2F7]">Total</span>
                      <span className="text-[#FF5500] font-(family-name:--font-bebas-neue) text-2xl">
                        {formatPrice(total, { compact: true })}
                      </span>
                    </div>
                  </div>

                  {/* Loyalty Points */}
                  {(session?.user || true) && (
                    <div className="mt-4 bg-[#FF5500]/5 border border-[#FF5500]/20 rounded-lg px-4 py-3 text-center">
                      <p className="text-[#FF5500] text-xs font-medium">
                        You&apos;ll earn{" "}
                        <span className="font-bold">{ironPoints} Iron Points</span>{" "}
                        for this order
                      </p>
                    </div>
                  )}

                  {/* Payment method note */}
                  <div className="mt-4 text-center">
                    <p className="text-[#8E8E93] text-xs mb-3">Payment method: Cash on Delivery</p>
                  </div>

                  {orderError && (
                    <div className="mb-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-xs">
                      {orderError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={placing}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {placing ? "Placing Order..." : "Place Order (COD)"}
                  </button>

                  <p className="text-[#8E8E93] text-xs text-center mt-3">
                    Online payment coming soon. COD available across India.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
