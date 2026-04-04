import { Suspense } from "react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import MobileFilters from "@/components/store/MobileFilters";
import SortSelect from "@/components/store/SortSelect";
import { SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Gym Equipment & Supplements",
  description:
    "Browse premium gym equipment, protein supplements, apparel and workout programs.",
};

const PRICE_RANGES = [
  { label: "Under ₹1,000", value: "0-1000" },
  { label: "₹1,000 – ₹5,000", value: "1000-5000" },
  { label: "₹5,000 – ₹15,000", value: "5000-15000" },
  { label: "₹15,000+", value: "15000+" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; sort?: string; q?: string; price?: string }>;
}) {
  const { category = "", brand = "", sort = "bestselling", q = "", price = "" } = await searchParams;

  // Build where clause
  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDesc: { contains: q, mode: "insensitive" } },
    ];
  }
  if (price) {
    const [min, max] = price.split("-");
    if (max) {
      where.basePrice = { gte: parseInt(min), lte: parseInt(max) };
    } else {
      where.basePrice = { gte: parseInt(min) };
    }
  }

  // Build orderBy
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { basePrice: "asc" };
  if (sort === "price-desc") orderBy = { basePrice: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: 48,
      include: {
        brand: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: {
          where: { isActive: true },
          take: 1,
          orderBy: { price: "asc" },
          select: { price: true, stockQuantity: true },
        },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  const mappedProducts = products.map((p) => {
    const variant = p.variants[0];
    const image = p.images[0]?.url ?? "/placeholder-product.jpg";
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand?.name,
      image,
      price: variant ? Number(variant.price) : Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      stockQuantity: variant?.stockQuantity ?? 0,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
    };
  });

  const heading = q
    ? `Search: "${q}"`
    : category
    ? categories.find((c) => c.slug === category)?.name ?? category
    : "All Products";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
              {heading}
            </h1>
            <p className="text-[#8E8E93] text-sm mt-1">{mappedProducts.length} products</p>
          </div>

          {/* Sort */}
          <SortSelect currentSort={sort} />
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden mb-4">
          <MobileFilters category={category} />
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Category filter */}
              <div>
                <h3 className="text-[#F2F2F7] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5500]" />
                  Category
                </h3>
                <div className="space-y-1">
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded text-sm transition-colors ${
                      !category ? "bg-[#FF5500]/10 text-[#FF5500] font-medium" : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#2C2C2E]"
                    }`}
                  >
                    All
                  </a>
                  {categories.map((cat) => (
                    <a
                      key={cat.slug}
                      href={`/products?category=${cat.slug}${sort !== "bestselling" ? `&sort=${sort}` : ""}`}
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        category === cat.slug
                          ? "bg-[#FF5500]/10 text-[#FF5500] font-medium"
                          : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#2C2C2E]"
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-[#F2F2F7] font-bold text-xs uppercase tracking-widest mb-3">
                  Price Range
                </h3>
                <div className="space-y-1">
                  {PRICE_RANGES.map((r) => (
                    <a
                      key={r.value}
                      href={`/products?${category ? `category=${category}&` : ""}price=${r.value}`}
                      className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                        price === r.value
                          ? "text-[#FF5500] font-medium"
                          : "text-[#8E8E93] hover:text-[#F2F2F7]"
                      }`}
                    >
                      {r.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {mappedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#8E8E93] text-lg mb-4">No products found</p>
                <a href="/products" className="text-[#FF5500] hover:text-[#CC4400] text-sm transition-colors">
                  Clear filters
                </a>
              </div>
            ) : (
              <Suspense fallback={<ProductGridSkeleton />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {mappedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </Suspense>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="card-dark animate-pulse">
          <div className="aspect-square bg-[#2C2C2E]" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-[#2C2C2E] rounded w-1/3" />
            <div className="h-4 bg-[#2C2C2E] rounded w-3/4" />
            <div className="h-4 bg-[#2C2C2E] rounded w-1/2" />
            <div className="h-10 bg-[#2C2C2E] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
