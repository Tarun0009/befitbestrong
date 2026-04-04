import { prisma } from "@/lib/db";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import AddToCartButton from "@/components/store/AddToCartButton";
import ReviewSection from "@/components/store/ReviewSection";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Star, Truck, RotateCcw, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const firstVariant = product.variants[0];
  const displayPrice = firstVariant ? Number(firstVariant.price) : Number(product.salePrice ?? product.basePrice);
  const comparePrice = firstVariant?.compareAtPrice ? Number(firstVariant.compareAtPrice) : Number(product.basePrice);
  const discount = displayPrice < comparePrice ? getDiscountPercentage(comparePrice, displayPrice) : 0;

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#8E8E93] mb-8">
          <Link href="/" className="hover:text-[#FF5500] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-[#FF5500] transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#FF5500] transition-colors">
            {product.category.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#F2F2F7] truncate max-w-50">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-[#1C1C1E] rounded-xl overflow-hidden border border-[#2C2C2E]">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText ?? product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8E8E93]">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <div key={img.id} className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                    i === 0 ? "border-[#FF5500]" : "border-[#2C2C2E] hover:border-[#FF5500]/50"
                  }`}>
                    <Image src={img.url} alt={img.altText ?? `${product.name} view ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-[#FF5500] text-sm font-bold uppercase tracking-widest mb-1">{product.brand.name}</p>
              )}
              <h1 className="text-[#F2F2F7] text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
              {firstVariant && <p className="text-[#8E8E93] text-xs mt-2">SKU: {firstVariant.sku}</p>}
            </div>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "fill-[#FF5500] text-[#FF5500]" : "fill-[#2C2C2E] text-[#2C2C2E]"}`} />
                  ))}
                </div>
                <span className="text-[#F2F2F7] text-sm font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-[#8E8E93] text-sm">({product.reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="price-tag text-4xl">{formatPrice(displayPrice, { compact: true })}</span>
              {discount > 0 && (
                <>
                  <span className="price-original text-xl">{formatPrice(comparePrice, { compact: true })}</span>
                  <span className="badge-orange">{discount}% OFF</span>
                </>
              )}
            </div>

            <p className="text-[#8E8E93] text-sm">
              or 3× <span className="text-[#F2F2F7] font-medium">{formatPrice(Math.round(displayPrice / 3), { compact: true })}</span>{" "}
              with EMI | No-cost EMI available
            </p>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-2">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button key={v.id} disabled={v.stockQuantity === 0}
                      className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                        v.stockQuantity === 0
                          ? "border-[#2C2C2E] text-[#8E8E93] cursor-not-allowed opacity-50"
                          : "border-[#2C2C2E] text-[#F2F2F7] hover:border-[#FF5500]"
                      }`}>
                      {[v.option1Value, v.option2Value].filter(Boolean).join(" · ") || "Default"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {totalStock > 0 && totalStock <= 5 && (
              <p className="text-[#C0392B] text-sm font-medium animate-pulse">⚡ Only {totalStock} left!</p>
            )}
            {totalStock === 0 && (
              <p className="text-[#C0392B] text-sm font-medium">Out of stock</p>
            )}

            {/* Add to Cart */}
            <AddToCartButton
              productId={product.id}
              variantId={firstVariant?.id ?? ""}
              inStock={totalStock > 0}
            />

            {/* Trust icons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2C2C2E]">
              {[
                { icon: Truck, label: "Free delivery", sub: "Above ₹2,999" },
                { icon: RotateCcw, label: "30-day returns", sub: "Easy returns" },
                { icon: Shield, label: "2yr warranty", sub: "Manufacturer" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-3 bg-[#1C1C1E] rounded-lg">
                  <Icon className="w-5 h-5 text-[#FF5500]" />
                  <p className="text-[#F2F2F7] text-xs font-semibold">{label}</p>
                  <p className="text-[#8E8E93] text-[11px]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Reviews */}
        <div className="mt-16 border-t border-[#2C2C2E] pt-10 space-y-12 max-w-3xl">
          {product.description && (
            <div>
              <h2 className="text-[#F2F2F7] font-bold text-lg mb-4">Description</h2>
              <p className="text-[#8E8E93] leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection productId={product.id} initialReviews={product.reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            verifiedPurchase: r.verifiedPurchase,
            createdAt: r.createdAt.toISOString(),
            user: { name: r.user.name },
          }))} avgRating={avgRating} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
