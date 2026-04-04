import { prisma } from "@/lib/db";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category } = await searchParams;
  const query = q?.trim() ?? "";

  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const selectedCategory = categories.find((c) => c.slug === category);

  const products = query.length > 0
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { shortDesc: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
          ],
        },
        orderBy: { isFeatured: "desc" },
        take: 60,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: {
            where: { isActive: true },
            orderBy: { price: "asc" },
            take: 1,
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search header */}
        <div className="mb-8">
          <form method="GET" action="/search" className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products..."
                className="w-full bg-[#1C1C1E] border border-[#2C2C2E] text-[#F2F2F7] placeholder-[#8E8E93] rounded-lg pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                autoFocus
              />
            </div>
            {category && <input type="hidden" name="category" value={category} />}
            <button
              type="submit"
              className="bg-[#FF5500] text-white px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-[#CC4400] transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {query && (
            <p className="text-[#8E8E93] text-sm mt-3">
              <span className="text-[#F2F2F7] font-semibold">{products.length}</span>{" "}
              result{products.length !== 1 ? "s" : ""} for{" "}
              <span className="text-[#FF5500] font-semibold">&ldquo;{query}&rdquo;</span>
              {selectedCategory && (
                <span> in <span className="text-[#F2F2F7]">{selectedCategory.name}</span></span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar: category filter */}
          {query && (
            <aside className="w-full md:w-48 shrink-0">
              <p className="text-[#8E8E93] text-xs font-bold uppercase tracking-widest mb-3">
                Category
              </p>
              <div className="space-y-1">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category
                      ? "bg-[#FF5500] text-white font-semibold"
                      : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#1C1C1E]"
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/search?q=${encodeURIComponent(query)}&category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.slug
                        ? "bg-[#FF5500] text-white font-semibold"
                        : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#1C1C1E]"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </aside>
          )}

          {/* Results grid */}
          <div className="flex-1">
            {!query ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-[#2C2C2E] mx-auto mb-4" />
                <p className="text-[#8E8E93] text-lg font-medium">What are you looking for?</p>
                <p className="text-[#8E8E93] text-sm mt-1">Search for equipment, supplements, apparel and more</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-[#2C2C2E] mx-auto mb-4" />
                <p className="text-[#F2F2F7] text-lg font-semibold">No results found</p>
                <p className="text-[#8E8E93] text-sm mt-2">
                  Try different keywords or{" "}
                  <Link href="/products" className="text-[#FF5500] hover:underline">
                    browse all products
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const variant = product.variants[0];
                  const image = product.images[0]?.url ?? "/placeholder-product.jpg";
                  const avgRating =
                    product.reviews.length > 0
                      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
                      : 0;

                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      image={image}
                      price={variant ? Number(variant.price) : Number(product.basePrice)}
                      salePrice={
                        product.salePrice ? Number(product.salePrice) : undefined
                      }
                      rating={Math.round(avgRating * 10) / 10}
                      reviewCount={product.reviews.length}
                      stockQuantity={variant?.stockQuantity ?? 0}
                      isNew={product.isNew}
                      isFeatured={product.isFeatured}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
