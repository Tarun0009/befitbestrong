"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Activity } from "lucide-react";

interface Profile {
  name: string;
  phone: string;
  fitnessGoals: string;
  weightKg: string;
  heightCm: string;
}

const inputCls =
  "w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50";
const labelCls = "block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<Profile>({
    name: "", phone: "", fitnessGoals: "", weightKg: "", heightCm: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setForm({
            name: data.user.name ?? "",
            phone: data.user.phone ?? "",
            fitnessGoals: data.user.fitnessGoals ?? "",
            weightKg: data.user.weightKg?.toString() ?? "",
            heightCm: data.user.heightCm?.toString() ?? "",
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        fitnessGoals: form.fitnessGoals,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    }
  }

  // BMI calculation
  const bmi =
    form.weightKg && form.heightCm
      ? parseFloat(form.weightKg) / Math.pow(parseFloat(form.heightCm) / 100, 2)
      : null;
  const bmiCategory =
    bmi === null ? null
    : bmi < 18.5 ? { label: "Underweight", color: "text-blue-400" }
    : bmi < 25   ? { label: "Normal", color: "text-[#1A7A4A]" }
    : bmi < 30   ? { label: "Overweight", color: "text-yellow-400" }
    :              { label: "Obese", color: "text-[#C0392B]" };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide">
        Edit Profile
      </h1>

      {success && (
        <div className="bg-[#1A7A4A]/10 border border-[#1A7A4A]/20 text-[#1A7A4A] text-sm px-4 py-3 rounded-lg">
          Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#FF5500]" />
            <h2 className="text-[#F2F2F7] font-semibold text-sm uppercase tracking-widest">
              Personal Info
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9999999999"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fitness Goals</label>
              <input
                type="text"
                value={form.fitnessGoals}
                onChange={(e) => setForm({ ...form, fitnessGoals: e.target.value })}
                placeholder="e.g. Build muscle, Lose weight"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Body Measurements */}
        <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-[#FF5500]" />
            <h2 className="text-[#F2F2F7] font-semibold text-sm uppercase tracking-widest">
              Body Measurements
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input
                type="number"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                placeholder="70"
                min="20"
                max="300"
                step="0.1"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                placeholder="175"
                min="100"
                max="250"
                step="0.1"
                className={inputCls}
              />
            </div>
          </div>
          {bmi !== null && bmiCategory && (
            <div className="flex items-center gap-3 bg-[#2C2C2E] rounded-lg px-4 py-3">
              <div>
                <p className="text-[#8E8E93] text-xs uppercase tracking-widest">Your BMI</p>
                <p className="text-[#F2F2F7] font-bold text-lg">{bmi.toFixed(1)}</p>
              </div>
              <div className="h-8 w-px bg-[#3C3C3E]" />
              <div>
                <p className="text-[#8E8E93] text-xs uppercase tracking-widest">Category</p>
                <p className={`font-semibold text-sm ${bmiCategory.color}`}>{bmiCategory.label}</p>
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
