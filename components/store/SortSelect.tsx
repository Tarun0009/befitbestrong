"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Best Selling", value: "bestselling" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={handleChange}
        className="appearance-none bg-[#1C1C1E] border border-[#2C2C2E] text-[#F2F2F7] text-sm rounded px-4 py-2.5 pr-8 focus:outline-none focus:border-[#FF5500] cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
    </div>
  );
}
