"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InventoryAdjust({ variantId, currentStock }: { variantId: string; currentStock: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(value);
    if (isNaN(qty)) return;
    setLoading(true);
    await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, quantityChange: qty, reason }),
    });
    setLoading(false);
    setOpen(false);
    setValue("");
    setReason("");
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="text-xs text-[#FF5500] hover:text-[#CC4400] font-medium transition-colors">
        Adjust
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+5 / -2"
        className="w-16 bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded px-2 py-1 text-xs outline-none"
        autoFocus
      />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="reason"
        className="w-24 bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded px-2 py-1 text-xs outline-none"
      />
      <button type="submit" disabled={loading}
        className="text-xs bg-[#FF5500] text-white px-2 py-1 rounded disabled:opacity-60">
        {loading ? "..." : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)}
        className="text-xs text-[#8E8E93] hover:text-[#F2F2F7]">
        ✕
      </button>
    </form>
  );
}
