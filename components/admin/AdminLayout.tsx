"use client";

import Link from "next/link";
import { Dumbbell, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Marketing", href: "/admin/marketing" },
  { label: "Analytics", href: "/admin/analytics" },
];

interface AdminLayoutProps {
  activeHref: string;
  children: React.ReactNode;
}

export default function AdminLayout({ activeHref, children }: AdminLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-56 bg-[#1C1C1E] border-r border-[#2C2C2E] flex-col shrink-0">
        <div className="p-5 border-b border-[#2C2C2E]">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#FF5500]" />
            <span className="font-(family-name:--font-bebas-neue) text-xl tracking-wider text-[#F2F2F7]">
              BFBS Admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.href === activeHref
                  ? "bg-[#2C2C2E] text-[#F2F2F7]"
                  : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#2C2C2E]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#2C2C2E]">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#8E8E93] hover:text-[#FF5500] transition-colors"
          >
            ← View Store
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar — visible only on mobile */}
      <div className="md:hidden flex flex-col">
        <div className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#FF5500]" />
            <span className="font-(family-name:--font-bebas-neue) text-xl tracking-wider text-[#F2F2F7]">
              BFBS Admin
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
            aria-label="Toggle admin menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Slide-down Nav */}
        {menuOpen && (
          <div className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 py-3 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  item.href === activeHref
                    ? "bg-[#2C2C2E] text-[#F2F2F7]"
                    : "text-[#8E8E93] hover:text-[#F2F2F7] hover:bg-[#2C2C2E]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm text-[#8E8E93] hover:text-[#FF5500] transition-colors mt-1 border-t border-[#2C2C2E] pt-3"
            >
              ← View Store
            </Link>
          </div>
        )}
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
