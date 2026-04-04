import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Trash2, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Placeholder cart items — will come from API/zustand store
const DEMO_ITEMS = [
  {
    id: "ci1",
    variantId: "v1",
    quantity: 1,
    product: {
      name: "Olympic Barbell 20kg — Competition Grade",
      slug: "olympic-barbell-20kg",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
    },
    variant: { option1: "Standard 20kg", price: 9999, stockQuantity: 15 },
  },
  {
    id: "ci2",
    variantId: "v2",
    quantity: 2,
    product: {
      name: "Whey Protein Isolate Chocolate 2kg",
      slug: "whey-protein-isolate-chocolate-2kg",
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200&h=200&fit=crop",
    },
    variant: { option1: "Chocolate", option2: "2kg", price: 3799, stockQuantity: 42 },
  },
];

const FREE_SHIPPING_THRESHOLD = 2999;

export default function CartPage() {
  const subtotal = DEMO_ITEMS.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shippingCost + gst;

  if (DEMO_ITEMS.length === 0) {
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
          <Link
            href="/products"
            className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded transition-colors"
          >
            Shop Now
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={DEMO_ITEMS.length} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mb-8">
          Your Cart ({DEMO_ITEMS.length} {DEMO_ITEMS.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping bar */}
            {amountToFreeShipping > 0 && (
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4">
                <p className="text-[#8E8E93] text-sm mb-2">
                  Add{" "}
                  <span className="text-[#F2F2F7] font-semibold">
                    {formatPrice(amountToFreeShipping, { compact: true })}
                  </span>{" "}
                  more for <span className="text-[#1A7A4A] font-semibold">FREE shipping</span>
                </p>
                <div className="h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF5500] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            {DEMO_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 flex gap-4"
              >
                <Link href={`/products/${item.product.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#2C2C2E] shrink-0"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-[#F2F2F7] font-semibold text-sm hover:text-[#FF5500] transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  {(item.variant.option1 || item.variant.option2) && (
                    <p className="text-[#8E8E93] text-xs mt-0.5">
                      {[item.variant.option1, item.variant.option2].filter(Boolean).join(" / ")}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#2C2C2E] rounded">
                      <button className="px-2.5 py-1 text-[#8E8E93] hover:text-[#F2F2F7] text-sm">−</button>
                      <span className="px-3 py-1 text-[#F2F2F7] text-sm font-mono">{item.quantity}</span>
                      <button className="px-2.5 py-1 text-[#8E8E93] hover:text-[#F2F2F7] text-sm">+</button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="price-tag text-base">
                        {formatPrice(item.variant.price * item.quantity, { compact: true })}
                      </span>
                      <button className="text-[#8E8E93] hover:text-[#C0392B] transition-colors" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 sticky top-24 space-y-4">
              <h2 className="text-[#F2F2F7] font-bold text-lg">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                  <input
                    placeholder="Promo code"
                    className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <button className="px-4 py-2.5 bg-[#2C2C2E] hover:bg-[#FF5500] text-[#8E8E93] hover:text-white rounded-lg text-sm font-medium transition-colors">
                  Apply
                </button>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-sm border-t border-[#2C2C2E] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Subtotal</span>
                  <span className="text-[#F2F2F7]">{formatPrice(subtotal, { compact: true })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Shipping</span>
                  <span className={shippingCost === 0 ? "text-[#1A7A4A] font-medium" : "text-[#F2F2F7]"}>
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">GST (18%)</span>
                  <span className="text-[#F2F2F7]">{formatPrice(gst, { compact: true })}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#2C2C2E] pt-4">
                <span className="text-[#F2F2F7] font-bold">Total</span>
                <span className="price-tag text-2xl">{formatPrice(total, { compact: true })}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-[#8E8E93] text-xs">
                Secure checkout • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
