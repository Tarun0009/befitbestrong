"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/Providers";

interface AddToCartButtonProps {
  variantId: string;
  inStock: boolean;
}

export default function AddToCartButton({ variantId, inStock }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const router = useRouter();

  async function addToCart(): Promise<boolean> {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to add to cart"); return false; }
    refreshCart();
    return true;
  }

  async function handleAddToCart() {
    if (!inStock) return;
    setAdding(true);
    setError(null);
    const ok = await addToCart();
    setAdding(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  async function handleBuyNow() {
    if (!inStock) return;
    setAdding(true);
    setError(null);
    const ok = await addToCart();
    setAdding(false);
    if (ok) router.push("/checkout");
  }

  return (
    <div className="space-y-3">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <p className="text-[#8E8E93] text-sm uppercase tracking-widest font-bold">Qty</p>
        <div className="flex items-center border border-[#2C2C2E] rounded">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-[#8E8E93] hover:text-[#F2F2F7] transition-colors text-lg leading-none">−</button>
          <span className="px-4 py-2 text-[#F2F2F7] font-mono text-sm min-w-12 text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-[#8E8E93] hover:text-[#F2F2F7] transition-colors text-lg leading-none">+</button>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          className={`flex-1 py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
            ${!inStock ? "bg-[#2C2C2E] text-[#8E8E93] cursor-not-allowed"
              : added ? "bg-[#1A7A4A] text-white"
              : "bg-[#FF5500] hover:bg-[#CC4400] text-white active:scale-95"}`}
        >
          {adding ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <ShoppingCart className="w-4 h-4" />}
          {!inStock ? "Out of Stock" : added ? "Added!" : adding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!inStock || adding}
          className="flex-1 py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </button>
      </div>
    </div>
  );
}
