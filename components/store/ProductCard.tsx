"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  image: string;
  price: number;
  salePrice?: number;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export default function ProductCard({
  name,
  slug,
  brand,
  image,
  price,
  salePrice,
  rating = 0,
  reviewCount = 0,
  stockQuantity = 0,
  isNew = false,
}: ProductCardProps) {
  const discountPct = salePrice ? getDiscountPercentage(price, salePrice) : 0;
  const displayPrice = salePrice ?? price;
  const inStock = stockQuantity > 0;
  const lowStock = stockQuantity > 0 && stockQuantity <= 5;

  return (
    <div className="card-dark group relative flex flex-col overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discountPct > 0 && (
          <span className="badge-orange">{discountPct}% OFF</span>
        )}
        {isNew && <span className="badge-green">NEW</span>}
        {lowStock && (
          <span className="bg-[#C0392B] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
            Only {stockQuantity} left
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        className="absolute top-3 right-3 z-10 p-1.5 bg-[#2C2C2E]/80 rounded-full text-[#8E8E93] hover:text-[#FF5500] transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Add to wishlist"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Image */}
      <Link href={`/products/${slug}`} className="block aspect-square bg-[#2C2C2E] overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
          }}
        />
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {brand && (
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-medium">
            {brand}
          </p>
        )}

        <Link href={`/products/${slug}`}>
          <h3 className="text-[#F2F2F7] font-semibold text-sm leading-tight hover:text-[#FF5500] transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#FF5500] text-[#FF5500]" />
            <span className="text-[#F2F2F7] text-xs font-medium">{rating.toFixed(1)}</span>
            <span className="text-[#8E8E93] text-xs">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="price-tag text-lg">{formatPrice(displayPrice, { compact: true })}</span>
          {salePrice && (
            <span className="price-original text-sm">{formatPrice(price, { compact: true })}</span>
          )}
        </div>

        {/* Stock status */}
        {!inStock && (
          <p className="text-[#C0392B] text-xs font-medium">Out of Stock</p>
        )}

        {/* Add to Cart */}
        <button
          disabled={!inStock}
          className="mt-2 w-full py-2.5 text-sm font-bold uppercase tracking-widest rounded transition-colors
            disabled:bg-[#2C2C2E] disabled:text-[#8E8E93] disabled:cursor-not-allowed
            enabled:bg-[#FF5500] enabled:text-white enabled:hover:bg-[#CC4400]
            flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
