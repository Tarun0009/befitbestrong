"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !active }),
    });
    if (res.ok) {
      setActive(!active);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-bold uppercase px-2.5 py-1 rounded transition-colors disabled:opacity-50 ${
        active
          ? "bg-[#1A7A4A]/20 text-[#1A7A4A] hover:bg-[#C0392B]/20 hover:text-[#C0392B]"
          : "bg-[#C0392B]/20 text-[#C0392B] hover:bg-[#1A7A4A]/20 hover:text-[#1A7A4A]"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </button>
  );
}
