"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu, X, Dumbbell } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "Equipment", href: "/products?category=equipment" },
  { name: "Supplements", href: "/products?category=supplements" },
  { name: "Apparel", href: "/products?category=apparel" },
  { name: "Recovery", href: "/products?category=recovery" },
  { name: "Programs", href: "/products?category=programs" },
];

export default function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1C1C1E]/95 backdrop-blur border-b border-[#2C2C2E]">
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
            <Link
              href="/search"
              className="p-2 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

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
