"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

interface Variant {
  sku: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  weightGrams: string;
  imageUrl: string;
}

const emptyVariant = (): Variant => ({
  sku: "", option1Name: "", option1Value: "",
  option2Name: "", option2Value: "",
  price: "", compareAtPrice: "", stockQuantity: "0",
  weightGrams: "", imageUrl: "",
});

const inputCls = "w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg px-3 py-2.5 text-[#F2F2F7] text-sm focus:outline-none focus:border-[#FF5500] transition-colors";
const labelCls = "block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleEndsAt, setSaleEndsAt] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNewProduct] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

  useEffect(() => {
    fetch("/api/products?meta=1").then(r => r.json()).then(d => {
      setCategories(d.categories ?? []);
      setBrands(d.brands ?? []);
    }).catch(() => {});
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function updateVariant(i: number, field: keyof Variant, value: string) {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function addVariant() { setVariants(prev => [...prev, emptyVariant()]); }
  function removeVariant(i: number) { setVariants(prev => prev.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name, slug,
      description: description || undefined,
      shortDesc: shortDesc || undefined,
      categoryId,
      brandId: brandId || undefined,
      basePrice: parseFloat(basePrice),
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      saleEndsAt: saleEndsAt ? new Date(saleEndsAt).toISOString() : undefined,
      isActive, isFeatured, isNew,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      imageUrls: imageUrls.split("\n").map(u => u.trim()).filter(Boolean),
      variants: variants.map(v => ({
        sku: v.sku,
        option1Name: v.option1Name || undefined,
        option1Value: v.option1Value || undefined,
        option2Name: v.option2Name || undefined,
        option2Value: v.option2Value || undefined,
        price: parseFloat(v.price),
        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
        stockQuantity: parseInt(v.stockQuantity) || 0,
        weightGrams: v.weightGrams ? parseInt(v.weightGrams) : undefined,
        imageUrl: v.imageUrl || undefined,
      })),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create product"); return; }
      router.push("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout activeHref="/admin/products">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4 flex items-center gap-3">
        <Link href="/admin/products" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Add Product</h1>
          <p className="text-[#8E8E93] text-xs">Fill in the details below to add a new product</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        {/* Basic Info */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">Basic Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Olympic Barbell 20kg" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated from name" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <select value={brandId} onChange={e => setBrandId(e.target.value)} className={inputCls}>
                <option value="">No brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Description</label>
            <input value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="One-line summary shown on product cards" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Full Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Detailed product description…" className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="barbell, strength, competition" className={inputCls} />
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Base Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Sale Price (₹)</label>
              <input type="number" min="0" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="optional" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Sale Ends At</label>
              <input type="datetime-local" value={saleEndsAt} onChange={e => setSaleEndsAt(e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">Images</h2>
          <div>
            <label className={labelCls}>Image URLs (one per line)</label>
            <textarea value={imageUrls} onChange={e => setImageUrls(e.target.value)} rows={4} placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"} className={`${inputCls} resize-none font-mono text-xs`} />
            <p className="text-[#8E8E93] text-xs mt-1">Use Cloudinary, Supabase Storage, or any CDN URL</p>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">Variants</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs text-[#FF5500] hover:text-[#CC4400] font-bold uppercase tracking-widest transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>

          {variants.map((v, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#8E8E93] text-xs font-bold uppercase tracking-widest">Variant {i + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-[#8E8E93] hover:text-[#C0392B] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>SKU *</label>
                  <input required value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)} placeholder="PROD-001" className={`${inputCls} font-mono`} />
                </div>
                <div>
                  <label className={labelCls}>Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} placeholder="0.00" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Compare At (₹)</label>
                  <input type="number" min="0" step="0.01" value={v.compareAtPrice} onChange={e => updateVariant(i, "compareAtPrice", e.target.value)} placeholder="optional" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stock Qty</label>
                  <input type="number" min="0" value={v.stockQuantity} onChange={e => updateVariant(i, "stockQuantity", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Weight (grams)</label>
                  <input type="number" min="0" value={v.weightGrams} onChange={e => updateVariant(i, "weightGrams", e.target.value)} placeholder="optional" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Option 1 Name</label>
                  <input value={v.option1Name} onChange={e => updateVariant(i, "option1Name", e.target.value)} placeholder="e.g. Size" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Option 1 Value</label>
                  <input value={v.option1Value} onChange={e => updateVariant(i, "option1Value", e.target.value)} placeholder="e.g. 20kg" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Option 2 Name</label>
                  <input value={v.option2Name} onChange={e => updateVariant(i, "option2Name", e.target.value)} placeholder="e.g. Colour" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Option 2 Value</label>
                  <input value={v.option2Value} onChange={e => updateVariant(i, "option2Value", e.target.value)} placeholder="e.g. Black" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Variant Image URL</label>
                <input value={v.imageUrl} onChange={e => updateVariant(i, "imageUrl", e.target.value)} placeholder="https://…" className={`${inputCls} font-mono text-xs`} />
              </div>
            </div>
          ))}
        </section>

        {/* Flags */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest mb-4">Visibility & Flags</h2>
          <div className="flex flex-wrap gap-6">
            {[
              { label: "Active (visible in store)", value: isActive, set: setIsActive },
              { label: "Featured on homepage", value: isFeatured, set: setIsFeatured },
              { label: "Show New badge", value: isNew, set: setIsNewProduct },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
                <span className="text-[#F2F2F7] text-sm">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* SEO */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 space-y-4">
          <h2 className="text-[#F2F2F7] font-bold text-sm uppercase tracking-widest">SEO (optional)</h2>
          <div>
            <label className={labelCls}>Meta Title</label>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Defaults to product name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} placeholder="Brief description for search engines…" className={`${inputCls} resize-none`} />
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Link href="/admin/products" className="flex-1 text-center border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-3 rounded-lg text-sm transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Create Product"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
