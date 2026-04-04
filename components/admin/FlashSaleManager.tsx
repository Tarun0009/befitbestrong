"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Trash2, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Sale {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  saleEndsAt: string | null;
}

interface Props {
  initialSales: Sale[];
}

export default function FlashSaleManager({ initialSales }: Props) {
  const router = useRouter();
  const [sales, setSales] = useState(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: "", salePrice: "", saleEndsAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/flash-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: form.productId,
        salePrice: parseFloat(form.salePrice),
        saleEndsAt: new Date(form.saleEndsAt).toISOString(),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setForm({ productId: "", salePrice: "", saleEndsAt: "" });
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed");
    }
  }

  async function handleDelete(productId: string) {
    await fetch(`/api/admin/flash-sales?productId=${productId}`, { method: "DELETE" });
    setSales((prev) => prev.filter((s) => s.id !== productId));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Active sales */}
      {sales.length === 0 ? (
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-8 text-center">
          <Zap className="w-8 h-8 text-[#2C2C2E] mx-auto mb-2" />
          <p className="text-[#8E8E93] text-sm">No active flash sales</p>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden">
          {sales.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-4 px-5 py-4 ${i < sales.length - 1 ? "border-b border-[#2C2C2E]" : ""}`}>
              <Zap className="w-4 h-4 text-[#C0392B] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[#F2F2F7] text-sm font-medium truncate">{s.name}</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">
                  {s.salePrice ? formatPrice(s.salePrice, { compact: true }) : "—"}{" "}
                  <span className="line-through">{formatPrice(s.basePrice, { compact: true })}</span>
                  {" · "}
                  Ends {s.saleEndsAt ? new Date(s.saleEndsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-[#8E8E93] hover:text-[#C0392B] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form toggle */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-1.5 text-sm text-[#FF5500] hover:text-[#CC4400] font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Schedule Flash Sale
      </button>

      {showForm && (
        <div className="bg-[#1C1C1E] border border-[#FF5500]/30 rounded-xl p-5">
          <h3 className="text-[#F2F2F7] font-semibold mb-4 text-sm">New Flash Sale</h3>
          {error && (
            <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm px-4 py-2 rounded mb-3">{error}</div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">Product ID</label>
              <input
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                placeholder="Paste product UUID"
                required
                className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">Sale Price (₹)</label>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                placeholder="9999"
                required
                className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">Ends At</label>
              <input
                type="datetime-local"
                value={form.saleEndsAt}
                onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })}
                required
                className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest px-5 py-2.5 rounded text-sm transition-colors">
                {saving ? "Saving..." : "Create Sale"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
