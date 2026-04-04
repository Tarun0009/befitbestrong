"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Gift, Users } from "lucide-react";

interface ReferralData {
  referral: {
    referralCode: string;
    isUsed: boolean;
    creditGiven: boolean;
    referred?: { name: string | null; email: string; createdAt: string } | null;
  };
  referralUrl: string;
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  async function copyUrl() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
            Refer & Earn
          </h1>
        </div>

        {/* Hero card */}
        <div className="bg-gradient-to-br from-[#FF5500]/20 to-[#1C1C1E] border border-[#FF5500]/30 rounded-2xl p-6 mb-6 text-center">
          <Gift className="w-10 h-10 text-[#FF5500] mx-auto mb-3" />
          <h2 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide mb-2">
            Give ₹500, Get 500 Points
          </h2>
          <p className="text-[#8E8E93] text-sm">
            Share your link. When a friend registers and makes their first purchase,
            you earn <span className="text-[#FF5500] font-semibold">500 Iron Points</span> (worth ₹500).
          </p>
        </div>

        {/* Referral link */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 mb-6">
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-2">Your Referral Code</p>
          <p className="font-(family-name:--font-bebas-neue) text-3xl text-[#FF5500] tracking-widest mb-4">
            {data?.referral.referralCode}
          </p>

          <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-2">Referral Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={data?.referralUrl ?? ""}
              className="flex-1 bg-[#2C2C2E] text-[#8E8E93] text-xs rounded-lg px-3 py-2.5 outline-none truncate"
            />
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#8E8E93]" />
            <p className="text-[#F2F2F7] font-semibold text-sm">Referral Status</p>
          </div>

          {data?.referral.isUsed && data.referral.referred ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#F2F2F7] text-sm font-medium">
                  {data.referral.referred.name ?? data.referral.referred.email}
                </p>
                <p className="text-[#8E8E93] text-xs mt-0.5">
                  Joined {new Date(data.referral.referred.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${
                data.referral.creditGiven
                  ? "bg-[#1A7A4A]/20 text-[#1A7A4A]"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}>
                {data.referral.creditGiven ? "500 pts earned" : "Pending purchase"}
              </span>
            </div>
          ) : (
            <p className="text-[#8E8E93] text-sm">No referrals yet. Share your link to get started!</p>
          )}
        </div>

        {/* How it works */}
        <div className="mt-6 space-y-3">
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold">How It Works</p>
          {[
            "Share your unique referral link with friends",
            "Friend registers using your link",
            "Friend makes their first purchase",
            "You earn 500 Iron Points (= ₹500 discount)",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#FF5500] text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-[#8E8E93] text-sm">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
