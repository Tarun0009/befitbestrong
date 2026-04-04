"use client";

import { useState } from "react";
import { Dumbbell, ChevronRight, ChevronLeft, Loader2, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

type Step = 1 | 2 | 3 | 4 | 5;

const SPACE_TYPES = ["Home Gym", "Commercial", "Garage", "Apartment"];
const BUDGETS = ["Under ₹25k", "₹25k–1L", "₹1L–5L", "₹5L+"];
const GOALS = ["Strength", "Cardio", "Body Composition", "Powerlifting", "General Fitness"];
const EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];
const PRIORITY_OPTIONS = [
  "Free Weights",
  "Machines",
  "Cardio",
  "Recovery",
  "Supplements",
  "Apparel",
];

interface Recommendation {
  name: string;
  category: string;
  reason: string;
  estimatedPrice: string;
  priority: "essential" | "recommended" | "optional";
}

const priorityStyles: Record<string, { badge: string; border: string }> = {
  essential: {
    badge: "bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30",
    border: "border-[#FF5500]/30",
  },
  recommended: {
    badge: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    border: "border-blue-500/20",
  },
  optional: {
    badge: "bg-[#8E8E93]/20 text-[#8E8E93] border border-[#8E8E93]/30",
    border: "border-[#2C2C2E]",
  },
};

export default function GymBuilderPage() {
  const [step, setStep] = useState<Step>(1);
  const [spaceType, setSpaceType] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");
  const [experience, setExperience] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState("");

  function togglePriority(p: string) {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : prev.length < 3 ? [...prev, p] : prev
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/gym-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceType, budget, goals, experience, priorities }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to use the Gym Builder.");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }
      setRecommendations(data.recommendations);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  function handleAddAllToCart() {
    // Placeholder — in a real app, we'd add matched products to cart
    alert("Feature coming soon: Adding all recommended products to cart!");
  }

  const stepTitles: Record<Step, string> = {
    1: "What type of space are you setting up?",
    2: "What's your budget?",
    3: "What's your primary goal?",
    4: "What's your experience level?",
    5: "What are your top priorities? (select up to 3)",
  };

  const canAdvance = () => {
    if (step === 1) return !!spaceType;
    if (step === 2) return !!budget;
    if (step === 3) return !!goals;
    if (step === 4) return !!experience;
    if (step === 5) return priorities.length > 0;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <Loader2 className="w-12 h-12 text-[#FF5500] animate-spin" />
          <p className="text-[#F2F2F7] text-lg font-medium">
            Building your perfect gym setup...
          </p>
          <p className="text-[#8E8E93] text-sm text-center max-w-xs">
            Our AI is analyzing your goals and budget to curate the best equipment for you.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (recommendations) {
    const essential = recommendations.filter((r) => r.priority === "essential");
    const recommended = recommendations.filter((r) => r.priority === "recommended");
    const optional = recommendations.filter((r) => r.priority === "optional");

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-7 h-7 text-[#FF5500]" />
              <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wider">
                Your Custom Gym Plan
              </h1>
            </div>
            <p className="text-[#8E8E93] mt-1">
              Curated for a <span className="text-[#FF5500]">{spaceType}</span> •{" "}
              <span className="text-[#FF5500]">{budget}</span> budget •{" "}
              <span className="text-[#FF5500]">{goals}</span> goal
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition-colors text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Add All to Cart
            </button>
            <button
              onClick={() => {
                setRecommendations(null);
                setStep(1);
                setSpaceType("");
                setBudget("");
                setGoals("");
                setExperience("");
                setPriorities([]);
              }}
              className="text-[#8E8E93] hover:text-[#F2F2F7] text-sm underline transition-colors"
            >
              Start Over
            </button>
          </div>

          {/* Essential */}
          {essential.length > 0 && (
            <section className="mb-10">
              <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wider mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#FF5500] fill-[#FF5500]" />
                Essential Equipment
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {essential.map((item, i) => (
                  <RecommendationCard key={i} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <section className="mb-10">
              <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wider mb-4">
                Recommended Additions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.map((item, i) => (
                  <RecommendationCard key={i} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Optional */}
          {optional.length > 0 && (
            <section className="mb-10">
              <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wider mb-4">
                Optional Upgrades
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {optional.map((item, i) => (
                  <RecommendationCard key={i} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Stack Builder CTA */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <p className="text-[#F2F2F7] font-semibold">Also need supplements?</p>
              <p className="text-[#8E8E93] text-sm">
                Get a personalized supplement stack to complement your training.
              </p>
            </div>
            <Link
              href="/stack-builder"
              className="shrink-0 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-[#F2F2F7] font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Build My Stack →
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Dumbbell className="w-8 h-8 text-[#FF5500]" />
            </div>
            <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wider mb-2">
              Gym Builder
            </h1>
            <p className="text-[#8E8E93]">
              Answer 5 quick questions and get a personalized gym equipment plan powered by AI.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1.5 mb-8">
            {([1, 2, 3, 4, 5] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-[#FF5500]" : "bg-[#2C2C2E]"
                }`}
              />
            ))}
          </div>

          {/* Step Card */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 sm:p-8">
            <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
              Step {step} of 5
            </p>
            <h2 className="text-[#F2F2F7] text-xl font-semibold mb-6">
              {stepTitles[step]}
            </h2>

            {/* Step 1 */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {SPACE_TYPES.map((type) => (
                  <OptionButton
                    key={type}
                    label={type}
                    selected={spaceType === type}
                    onClick={() => setSpaceType(type)}
                  />
                ))}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {BUDGETS.map((b) => (
                  <OptionButton
                    key={b}
                    label={b}
                    selected={budget === b}
                    onClick={() => setBudget(b)}
                  />
                ))}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid grid-cols-1 gap-3">
                {GOALS.map((g) => (
                  <OptionButton
                    key={g}
                    label={g}
                    selected={goals === g}
                    onClick={() => setGoals(g)}
                  />
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="grid grid-cols-3 gap-3">
                {EXPERIENCE.map((e) => (
                  <OptionButton
                    key={e}
                    label={e}
                    selected={experience === e}
                    onClick={() => setExperience(e)}
                  />
                ))}
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-3">
                <p className="text-[#8E8E93] text-xs mb-1">
                  {priorities.length}/3 selected
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePriority(p)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                        priorities.includes(p)
                          ? "bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500]"
                          : priorities.length >= 3
                          ? "border-[#2C2C2E] text-[#8E8E93]/50 cursor-not-allowed"
                          : "border-[#2C2C2E] text-[#8E8E93] hover:border-[#FF5500]/50 hover:text-[#F2F2F7]"
                      }`}
                      disabled={!priorities.includes(p) && priorities.length >= 3}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
                disabled={step === 1}
                className="flex items-center gap-1 text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => ((s + 1) as Step))}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] disabled:bg-[#FF5500]/30 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] disabled:bg-[#FF5500]/30 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Build My Gym
                  <Dumbbell className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
        selected
          ? "bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500]"
          : "border-[#2C2C2E] text-[#8E8E93] hover:border-[#FF5500]/50 hover:text-[#F2F2F7]"
      }`}
    >
      {label}
    </button>
  );
}

function RecommendationCard({ item }: { item: Recommendation }) {
  const styles = priorityStyles[item.priority] || priorityStyles.optional;
  return (
    <div
      className={`bg-[#1C1C1E] border rounded-xl p-5 flex flex-col gap-3 ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[#F2F2F7] font-semibold text-sm leading-tight">{item.name}</p>
          <p className="text-[#8E8E93] text-xs mt-0.5">{item.category}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}
        >
          {item.priority}
        </span>
      </div>
      <p className="text-[#8E8E93] text-xs leading-relaxed">{item.reason}</p>
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#2C2C2E]">
        <span className="text-[#FF5500] font-semibold text-sm">{item.estimatedPrice}</span>
        <Link
          href={`/search?q=${encodeURIComponent(item.name)}`}
          className="text-xs text-[#8E8E93] hover:text-[#FF5500] transition-colors"
        >
          Find in Store →
        </Link>
      </div>
    </div>
  );
}
