import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Link from "next/link";
import { Check, Zap, Truck, Tag, Star, Crown } from "lucide-react";

const plans = [
  {
    name: "Monthly",
    price: 499,
    period: "month",
    billing: "Billed monthly",
    popular: false,
  },
  {
    name: "Quarterly",
    price: 399,
    period: "month",
    billing: "₹1,197 billed every 3 months",
    popular: true,
  },
  {
    name: "Annual",
    price: 299,
    period: "month",
    billing: "₹3,588 billed annually",
    popular: false,
  },
];

const benefits = [
  { icon: Truck, title: "Always Free Shipping", desc: "No minimum order. Every order. Always." },
  { icon: Tag, title: "10% Off Everything", desc: "Stackable discount on every purchase." },
  { icon: Zap, title: "Early Access Sales", desc: "Shop flash sales 24hrs before everyone else." },
  { icon: Star, title: "2× Iron Points", desc: "Double loyalty points on all purchases." },
  { icon: Crown, title: "Exclusive Products", desc: "Members-only SKUs and limited drops." },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel before your next billing date and you won't be charged. Your benefits continue until the period ends.",
  },
  {
    q: "Does the 10% discount stack with sale prices?",
    a: "Yes — the 10% Iron Club discount applies on top of any existing sale price.",
  },
  {
    q: "What payment methods are supported?",
    a: "UPI, debit/credit cards, net banking, and EMI via Razorpay.",
  },
  {
    q: "When do I get the free shipping?",
    a: "Immediately after payment — your account is upgraded instantly.",
  },
];

export default function IronClubPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#0A0A0A] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.12),transparent_70%)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full px-4 py-1.5 mb-6">
              <Crown className="w-4 h-4 text-[#FF5500]" />
              <span className="text-[#FF5500] text-sm font-medium">Membership</span>
            </div>
            <h1 className="font-(family-name:--font-bebas-neue) text-6xl md:text-8xl text-[#F2F2F7] tracking-wide mb-4">
              IRON CLUB
            </h1>
            <p className="text-[#8E8E93] text-lg md:text-xl max-w-xl mx-auto">
              The best deals, the biggest savings, the most points.
              For athletes who train seriously.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-[#1C1C1E] border-y border-[#2C2C2E] py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide text-center mb-10">
              Member Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#0A0A0A] border border-[#2C2C2E] rounded-xl p-5">
                  <div className="w-10 h-10 bg-[#FF5500]/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#FF5500]" />
                  </div>
                  <p className="text-[#F2F2F7] font-semibold mb-1">{title}</p>
                  <p className="text-[#8E8E93] text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide text-center mb-10">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-[#1C1C1E] rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? "border-2 border-[#FF5500]"
                    : "border border-[#2C2C2E]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#FF5500] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-(family-name:--font-bebas-neue) text-4xl text-[#FF5500]">
                    ₹{plan.price}
                  </span>
                  <span className="text-[#8E8E93] text-sm">/{plan.period}</span>
                </div>
                <p className="text-[#8E8E93] text-xs mb-6">{plan.billing}</p>

                <ul className="space-y-2 mb-8 flex-1">
                  {benefits.map((b) => (
                    <li key={b.title} className="flex items-center gap-2 text-sm text-[#8E8E93]">
                      <Check className="w-4 h-4 text-[#FF5500] shrink-0" />
                      {b.title}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login?next=/iron-club/subscribe"
                  className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-center transition-colors ${
                    plan.popular
                      ? "bg-[#FF5500] hover:bg-[#CC4400] text-white"
                      : "bg-[#2C2C2E] hover:bg-[#FF5500] text-[#F2F2F7] hover:text-white"
                  }`}
                >
                  Join Now
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#1C1C1E] border-t border-[#2C2C2E] py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide text-center mb-10">
              FAQs
            </h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="bg-[#0A0A0A] border border-[#2C2C2E] rounded-xl p-5">
                  <p className="text-[#F2F2F7] font-semibold text-sm mb-2">{q}</p>
                  <p className="text-[#8E8E93] text-sm">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
