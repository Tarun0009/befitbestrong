"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.07),transparent_70%)]" />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-xl mb-4">
            <Mail className="w-5 h-5 text-[#FF5500]" />
          </div>
          <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide mb-2">
            Get Early Access & Deals
          </h2>
          <p className="text-[#8E8E93] text-sm mb-6">
            Join 10,000+ athletes. Be the first to know about new arrivals, flash sales, and exclusive member offers.
          </p>

          {status === "done" ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-6 py-4 font-semibold">
              You&apos;re on the list! We&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] placeholder:text-[#8E8E93]/60 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition-colors shrink-0"
              >
                {status === "loading" ? "Subscribing..." : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-red-400 text-xs mt-2">Something went wrong. Please try again.</p>
          )}
          <p className="text-[#8E8E93] text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
