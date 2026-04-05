export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck, Star } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import FlashSaleBanner from "@/components/store/FlashSaleBanner";
import NewsletterSection from "@/components/store/NewsletterSection";
import { prisma } from "@/lib/db";

// Emoji fallback map for category slugs
const CATEGORY_ICONS: Record<string, string> = {
  barbells: "🏋️", dumbbells: "💪", supplements: "🥛", cardio: "🏃",
  racks: "🔧", apparel: "👕", recovery: "🧘", programs: "📋",
  equipment: "⚙️", accessories: "🎽", nutrition: "🍎",
};

const trustBadges = [
  { icon: Truck, label: "Free Shipping", sub: "On orders above ₹2,999" },
  { icon: Shield, label: "30-Day Returns", sub: "Hassle-free returns" },
  { icon: Zap, label: "Express Delivery", sub: "2-3 days across India" },
  { icon: Star, label: "Expert Curated", sub: "Vetted by certified trainers" },
];

const LOYALTY_TIERS = [
  {
    tier: "IRON", icon: "⚔️", color: "#8E8E93", border: "border-[#2C2C2E]",
    points: "0 – 999 pts",
    perks: ["1 point per ₹10 spent", "Birthday bonus points", "Member-only sales"],
  },
  {
    tier: "STEEL", icon: "🛡️", color: "#3B82F6", border: "border-blue-500/30",
    points: "1,000 – 4,999 pts",
    perks: ["1.5× point multiplier", "Priority support", "Early access to new drops"],
  },
  {
    tier: "TITANIUM", icon: "👑", color: "#FF5500", border: "border-[#FF5500]/40",
    points: "5,000+ pts",
    perks: ["2× point multiplier", "Free shipping always", "Exclusive member bundles"],
  },
];

// Shared product mapping helper
function mapProduct(p: {
  id: string; name: string; slug: string; basePrice: unknown; salePrice: unknown | null;
  isNew: boolean; isFeatured: boolean;
  brand: { name: string } | null;
  images: { url: string }[];
  variants: { price: unknown; stockQuantity: number }[];
  _avg?: { rating: number | null };
  _count?: { reviews: number };
}) {
  const variant = p.variants[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand?.name,
    image: p.images[0]?.url ?? "/placeholder-product.jpg",
    price: variant ? Number(variant.price) : Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    stockQuantity: variant?.stockQuantity ?? 0,
    rating: p._avg?.rating ?? undefined,
    reviewCount: p._count?.reviews ?? undefined,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
  };
}

// Common product include/select shape
const productSelect = {
  id: true, name: true, slug: true, basePrice: true, salePrice: true, isNew: true, isFeatured: true,
  brand: { select: { name: true } },
  images: { take: 1, orderBy: { sortOrder: "asc" as const } },
  variants: {
    where: { isActive: true },
    take: 1,
    orderBy: { price: "asc" as const },
    select: { price: true, stockQuantity: true },
  },
};

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals, saleProducts, brands, topReviews, stats] =
    await Promise.all([
      // Top-level categories
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        take: 8,
        select: {
          name: true, slug: true, imageUrl: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
      }),

      // Admin-curated bestsellers
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 4,
        orderBy: { updatedAt: "desc" },
        select: productSelect,
      }),

      // New arrivals
      prisma.product.findMany({
        where: { isNew: true, isActive: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        select: productSelect,
      }),

      // On-sale products
      prisma.product.findMany({
        where: { salePrice: { not: null }, isActive: true },
        take: 4,
        orderBy: { updatedAt: "desc" },
        select: productSelect,
      }),

      // Active brands
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        take: 10,
        select: { name: true, slug: true, logoUrl: true },
      }),

      // Top customer reviews (testimonials)
      prisma.review.findMany({
        where: { isApproved: true, rating: { gte: 4 }, body: { not: null } },
        take: 3,
        orderBy: { helpfulCount: "desc" },
        select: {
          rating: true, title: true, body: true, verifiedPurchase: true,
          user: { select: { name: true } },
          product: { select: { name: true, slug: true } },
        },
      }),

      // Aggregate stats
      Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.review.aggregate({ where: { isApproved: true }, _avg: { rating: true }, _count: true }),
      ]),
    ]);

  const [productCount, customerCount, reviewStats] = stats;
  const avgRating = reviewStats._avg.rating ? reviewStats._avg.rating.toFixed(1) : "4.8";

  const mappedFeatured = featuredProducts.map(mapProduct);
  const mappedNew = newArrivals.map(mapProduct);
  const mappedSale = saleProducts.map(mapProduct);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative bg-[#0A0A0A] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.15),transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-[#FF5500] rounded-full animate-pulse" />
                <span className="text-[#FF5500] text-sm font-medium">
                  India&apos;s Premium Gym Store
                </span>
              </div>

              <h1 className="font-(family-name:--font-bebas-neue) text-6xl md:text-8xl text-[#F2F2F7] leading-none tracking-wide mb-6">
                FORGED FOR
                <br />
                <span className="text-[#FF5500]">PERFORMANCE</span>
              </h1>

              <p className="text-[#8E8E93] text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Expert-curated gym equipment, supplements &amp; apparel.
                Everything a serious athlete needs — in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-8 py-4 rounded transition-colors flex items-center gap-2"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/gym-builder"
                  className="border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest px-8 py-4 rounded transition-colors"
                >
                  Build My Gym
                </Link>
              </div>

              {/* Live Stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-[#2C2C2E]">
                {[
                  { value: `${productCount.toLocaleString("en-IN")}+`, label: "Products" },
                  { value: `${customerCount.toLocaleString("en-IN")}+`, label: "Happy Athletes" },
                  { value: `${avgRating}★`, label: "Avg Rating" },
                  { value: "Pan India", label: "Delivery" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-(family-name:--font-bebas-neue) text-3xl text-[#FF5500]">{stat.value}</div>
                    <div className="text-[#8E8E93] text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Badges ── */}
        <section className="bg-[#1C1C1E] border-y border-[#2C2C2E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#FF5500] shrink-0" />
                  <div>
                    <p className="text-[#F2F2F7] font-semibold text-sm">{label}</p>
                    <p className="text-[#8E8E93] text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Flash Sale Banner ── */}
        <FlashSaleBanner />

        {/* ── On Sale Now ── */}
        {mappedSale.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/20">
                    Limited Time
                  </span>
                </div>
                <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
                  On Sale Now
                </h2>
                <p className="text-[#8E8E93] text-sm mt-1">Grab these deals before they&apos;re gone</p>
              </div>
              <Link
                href="/products?sort=sale"
                className="text-[#FF5500] text-sm font-medium hover:text-[#CC4400] transition-colors flex items-center gap-1"
              >
                All Deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mappedSale.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}

        {/* ── Category Grid ── */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
                Shop by Category
              </h2>
              <Link
                href="/products"
                className="text-[#FF5500] text-sm font-medium hover:text-[#CC4400] transition-colors flex items-center gap-1"
              >
                All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="card-dark p-5 flex flex-col items-center text-center gap-3 hover:border-[#FF5500]/40 transition-all"
                >
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <span className="text-4xl">{CATEGORY_ICONS[cat.slug] ?? "🏪"}</span>
                  )}
                  <div>
                    <p className="text-[#F2F2F7] font-semibold text-sm">{cat.name}</p>
                    <p className="text-[#8E8E93] text-xs mt-0.5">{cat._count.products} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Bestsellers ── */}
        {mappedFeatured.length > 0 && (
          <section className="bg-[#1C1C1E]/50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
                    Bestsellers
                  </h2>
                  <p className="text-[#8E8E93] text-sm mt-1">Most loved by our athletes</p>
                </div>
                <Link
                  href="/products?sort=bestselling"
                  className="text-[#FF5500] text-sm font-medium hover:text-[#CC4400] transition-colors flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mappedFeatured.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── New Arrivals ── */}
        {mappedNew.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#FF5500]/20">
                    Just Dropped
                  </span>
                </div>
                <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
                  New Arrivals
                </h2>
                <p className="text-[#8E8E93] text-sm mt-1">Fresh gear, just landed</p>
              </div>
              <Link
                href="/products?sort=newest"
                className="text-[#FF5500] text-sm font-medium hover:text-[#CC4400] transition-colors flex items-center gap-1"
              >
                See All New <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mappedNew.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}

        {/* ── Brands ── */}
        {brands.length > 0 && (
          <section className="border-y border-[#2C2C2E] py-8 bg-[#1C1C1E]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-6">
                Top Brands
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/products?brand=${brand.slug}`}
                    className="opacity-40 hover:opacity-100 transition-opacity"
                  >
                    {brand.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brand.logoUrl} alt={brand.name} className="h-7 object-contain" />
                    ) : (
                      <span className="text-[#8E8E93] font-bold text-sm uppercase tracking-widest">
                        {brand.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── AI Gym Builder CTA ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,85,0,0.1),transparent_60%)]" />
            <div className="relative z-10 max-w-2xl">
              <span className="badge-orange mb-4 inline-block">AI-Powered</span>
              <h2 className="font-(family-name:--font-bebas-neue) text-5xl md:text-6xl text-[#F2F2F7] tracking-wide mb-4">
                BUILD YOUR
                <br />
                <span className="text-[#FF5500]">PERFECT GYM</span>
              </h2>
              <p className="text-[#8E8E93] text-lg mb-8">
                Tell us your space, budget, and fitness goals — our AI Gym Builder
                creates the exact equipment list you need.
              </p>
              <Link
                href="/gym-builder"
                className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-8 py-4 rounded transition-colors"
              >
                Start Building <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Loyalty Program Promo ── */}
        <section className="bg-[#1C1C1E]/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="badge-orange">Exclusive Rewards</span>
              <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mt-3">
                The Iron Loyalty Program
              </h2>
              <p className="text-[#8E8E93] mt-2 max-w-md mx-auto text-sm">
                Every purchase earns you Iron Points. Climb the tiers, unlock better rewards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {LOYALTY_TIERS.map((t) => (
                <div
                  key={t.tier}
                  className={`bg-[#1C1C1E] border ${t.border} rounded-2xl p-6 text-center`}
                >
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <p
                    className="font-(family-name:--font-bebas-neue) text-2xl tracking-wide mb-1"
                    style={{ color: t.color }}
                  >
                    {t.tier}
                  </p>
                  <p className="text-[#8E8E93] text-xs mb-5">{t.points}</p>
                  <ul className="space-y-2 text-left">
                    {t.perks.map((perk) => (
                      <li key={perk} className="text-[#F2F2F7] text-sm flex items-start gap-2">
                        <span className="text-[#FF5500] shrink-0">✓</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-8 py-4 rounded transition-colors"
              >
                Join Free &amp; Start Earning <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[#8E8E93] text-xs mt-3">Already a member? <Link href="/account" className="text-[#FF5500] hover:underline">View your points</Link></p>
            </div>
          </div>
        </section>

        {/* ── Customer Testimonials ── */}
        {topReviews.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-10">
              <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
                What Athletes Say
              </h2>
              <p className="text-[#8E8E93] mt-2 text-sm">
                {avgRating}★ average from {reviewStats._count.toLocaleString("en-IN")}+ verified reviews
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topReviews.map((rev, i) => (
                <div key={i} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: rev.rating }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-[#FF5500] fill-[#FF5500]" />
                    ))}
                    {Array.from({ length: 5 - rev.rating }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-[#2C2C2E]" />
                    ))}
                  </div>

                  {rev.title && (
                    <p className="text-[#F2F2F7] font-semibold text-sm mb-2">{rev.title}</p>
                  )}
                  <p className="text-[#8E8E93] text-sm leading-relaxed line-clamp-4 flex-1">
                    {rev.body}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2C2C2E]">
                    <div>
                      <p className="text-[#F2F2F7] text-xs font-semibold">
                        {rev.user.name ?? "Athlete"}
                      </p>
                      {rev.verifiedPurchase && (
                        <p className="text-green-400 text-xs mt-0.5">✓ Verified Purchase</p>
                      )}
                    </div>
                    <Link
                      href={`/products/${rev.product.slug}`}
                      className="text-[#8E8E93] text-xs hover:text-[#FF5500] transition-colors text-right max-w-[120px] truncate"
                    >
                      {rev.product.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Newsletter ── */}
        <NewsletterSection />

        {/* ── Marquee ── */}
        <section className="bg-[#1C1C1E] border-y border-[#2C2C2E] py-4 overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap text-[#8E8E93] text-sm">
            {Array(3).fill([
              `🏋️ ${productCount.toLocaleString("en-IN")}+ products in stock`,
              `⭐ ${avgRating} average rating from ${reviewStats._count.toLocaleString("en-IN")}+ reviews`,
              `💪 Trusted by ${customerCount.toLocaleString("en-IN")}+ athletes across India`,
              "🚚 Free shipping on orders above ₹2,999",
              "🔥 New arrivals every week",
            ]).flat().map((text, i) => (
              <span key={i} className="shrink-0">{text}</span>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
