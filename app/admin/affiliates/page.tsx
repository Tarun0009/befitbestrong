"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, ToggleLeft, ToggleRight, Copy, Check } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { formatPrice } from "@/lib/utils";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  promoCode: string;
  commissionPct: number | string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalRevenue: number;
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [commissionPct, setCommissionPct] = useState("10");

  async function fetchAffiliates() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();
      if (res.ok) setAffiliates(data.affiliates);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAffiliates();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, promoCode, commissionPct: Number(commissionPct) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create affiliate");
        return;
      }
      setName("");
      setEmail("");
      setPromoCode("");
      setCommissionPct("10");
      setShowForm(false);
      await fetchAffiliates();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  async function toggleActive(affiliate: Affiliate) {
    try {
      await fetch(`/api/admin/affiliates/${affiliate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !affiliate.isActive }),
      });
      setAffiliates((prev) =>
        prev.map((a) =>
          a.id === affiliate.id ? { ...a, isActive: !a.isActive } : a
        )
      );
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this affiliate? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/affiliates/${id}`, { method: "DELETE" });
      setAffiliates((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AdminLayout activeHref="/admin/affiliates">
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wider">
              Influencer / Affiliates
            </h1>
            <p className="text-[#8E8E93] text-sm mt-1">
              Manage affiliate partners and track their performance
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Affiliate
          </button>
        </div>

        {/* Add Affiliate Form */}
        {showForm && (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 mb-6">
            <h2 className="text-[#F2F2F7] font-semibold mb-4">New Affiliate</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8E8E93] text-xs uppercase tracking-widest block mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full bg-[#2C2C2E] border border-[#3C3C3E] text-[#F2F2F7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5500] placeholder-[#8E8E93]"
                />
              </div>
              <div>
                <label className="text-[#8E8E93] text-xs uppercase tracking-widest block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@example.com"
                  className="w-full bg-[#2C2C2E] border border-[#3C3C3E] text-[#F2F2F7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5500] placeholder-[#8E8E93]"
                />
              </div>
              <div>
                <label className="text-[#8E8E93] text-xs uppercase tracking-widest block mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  required
                  placeholder="JOHN20"
                  className="w-full bg-[#2C2C2E] border border-[#3C3C3E] text-[#F2F2F7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5500] placeholder-[#8E8E93] font-mono"
                />
              </div>
              <div>
                <label className="text-[#8E8E93] text-xs uppercase tracking-widest block mb-1">
                  Commission %
                </label>
                <input
                  type="number"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full bg-[#2C2C2E] border border-[#3C3C3E] text-[#F2F2F7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              {formError && (
                <p className="sm:col-span-2 text-red-400 text-sm">{formError}</p>
              )}

              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] disabled:bg-[#FF5500]/40 text-white font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create Affiliate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  className="text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Affiliates Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
          </div>
        ) : affiliates.length === 0 ? (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-12 text-center">
            <p className="text-[#8E8E93]">No affiliates yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2C2C2E]">
                    <th className="text-left text-[#8E8E93] uppercase tracking-widest text-xs px-5 py-3 font-medium">
                      Affiliate
                    </th>
                    <th className="text-left text-[#8E8E93] uppercase tracking-widest text-xs px-4 py-3 font-medium">
                      Promo Code
                    </th>
                    <th className="text-left text-[#8E8E93] uppercase tracking-widest text-xs px-4 py-3 font-medium">
                      Commission
                    </th>
                    <th className="text-left text-[#8E8E93] uppercase tracking-widest text-xs px-4 py-3 font-medium">
                      Orders
                    </th>
                    <th className="text-left text-[#8E8E93] uppercase tracking-widest text-xs px-4 py-3 font-medium">
                      Revenue
                    </th>
                    <th className="text-left text-[#8E8E93] uppercase tracking-widest text-xs px-4 py-3 font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2C2E]">
                  {affiliates.map((affiliate) => (
                    <tr
                      key={affiliate.id}
                      className="hover:bg-[#2C2C2E]/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-[#F2F2F7] font-medium">{affiliate.name}</p>
                        <p className="text-[#8E8E93] text-xs">{affiliate.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/20 px-2 py-0.5 rounded text-xs font-bold">
                            {affiliate.promoCode}
                          </span>
                          <button
                            onClick={() => copyCode(affiliate.promoCode)}
                            className="text-[#8E8E93] hover:text-[#F2F2F7] transition-colors"
                            title="Copy code"
                          >
                            {copied === affiliate.promoCode ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[#F2F2F7]">
                          {Number(affiliate.commissionPct)}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[#F2F2F7]">{affiliate.orderCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[#F2F2F7]">
                          {formatPrice(affiliate.totalRevenue)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleActive(affiliate)}
                          className="flex items-center gap-1.5 text-sm transition-colors"
                        >
                          {affiliate.isActive ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-green-400" />
                              <span className="text-green-400 text-xs">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-[#8E8E93]" />
                              <span className="text-[#8E8E93] text-xs">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(affiliate.id)}
                          className="p-1.5 text-[#8E8E93] hover:text-red-400 transition-colors rounded"
                          title="Delete affiliate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
