"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const inputCls = "w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-3 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors";
const labelCls = "block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5";

export default function NewCouponPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value) || 0,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
      validTo: validTo ? new Date(validTo).toISOString() : undefined,
      isActive,
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create coupon"); return; }
      router.push("/admin/marketing");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout activeHref="/admin/marketing">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4 flex items-center gap-3">
        <Link href="/admin/marketing" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Create Coupon</h1>
          <p className="text-[#8E8E93] text-xs">Add a new discount coupon code</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">Coupon Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Coupon Code *</label>
              <input
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className={`${inputCls} font-mono uppercase`}
              />
              <p className="text-[#8E8E93] text-xs mt-1">Customers enter this at checkout</p>
            </div>

            <div>
              <label className={labelCls}>Discount Type *</label>
              <select value={type} onChange={e => setType(e.target.value as typeof type)} className={inputCls}>
                <option value="PERCENTAGE">Percentage (e.g. 20%)</option>
                <option value="FIXED">Fixed Amount (e.g. ₹200 off)</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>

            {type !== "FREE_SHIPPING" && (
              <div>
                <label className={labelCls}>{type === "PERCENTAGE" ? "Discount %" : "Discount Amount (₹)"} *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step={type === "PERCENTAGE" ? "1" : "0.01"}
                  max={type === "PERCENTAGE" ? "100" : undefined}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={type === "PERCENTAGE" ? "20" : "200"}
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className={labelCls}>Minimum Order Value (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minOrderValue}
                onChange={e => setMinOrderValue(e.target.value)}
                placeholder="optional"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Max Uses</label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={e => setMaxUses(e.target.value)}
                placeholder="unlimited"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">Validity Period</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Valid From</label>
              <input type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Valid To (Expiry)</label>
              <input type="datetime-local" value={validTo} onChange={e => setValidTo(e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            <div>
              <p className="text-[#F2F2F7] text-sm font-medium">Active</p>
              <p className="text-[#8E8E93] text-xs">Inactive coupons cannot be used at checkout</p>
            </div>
          </label>
        </section>

        <div className="flex gap-3 pb-8">
          <Link href="/admin/marketing" className="flex-1 text-center border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Creating…" : "Create Coupon"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
