"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh",
];

const emptyForm = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadAddresses() {
    const res = await fetch("/api/account/addresses");
    const data = await res.json();
    setAddresses(data.addresses ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAddresses(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      loadAddresses();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save address");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    loadAddresses();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">
          Saved Addresses
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-[#1C1C1E] border border-[#FF5500]/30 rounded-xl p-5 mb-6">
            <h2 className="text-[#F2F2F7] font-semibold mb-4">New Address</h2>
            {error && (
              <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "fullName", label: "Full Name", col: "col-span-2" },
                { key: "phone", label: "Phone", col: "" },
                { key: "pincode", label: "Pincode", col: "" },
                { key: "line1", label: "Address Line 1", col: "col-span-2" },
                { key: "line2", label: "Address Line 2 (optional)", col: "col-span-2" },
                { key: "city", label: "City", col: "" },
              ].map(({ key, label, col }) => (
                <div key={key} className={col}>
                  <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">
                    {label}
                  </label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key !== "line2"}
                    className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">State</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest px-6 py-2.5 rounded text-sm transition-colors">
                  {saving ? "Saving..." : "Save Address"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {addresses.length === 0 && !showForm ? (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-12 text-center">
            <MapPin className="w-12 h-12 text-[#2C2C2E] mx-auto mb-4" />
            <p className="text-[#8E8E93]">No saved addresses</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#F2F2F7] font-semibold text-sm">{addr.fullName}</p>
                    {addr.isDefault && (
                      <span className="text-xs bg-[#FF5500]/10 text-[#FF5500] font-bold uppercase px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[#8E8E93] text-sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-[#8E8E93] text-sm">{addr.city}, {addr.state} – {addr.pincode}</p>
                  <p className="text-[#8E8E93] text-sm">{addr.phone}</p>
                </div>
                <button onClick={() => handleDelete(addr.id)}
                  className="text-[#8E8E93] hover:text-[#C0392B] transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

