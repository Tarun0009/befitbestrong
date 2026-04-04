"use client";

import { useState } from "react";
import { FlaskConical, ChevronRight, ChevronLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

type Step = 1 | 2 | 3 | 4;

const GOALS = ["Bulk", "Cut", "Maintain", "Performance"];
const DIETARY_RESTRICTIONS = [
  "None",
  "Vegetarian",
  "Vegan",
  "Lactose Intolerant",
  "No preference",
];
const MONTHLY_BUDGETS = ["Under ₹2k", "₹2k–5k", "₹5k–10k", "₹10k+"];
const EXPERIENCE = ["Never used", "Occasional", "Regular user"];

interface StackItem {
  supplement: string;
  reason: string;
  dosage: string;
  estimatedMonthlyPrice: string;
  priority: "core" | "recommended" | "optional";
}

const priorityStyles: Record<
  string,
  { badge: string; border: string; label: string }
> = {
  core: {
    badge: "bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30",
    border: "border-[#FF5500]/30",
    label: "Core",
  },
  recommended: {
    badge: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    border: "border-blue-500/20",
    label: "Recommended",
  },
  optional: {
    badge: "bg-[#8E8E93]/20 text-[#8E8E93] border border-[#8E8E93]/30",
    border: "border-[#2C2C2E]",
    label: "Optional",
  },
};

export default function StackBuilderPage() {
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [supplementExperience, setSupplementExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [stack, setStack] = useState<StackItem[] | null>(null);
  const [error, setError] = useState("");

  const stepTitles: Record<Step, string> = {
    1: "What's your primary fitness goal?",
    2: "Any dietary restrictions?",
    3: "What's your monthly supplement budget?",
    4: "What's your experience with supplements?",
  };

  const canAdvance = () => {
    if (step === 1) return !!goal;
    if (step === 2) return !!dietaryRestrictions;
    if (step === 3) return !!monthlyBudget;
    if (step === 4) return !!supplementExperience;
    return false;
  };

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/stack-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          dietaryRestrictions,
          monthlyBudget,
          supplementExperience,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setStack(data.stack);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <Loader2 className="w-12 h-12 text-[#FF5500] animate-spin" />
          <p className="text-[#F2F2F7] text-lg font-medium">
            Building your supplement stack...
          </p>
          <p className="text-[#8E8E93] text-sm text-center max-w-xs">
            Our AI nutritionist is analyzing your profile and creating a personalized
            supplement plan for you.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (stack) {
    const core = stack.filter((s) => s.priority === "core");
    const recommended = stack.filter((s) => s.priority === "recommended");
    const optional = stack.filter((s) => s.priority === "optional");

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <FlaskConical className="w-7 h-7 text-[#FF5500]" />
              <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wider">
                Your Supplement Stack
              </h1>
            </div>
            <p className="text-[#8E8E93] mt-1">
              Personalized for <span className="text-[#FF5500]">{goal}</span> goal •{" "}
              <span className="text-[#FF5500]">{dietaryRestrictions}</span> diet •{" "}
              <span className="text-[#FF5500]">{monthlyBudget}</span>/month budget
            </p>
          </div>

          <button
            onClick={() => {
              setStack(null);
              setStep(1);
              setGoal("");
              setDietaryRestrictions("");
              setMonthlyBudget("");
              setSupplementExperience("");
            }}
            className="mb-8 text-[#8E8E93] hover:text-[#F2F2F7] text-sm underline transition-colors"
          >
            ← Start Over
          </button>

          {/* Core */}
          {core.length > 0 && (
            <section className="mb-10">
              <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wider mb-4">
                Core Supplements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {core.map((item, i) => (
                  <StackCard key={i} item={item} />
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
                  <StackCard key={i} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Optional */}
          {optional.length > 0 && (
            <section className="mb-10">
              <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wider mb-4">
                Optional Extras
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {optional.map((item, i) => (
                  <StackCard key={i} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Gym Builder CTA */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <p className="text-[#F2F2F7] font-semibold">Need equipment too?</p>
              <p className="text-[#8E8E93] text-sm">
                Build your perfect home or commercial gym with our AI Gym Builder.
              </p>
            </div>
            <Link
              href="/gym-builder"
              className="shrink-0 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-[#F2F2F7] font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Build My Gym →
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
              <FlaskConical className="w-8 h-8 text-[#FF5500]" />
            </div>
            <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wider mb-2">
              Build My Stack
            </h1>
            <p className="text-[#8E8E93]">
              Answer 4 quick questions and get a personalized supplement plan from our AI
              nutritionist — completely free.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1.5 mb-8">
            {([1, 2, 3, 4] as Step[]).map((s) => (
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
              Step {step} of 4
            </p>
            <h2 className="text-[#F2F2F7] text-xl font-semibold mb-6">
              {stepTitles[step]}
            </h2>

            {/* Step 1 */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <OptionButton
                    key={g}
                    label={g}
                    selected={goal === g}
                    onClick={() => setGoal(g)}
                  />
                ))}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="grid grid-cols-1 gap-3">
                {DIETARY_RESTRICTIONS.map((d) => (
                  <OptionButton
                    key={d}
                    label={d}
                    selected={dietaryRestrictions === d}
                    onClick={() => setDietaryRestrictions(d)}
                  />
                ))}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {MONTHLY_BUDGETS.map((b) => (
                  <OptionButton
                    key={b}
                    label={b}
                    selected={monthlyBudget === b}
                    onClick={() => setMonthlyBudget(b)}
                  />
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="grid grid-cols-1 gap-3">
                {EXPERIENCE.map((e) => (
                  <OptionButton
                    key={e}
                    label={e}
                    selected={supplementExperience === e}
                    onClick={() => setSupplementExperience(e)}
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

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

              {step < 4 ? (
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
                  Build My Stack
                  <FlaskConical className="w-4 h-4" />
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

function StackCard({ item }: { item: StackItem }) {
  const styles = priorityStyles[item.priority] || priorityStyles.optional;
  return (
    <div className={`bg-[#1C1C1E] border rounded-xl p-5 flex flex-col gap-3 ${styles.border}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[#F2F2F7] font-semibold text-sm leading-tight">
          {item.supplement}
        </p>
        <span
          className={`shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}
        >
          {styles.label}
        </span>
      </div>
      <p className="text-[#8E8E93] text-xs leading-relaxed">{item.reason}</p>
      <div className="bg-[#2C2C2E] rounded-lg px-3 py-2">
        <p className="text-[#8E8E93] text-xs uppercase tracking-wide mb-0.5">Dosage</p>
        <p className="text-[#F2F2F7] text-xs font-medium">{item.dosage}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#2C2C2E]">
        <span className="text-[#FF5500] font-semibold text-sm">
          {item.estimatedMonthlyPrice}/mo
        </span>
        <Link
          href={`/search?q=${encodeURIComponent(item.supplement)}`}
          className="flex items-center gap-1 text-xs text-[#8E8E93] hover:text-[#FF5500] transition-colors"
        >
          <Search className="w-3 h-3" />
          Find in Store
        </Link>
      </div>
    </div>
  );
}
