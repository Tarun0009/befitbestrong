"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Eye, EyeOff, Sparkles } from "lucide-react";

interface Props {
  productId: string;
  isFeatured: boolean;
  isActive: boolean;
  isNew: boolean;
}

export default function ProductToggle({ productId, isFeatured, isActive, isNew }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(field: "isFeatured" | "isActive" | "isNew", current: boolean) {
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => toggle("isFeatured", isFeatured)}
        disabled={loading}
        title={isFeatured ? "Remove from homepage" : "Feature on homepage"}
        className={`p-1.5 rounded transition-colors ${
          isFeatured
            ? "bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500]/20"
            : "text-[#2C2C2E] hover:text-[#FF5500] hover:bg-[#FF5500]/10"
        }`}
      >
        <Star className="w-3.5 h-3.5" fill={isFeatured ? "currentColor" : "none"} />
      </button>

      <button
        onClick={() => toggle("isActive", isActive)}
        disabled={loading}
        title={isActive ? "Deactivate" : "Activate"}
        className={`p-1.5 rounded transition-colors ${
          isActive
            ? "text-[#1A7A4A] hover:bg-[#1A7A4A]/10"
            : "text-[#C0392B] hover:bg-[#C0392B]/10"
        }`}
      >
        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      <button
        onClick={() => toggle("isNew", isNew)}
        disabled={loading}
        title={isNew ? "Remove New badge" : "Mark as New"}
        className={`p-1.5 rounded transition-colors ${
          isNew
            ? "bg-[#0A4FA6]/10 text-[#0A4FA6] hover:bg-[#0A4FA6]/20"
            : "text-[#2C2C2E] hover:text-[#0A4FA6] hover:bg-[#0A4FA6]/10"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
