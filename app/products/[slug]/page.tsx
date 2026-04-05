import { prisma } from "@/lib/db";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ReviewSection from "@/components/store/ReviewSection";
import VariantSelector from "@/components/store/VariantSelector";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Star, Truck, RotateCcw, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug },
    select: { name: true, shortDesc: true, seoTitle: true, seoDescription: true },
  });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDesc,
  };
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
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

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
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

            {/* Variant selector — handles price, selection state, stock, add to cart */}
            <VariantSelector
              variants={product.variants.map((v) => ({
                id: v.id,
                option1Value: v.option1Value,
                option2Value: v.option2Value,
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                stockQuantity: v.stockQuantity,
                sku: v.sku,
              }))}
              basePrice={Number(product.basePrice)}
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
