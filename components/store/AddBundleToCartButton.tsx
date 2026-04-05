"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BundleItem {
  variantId: string;
  quantity: number;
}

interface AddBundleToCartButtonProps {
  items: BundleItem[];
}

export default function AddBundleToCartButton({ items }: AddBundleToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAddBundle() {
    setLoading(true);
    setError(null);

    try {
      for (const item of items) {
        const res = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to add item");
        }
      }
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddBundle}
        disabled={loading || done}
        className={`w-full py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95
          ${done
            ? "bg-[#1A7A4A] text-white"
            : "bg-[#FF5500] hover:bg-[#CC4400] text-white disabled:opacity-60 disabled:cursor-not-allowed"
          }`}
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {done ? "Bundle Added to Cart!" : loading ? "Adding..." : "Add Bundle to Cart"}
      </button>
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
