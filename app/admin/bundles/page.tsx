"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { formatPrice } from "@/lib/utils";
import { Plus, Trash2, Package, Loader2 } from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
}

interface BundleItemForm {
  productId: string;
  quantity: number;
}

interface BundleItemData {
  id: string;
  quantity: number;
  product: { id: string; name: string; slug: string };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  price: number;
  isActive: boolean;
  items: BundleItemData[];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  comparePrice: "",
  items: [] as BundleItemForm[],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBundles();
    fetchProducts();
  }, []);

  async function fetchBundles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bundles");
      if (res.ok) {
        const data = await res.json();
        setBundles(data.bundles ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(
          (data.products ?? []).map((p: { id: string; name: string; basePrice: number; salePrice: number | null }) => ({
            id: p.id,
            name: p.name,
            basePrice: p.basePrice,
            salePrice: p.salePrice,
          }))
        );
      }
    } catch {
      // ignore — product list is optional for display
    }
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  function addItem() {
    if (products.length === 0) return;
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: products[0].id, quantity: 1 }],
    }));
  }

  function updateItem(index: number, field: "productId" | "quantity", value: string | number) {
    setForm((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  }

  function removeItem(index: number) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.items.length === 0) {
      setError("Add at least one product to the bundle.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
          items: form.items.map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create bundle");
        return;
      }

      setSuccess(`Bundle "${data.bundle.name}" created!`);
      setForm(emptyForm);
      setShowForm(false);
      fetchBundles();
      setTimeout(() => setSuccess(null), 4000);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/bundles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchBundles();
  }

  async function deleteBundle(id: string, name: string) {
    if (!confirm(`Delete bundle "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    fetchBundles();
  }

  return (
    <AdminLayout activeHref="/admin/bundles">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
              Bundles
            </h1>
            <p className="text-[#8E8E93] text-sm mt-0.5">Curate and manage product bundles</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-4 py-2.5 rounded text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Create Bundle"}
          </button>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 mb-8 space-y-5"
          >
            <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
              New Bundle
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                  Bundle Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                  placeholder="e.g. Starter Gym Pack"
                />
              </div>
              <div>
                <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors resize-none"
                placeholder="Short description of the bundle..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                  Bundle Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                  placeholder="2999"
                />
              </div>
              <div>
                <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                  Compare Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.comparePrice}
                  onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-4 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                  placeholder="3999 (optional)"
                />
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold">
                  Products *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[#FF5500] hover:text-[#CC4400] text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Product
                </button>
              </div>

              {form.items.length === 0 && (
                <p className="text-[#8E8E93] text-sm py-3 text-center border border-dashed border-[#2C2C2E] rounded-lg">
                  No products added yet — click Add Product
                </p>
              )}

              <div className="space-y-2">
                {form.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                      className="flex-1 bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-3 py-2 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatPrice(p.salePrice ?? p.basePrice, { compact: true })}
                        </option>
                      ))}
                      {products.length === 0 && (
                        <option value="">Loading products...</option>
                      )}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-20 bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-3 py-2 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-[#8E8E93] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError(null); }}
                className="px-5 py-2.5 text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-2.5 rounded text-sm transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Creating..." : "Create Bundle"}
              </button>
            </div>
          </form>
        )}

        {/* Bundles Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#8E8E93]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading bundles...
          </div>
        ) : bundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-10 h-10 text-[#2C2C2E] mb-3" />
            <p className="text-[#8E8E93] text-sm">No bundles yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C2C2E]">
                  <th className="text-left px-5 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-bold">
                    Bundle
                  </th>
                  <th className="text-left px-5 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-bold">
                    Price
                  </th>
                  <th className="text-left px-5 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-bold">
                    Items
                  </th>
                  <th className="text-left px-5 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-bold">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {bundles.map((bundle, idx) => (
                  <tr
                    key={bundle.id}
                    className={`${idx !== bundles.length - 1 ? "border-b border-[#2C2C2E]" : ""} hover:bg-[#2C2C2E]/30 transition-colors`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-[#F2F2F7] font-medium">{bundle.name}</p>
                      <p className="text-[#8E8E93] text-xs font-mono mt-0.5">{bundle.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-[#FF5500] font-semibold">
                      {formatPrice(Number(bundle.price), { compact: true })}
                    </td>
                    <td className="px-5 py-4 text-[#8E8E93]">
                      {bundle.items.length} product{bundle.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(bundle.id, bundle.isActive)}
                        className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
                          bundle.isActive
                            ? "bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400"
                            : "bg-[#2C2C2E] text-[#8E8E93] hover:bg-green-500/10 hover:text-green-400"
                        }`}
                      >
                        {bundle.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => deleteBundle(bundle.id, bundle.name)}
                        className="p-1.5 text-[#8E8E93] hover:text-red-400 transition-colors"
                        title="Delete bundle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
