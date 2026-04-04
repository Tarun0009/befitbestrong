import { Suspense } from "react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import MobileFilters from "@/components/store/MobileFilters";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

// Placeholder products — will be replaced with DB query
const PRODUCTS = [
  {
    id: "1", name: "Olympic Barbell 20kg — Competition Grade", slug: "olympic-barbell-20kg",
    brand: "IronForge", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    price: 12999, salePrice: 9999, rating: 4.8, reviewCount: 234, stockQuantity: 15, isNew: false,
  },
  {
    id: "2", name: "Adjustable Dumbbell Set 5-25kg", slug: "adjustable-dumbbell-set",
    brand: "PowerFit", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    price: 8499, salePrice: undefined, rating: 4.6, reviewCount: 89, stockQuantity: 3, isNew: true,
  },
  {
    id: "3", name: "Whey Protein Isolate Chocolate 2kg", slug: "whey-protein-isolate-chocolate-2kg",
    brand: "MuscleTech", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    price: 4999, salePrice: 3799, rating: 4.9, reviewCount: 567, stockQuantity: 42, isNew: false,
  },
  {
    id: "4", name: "Power Cage Squat Rack — Heavy Duty", slug: "power-cage-squat-rack",
    brand: "BeastGear", image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=400&fit=crop",
    price: 34999, salePrice: 28999, rating: 4.7, reviewCount: 43, stockQuantity: 8, isNew: false,
  },
  {
    id: "5", name: "Resistance Band Set (5 Levels)", slug: "resistance-band-set",
    brand: "FlexPro", image: "https://images.unsplash.com/photo-1598289431512-b97b0917afb0?w=400&h=400&fit=crop",
    price: 1299, salePrice: 899, rating: 4.5, reviewCount: 312, stockQuantity: 85, isNew: false,
  },
  {
    id: "6", name: "Creatine Monohydrate Unflavored 500g", slug: "creatine-monohydrate-500g",
    brand: "NutriScience", image: "https://images.unsplash.com/photo-1559181567-c3190bfa4cfe?w=400&h=400&fit=crop",
    price: 1999, salePrice: undefined, rating: 4.8, reviewCount: 891, stockQuantity: 60, isNew: false,
  },
  {
    id: "7", name: "Adjustable Weight Bench — Multi-Position", slug: "adjustable-weight-bench",
    brand: "IronForge", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
    price: 15999, salePrice: 12499, rating: 4.6, reviewCount: 78, stockQuantity: 12, isNew: true,
  },
  {
    id: "8", name: "Pre-Workout Energy Formula 300g", slug: "pre-workout-energy-300g",
    brand: "MuscleTech", image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&h=400&fit=crop",
    price: 2499, salePrice: 1999, rating: 4.4, reviewCount: 445, stockQuantity: 35, isNew: false,
  },
];

const SORT_OPTIONS = [
  { label: "Best Selling", value: "bestselling" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Highest Rated", value: "rating" },
];

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Equipment", value: "equipment" },
  { label: "Supplements", value: "supplements" },
  { label: "Apparel", value: "apparel" },
  { label: "Recovery", value: "recovery" },
  { label: "Programs", value: "programs" },
];

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; q?: string };
}) {
  const { category = "", sort = "bestselling", q = "" } = searchParams;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
              {q ? `Search: "${q}"` : category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Products"}
            </h1>
            <p className="text-[#8E8E93] text-sm mt-1">{PRODUCTS.length} products</p>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              defaultValue={sort}
              className="appearance-none bg-[#1C1C1E] border border-[#2C2C2E] text-[#F2F2F7] text-sm rounded px-4 py-2.5 pr-8 focus:outline-none focus:border-[#FF5500] cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
          </div>
        </div>

        {/* Mobile Filters button — only visible below lg */}
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
                  {CATEGORIES.map((cat) => (
                    <a
                      key={cat.value}
                      href={`/products${cat.value ? `?category=${cat.value}` : ""}`}
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        category === cat.value
                          ? "bg-[#FF5500]/10 text-[#FF5500] font-medium"
                          : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#2C2C2E]"
                      }`}
                    >
                      {cat.label}
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
                  {[
                    { label: "Under ₹1,000", value: "0-1000" },
                    { label: "₹1,000 – ₹5,000", value: "1000-5000" },
                    { label: "₹5,000 – ₹15,000", value: "5000-15000" },
                    { label: "₹15,000+", value: "15000+" },
                  ].map((r) => (
                    <label key={r.value} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="accent-[#FF5500] w-3.5 h-3.5"
                      />
                      <span className="text-[#8E8E93] text-sm group-hover:text-[#F2F2F7] transition-colors">
                        {r.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock Only */}
              <div>
                <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#FF5500] w-3.5 h-3.5" />
                  <span className="text-[#8E8E93] text-sm hover:text-[#F2F2F7] transition-colors">
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <Suspense fallback={<ProductGridSkeleton />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {PRODUCTS.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </Suspense>
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
