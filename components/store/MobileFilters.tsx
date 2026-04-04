"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Equipment", value: "equipment" },
  { label: "Supplements", value: "supplements" },
  { label: "Apparel", value: "apparel" },
  { label: "Recovery", value: "recovery" },
  { label: "Programs", value: "programs" },
];

const PRICE_RANGES = [
  { label: "Under ₹1,000", value: "0-1000" },
  { label: "₹1,000 – ₹5,000", value: "1000-5000" },
  { label: "₹5,000 – ₹15,000", value: "5000-15000" },
  { label: "₹15,000+", value: "15000+" },
];

interface MobileFiltersProps {
  category: string;
}

export default function MobileFilters({ category }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button — only visible below lg */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#FF5500]/40 rounded-lg text-[#8E8E93] hover:text-[#F2F2F7] text-sm font-medium transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#FF5500]" />
        Filters
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-up panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] border-t border-[#2C2C2E] rounded-t-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2C2C2E]">
          <h2 className="font-(family-name:--font-bebas-neue) text-xl text-[#F2F2F7] tracking-wide">Filters</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-[#8E8E93] hover:text-[#FF5500] transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6 overflow-y-auto max-h-96">
          {/* Category */}
          <div>
            <h3 className="text-[#F2F2F7] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5500]" />
              Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.value}
                  href={`/products${cat.value ? `?category=${cat.value}` : ""}`}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    category === cat.value
                      ? "bg-[#FF5500]/10 text-[#FF5500] font-medium border border-[#FF5500]/30"
                      : "bg-[#2C2C2E] text-[#8E8E93] hover:text-[#F2F2F7]"
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
              {PRICE_RANGES.map((r) => (
                <label key={r.value} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer group">
                  <input type="checkbox" className="accent-[#FF5500] w-3.5 h-3.5" />
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

        {/* Apply button */}
        <div className="px-5 py-4 border-t border-[#2C2C2E]">
          <button
            onClick={() => setOpen(false)}
            className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
