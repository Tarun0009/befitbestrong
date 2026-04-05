"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Link from "next/link";
import { Check, Loader2, Zap, Clock } from "lucide-react";

type Plan = "MONTHLY" | "QUARTERLY" | "ANNUAL";

const plans: {
  id: Plan;
  label: string;
  price: number;
  perMonth: number;
  billingNote: string;
  savings?: string;
  badge?: string;
}[] = [
  {
    id: "MONTHLY",
    label: "Monthly",
    price: 499,
    perMonth: 499,
    billingNote: "Billed monthly",
  },
  {
    id: "QUARTERLY",
    label: "Quarterly",
    price: 1197,
    perMonth: 399,
    billingNote: "Billed every 3 months",
    savings: "Save ₹300",
    badge: "Popular",
  },
  {
    id: "ANNUAL",
    label: "Annual",
    price: 3588,
    perMonth: 299,
    billingNote: "Billed annually",
    savings: "Save ₹2,400",
    badge: "Best Value",
  },
];

const perks = [
  "10% discount on all orders",
  "Early access to new products",
  "Double Iron Points on every purchase",
  "Free shipping on every order",
  "Exclusive member-only deals",
  "Priority customer support",
];

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<Plan>("QUARTERLY");
  const [success] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/iron-club/subscribe");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#FF5500] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-[#FF5500]" />
            </div>
            <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wide mb-3">
              Welcome to Iron Club!
            </h1>
            <p className="text-[#8E8E93] text-base mb-8">
              Your membership is now active. You have access to all exclusive member benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/account/subscriptions"
                className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
              >
                View Subscription
              </Link>
              <Link
                href="/products"
                className="border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#1C1C1E] border-b border-[#2C2C2E] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full px-4 py-1.5 mb-5">
              <Zap className="w-4 h-4 text-[#FF5500]" />
              <span className="text-[#FF5500] text-sm font-medium">Iron Club Membership</span>
            </div>
            <h1 className="font-(family-name:--font-bebas-neue) text-6xl md:text-7xl text-[#F2F2F7] tracking-wide mb-4">
              Train Harder.
              <br />
              <span className="text-[#FF5500]">Save More.</span>
            </h1>
            <p className="text-[#8E8E93] text-lg max-w-xl mx-auto">
              Join India&apos;s most dedicated fitness community. Exclusive discounts, early access,
              and double loyalty points — every month.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          {/* Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-[#8E8E93] text-sm">
                <Check className="w-4 h-4 text-[#FF5500] shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* Plan Cards */}
          <h2 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide text-center mb-6">
            Choose Your Plan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {plans.map((plan) => {
              const isSelected = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan.id)}
                  className={`relative text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-[#FF5500] bg-[#FF5500]/5"
                      : "border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#FF5500]/40"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-3 right-3 text-xs font-bold uppercase tracking-widest bg-[#FF5500] text-white px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-2">
                    {plan.label}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7]">
                      ₹{plan.perMonth}
                    </span>
                    <span className="text-[#8E8E93] text-sm">/mo</span>
                  </div>
                  <p className="text-[#8E8E93] text-xs">{plan.billingNote}</p>
                  {plan.savings && (
                    <p className="text-green-400 text-xs font-medium mt-1">{plan.savings}</p>
                  )}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-2 h-2 bg-[#FF5500] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* User greeting */}
          <p className="text-center text-[#8E8E93] text-sm mb-4">
            Subscribing as{" "}
            <span className="text-[#F2F2F7] font-medium">
              {session?.user?.name ?? session?.user?.email}
            </span>
          </p>

          {/* 🚧 Coming Soon notice */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-xl px-6 py-4 text-center max-w-md">
              <Clock className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div className="text-left">
                <p className="text-[#F2F2F7] font-semibold text-sm">Online payments launching soon</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">We're integrating Razorpay — Iron Club memberships will go live shortly. Stay tuned!</p>
              </div>
            </div>

            <button
              disabled
              className="inline-flex items-center gap-2 bg-[#FF5500]/40 text-white/60 font-bold uppercase tracking-widest px-10 py-4 rounded cursor-not-allowed"
            >
              <Clock className="w-4 h-4" />
              Coming Soon
            </button>

            <p className="text-[#8E8E93] text-xs">
              Want to be notified?{" "}
              <Link href="/account" className="text-[#FF5500] hover:underline">
                Save your plan preference in your account.
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
