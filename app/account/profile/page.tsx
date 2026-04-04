"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Profile {
  name: string;
  phone: string;
  fitnessGoals: string;
  weightKg: string;
  heightCm: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<Profile>({ name: "", phone: "", fitnessGoals: "", weightKg: "", heightCm: "" });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fields: { key: keyof Profile; label: string; type?: string; placeholder: string }[] = [
    { key: "name", label: "Full Name", placeholder: "Your full name" },
    { key: "phone", label: "Phone", type: "tel", placeholder: "+91 9999999999" },
    { key: "fitnessGoals", label: "Fitness Goals", placeholder: "e.g. Build muscle, Lose weight" },
    { key: "weightKg", label: "Weight (kg)", type: "number", placeholder: "70" },
    { key: "heightCm", label: "Height (cm)", type: "number", placeholder: "175" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
            Edit Profile
          </h1>
        </div>

        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6">
          {success && (
            <div className="bg-[#1A7A4A]/10 border border-[#1A7A4A]/20 text-[#1A7A4A] text-sm px-4 py-3 rounded-lg mb-6">
              Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type = "text", placeholder }) => (
              <div key={key}>
                <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest py-3.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
