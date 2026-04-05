"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu, X, Dumbbell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/Providers";

const categories = [
  { name: "Equipment", href: "/products?category=equipment" },
  { name: "Supplements", href: "/products?category=supplements" },
  { name: "Apparel", href: "/products?category=apparel" },
  { name: "Recovery", href: "/products?category=recovery" },
  { name: "Programs", href: "/products?category=programs" },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1C1C1E]/95 backdrop-blur border-b border-[#2C2C2E]">
      {/* Expandable search bar */}
      {searchOpen && (
        <div className="border-b border-[#2C2C2E] bg-[#1C1C1E] px-4 py-2">
          <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#8E8E93] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="flex-1 bg-transparent text-[#F2F2F7] placeholder-[#8E8E93] text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="p-1 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Dumbbell className="w-6 h-6 text-[#FF5500]" />
            <span className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wider">
              BeFitBeStrong
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="text-[#8E8E93] hover:text-[#FF5500] text-sm font-medium transition-colors uppercase tracking-wide"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/gym-builder"
              className="bg-[#FF5500] text-white text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded hover:bg-[#CC4400] transition-colors"
            >
              Gym Builder
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`p-2 transition-colors ${searchOpen ? "text-[#FF5500]" : "text-[#8E8E93] hover:text-[#FF5500]"}`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/account"
              className="p-2 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5500] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1C1C1E] border-t border-[#2C2C2E] px-4 py-4 flex flex-col gap-3">
          {/* Mobile search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              if (q) {
                router.push(`/search?q=${encodeURIComponent(q)}`);
                setMenuOpen(false);
                setSearchQuery("");
              }
            }}
            className="flex items-center gap-2 bg-[#2C2C2E] rounded-lg px-3 py-2 mb-1"
          >
            <Search className="w-4 h-4 text-[#8E8E93] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-[#F2F2F7] placeholder-[#8E8E93] text-sm focus:outline-none"
            />
          </form>

          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="text-[#8E8E93] hover:text-[#FF5500] py-2 text-sm font-medium uppercase tracking-wide border-b border-[#2C2C2E]"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/gym-builder"
            className="bg-[#FF5500] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded text-center hover:bg-[#CC4400] transition-colors mt-2"
            onClick={() => setMenuOpen(false)}
          >
            Gym Builder
          </Link>
        </div>
      )}
    </header>
  );
}
