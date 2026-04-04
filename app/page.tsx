import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck, Star } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import FlashSaleBanner from "@/components/store/FlashSaleBanner";

// ─── Static category data ───────────────────────────────
const categories = [
  { name: "Barbells & Plates", slug: "barbells", icon: "🏋️", count: 48 },
  { name: "Dumbbells", slug: "dumbbells", icon: "💪", count: 32 },
  { name: "Supplements", slug: "supplements", icon: "🥛", count: 120 },
  { name: "Cardio", slug: "cardio", icon: "🏃", count: 24 },
  { name: "Racks & Benches", slug: "racks", icon: "🔧", count: 18 },
  { name: "Apparel", slug: "apparel", icon: "👕", count: 65 },
  { name: "Recovery", slug: "recovery", icon: "🧘", count: 29 },
  { name: "Programs", slug: "programs", icon: "📋", count: 15 },
];

// ─── Placeholder featured products (replace with DB query later) ─
const featuredProducts = [
  {
    id: "1",
    name: "Olympic Barbell 20kg — Competition Grade",
    slug: "olympic-barbell-20kg",
    brand: "IronForge",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    price: 12999,
    salePrice: 9999,
    rating: 4.8,
    reviewCount: 234,
    stockQuantity: 15,
    isNew: false,
  },
  {
    id: "2",
    name: "Adjustable Dumbbell Set 5-25kg",
    slug: "adjustable-dumbbell-set",
    brand: "PowerFit",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    price: 8499,
    salePrice: undefined,
    rating: 4.6,
    reviewCount: 89,
    stockQuantity: 3,
    isNew: true,
  },
  {
    id: "3",
    name: "Whey Protein Isolate — Chocolate Fudge 2kg",
    slug: "whey-protein-isolate-chocolate-2kg",
    brand: "MuscleTech",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    price: 4999,
    salePrice: 3799,
    rating: 4.9,
    reviewCount: 567,
    stockQuantity: 42,
    isNew: false,
  },
  {
    id: "4",
    name: "Power Cage Squat Rack — Heavy Duty",
    slug: "power-cage-squat-rack",
    brand: "BeastGear",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=400&fit=crop",
    price: 34999,
    salePrice: 28999,
    rating: 4.7,
    reviewCount: 43,
    stockQuantity: 8,
    isNew: false,
  },
];

const trustBadges = [
  { icon: Truck, label: "Free Shipping", sub: "On orders above ₹2,999" },
  { icon: Shield, label: "30-Day Returns", sub: "Hassle-free returns" },
  { icon: Zap, label: "Express Delivery", sub: "2-3 days across India" },
  { icon: Star, label: "Expert Curated", sub: "Vetted by certified trainers" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
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
                Expert-curated gym equipment, supplements & apparel.
                Everything a serious athlete needs — in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-8 py-4 rounded transition-colors flex items-center gap-2"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/gym-builder"
                  className="border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest px-8 py-4 rounded transition-colors"
                >
                  Build My Gym
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-[#2C2C2E]">
                {[
                  { value: "10,000+", label: "Products" },
                  { value: "50,000+", label: "Happy Athletes" },
                  { value: "4.8★", label: "Avg Rating" },
                  { value: "Pan India", label: "Delivery" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-(family-name:--font-bebas-neue) text-3xl text-[#FF5500]">
                      {stat.value}
                    </div>
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

        {/* ── Category Grid ── */}
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
                <span className="text-4xl">{cat.icon}</span>
                <div>
                  <p className="text-[#F2F2F7] font-semibold text-sm">{cat.name}</p>
                  <p className="text-[#8E8E93] text-xs mt-0.5">{cat.count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Products ── */}
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
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

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
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section className="bg-[#1C1C1E] border-y border-[#2C2C2E] py-4 overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap text-[#8E8E93] text-sm">
            {Array(3).fill([
              "🏋️ 1,247 orders shipped today",
              "⭐ 4.8 average rating from 50,000+ reviews",
              "💪 Trusted by 50,000+ athletes across India",
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
