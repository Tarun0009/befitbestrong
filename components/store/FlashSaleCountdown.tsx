"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface Props {
  endsAt: string; // ISO date string
  onExpire?: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function FlashSaleCountdown({ endsAt, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
        onExpire?.();
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s, expired: false });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt, onExpire]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center gap-2 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-lg px-3 py-2">
      <Zap className="w-3.5 h-3.5 text-[#C0392B] shrink-0" />
      <span className="text-[#C0392B] text-xs font-bold uppercase tracking-wide">Flash Sale ends in</span>
      <div className="flex items-center gap-1 font-mono text-sm font-bold text-[#F2F2F7]">
        <span className="bg-[#2C2C2E] px-1.5 py-0.5 rounded">{pad(timeLeft.h)}</span>
        <span className="text-[#C0392B]">:</span>
        <span className="bg-[#2C2C2E] px-1.5 py-0.5 rounded">{pad(timeLeft.m)}</span>
        <span className="text-[#C0392B]">:</span>
        <span className="bg-[#2C2C2E] px-1.5 py-0.5 rounded">{pad(timeLeft.s)}</span>
      </div>
    </div>
  );
}
