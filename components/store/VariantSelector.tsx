"use client";

import { useState } from "react";
import AddToCartButton from "@/components/store/AddToCartButton";
import { formatPrice } from "@/lib/utils";

interface Variant {
  id: string;
  option1Value: string | null;
  option2Value: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  sku: string;
}

interface Props {
  variants: Variant[];
  basePrice: number;
}

export default function VariantSelector({ variants, basePrice }: Props) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const displayPrice = selected ? selected.price : basePrice;
  const comparePrice = selected?.compareAtPrice ?? null;
  const inStock = (selected?.stockQuantity ?? 0) > 0;
  const lowStock = inStock && (selected?.stockQuantity ?? 0) <= 5;

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-(family-name:--font-jetbrains-mono) text-3xl font-bold text-[#FF5500]">
          {formatPrice(displayPrice, { compact: true })}
        </span>
        {comparePrice && comparePrice > displayPrice && (
          <span className="text-[#8E8E93] text-lg line-through font-(family-name:--font-jetbrains-mono)">
            {formatPrice(comparePrice, { compact: true })}
          </span>
        )}
      </div>

      {/* Variant buttons */}
      {variants.length > 1 && (
        <div>
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-2">Select Variant</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const label = [v.option1Value, v.option2Value].filter(Boolean).join(" · ") || "Default";
              const outOfStock = v.stockQuantity === 0;
              const isSelected = v.id === selectedId;
              return (
                <button
                  key={v.id}
                  onClick={() => !outOfStock && setSelectedId(v.id)}
                  disabled={outOfStock}
                  className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    outOfStock
                      ? "border-[#2C2C2E] text-[#8E8E93] cursor-not-allowed opacity-50"
                      : isSelected
                      ? "border-[#FF5500] text-[#FF5500] bg-[#FF5500]/10"
                      : "border-[#2C2C2E] text-[#F2F2F7] hover:border-[#FF5500]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {lowStock && (
        <p className="text-[#C0392B] text-sm font-medium animate-pulse">
          ⚡ Only {selected!.stockQuantity} left!
        </p>
      )}
      {!inStock && (
        <p className="text-[#C0392B] text-sm font-medium">Out of stock</p>
      )}

      <AddToCartButton variantId={selectedId} inStock={inStock} />
    </div>
  );
}
