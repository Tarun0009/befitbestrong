"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface WishlistProduct {
  id: string;
  productId: string;
  product: {
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    images: { url: string }[];
    variants: { price: number; stockQuantity: number }[];
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadWishlist() {
    const res = await fetch("/api/account/wishlist");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => { loadWishlist(); }, []);

  async function handleRemove(productId: string) {
    await fetch(`/api/account/wishlist?productId=${productId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">
          My Wishlist
        </h1>
        <span className="text-[#8E8E93] text-sm">{items.length} items</span>
      </div>

        {items.length === 0 ? (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-12 text-center">
            <Heart className="w-12 h-12 text-[#2C2C2E] mx-auto mb-4" />
            <p className="text-[#8E8E93] mb-4">Your wishlist is empty</p>
            <Link href="/products" className="bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-6 py-2.5 rounded transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(({ id, productId, product }) => {
              const price = product.variants[0]?.price ?? Number(product.salePrice ?? product.basePrice);
              const inStock = product.variants.some((v) => v.stockQuantity > 0);
              return (
                <div key={id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden group">
                  <div className="relative aspect-square bg-[#2C2C2E]">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8E8E93]">No image</div>
                    )}
                    <button
                      onClick={() => handleRemove(productId)}
                      className="absolute top-2 right-2 w-8 h-8 bg-[#0A0A0A]/80 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#C0392B] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`} className="text-[#F2F2F7] text-sm font-medium hover:text-[#FF5500] transition-colors line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="price-tag text-lg mt-2">{formatPrice(price, { compact: true })}</p>
                    <Link
                      href={`/products/${product.slug}`}
                      className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold uppercase tracking-widest transition-colors ${
                        inStock
                          ? "bg-[#FF5500] hover:bg-[#CC4400] text-white"
                          : "bg-[#2C2C2E] text-[#8E8E93] cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {inStock ? "Add to Cart" : "Out of Stock"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

