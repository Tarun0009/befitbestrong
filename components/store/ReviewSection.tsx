"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  user: { name: string | null };
}

interface Props {
  productId: string;
  initialReviews: Review[];
  avgRating: number;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}>
          <Star className={`w-6 h-6 transition-colors ${n <= (hovered || value) ? "fill-[#FF5500] text-[#FF5500]" : "fill-[#2C2C2E] text-[#2C2C2E]"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, initialReviews, avgRating }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, body }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error === "Unauthorized" ? "Sign in to leave a review" : (data.error ?? "Failed to submit"));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#F2F2F7] font-bold text-lg">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "fill-[#FF5500] text-[#FF5500]" : "fill-[#2C2C2E] text-[#2C2C2E]"}`} />
                ))}
              </div>
              <span className="text-[#F2F2F7] text-sm font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-[#8E8E93] text-sm">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors">
            Write a Review
          </button>
        )}
      </div>

      {submitted && (
        <div className="bg-[#1A7A4A]/10 border border-[#1A7A4A]/20 text-[#1A7A4A] text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Review submitted — it will appear after admin approval.
        </div>
      )}

      {showForm && (
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 mb-8">
          <h3 className="text-[#F2F2F7] font-semibold mb-4">Your Review</h3>
          {error && (
            <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-2">Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50" />
            </div>
            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">Review</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                placeholder="Share details about the product..."
                className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest px-6 py-2.5 rounded text-sm transition-colors">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-[#8E8E93] text-sm py-8 text-center">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-[#FF5500] text-[#FF5500]" : "fill-[#2C2C2E] text-[#2C2C2E]"}`} />
                      ))}
                    </div>
                    {r.verifiedPurchase && (
                      <span className="text-xs bg-[#1A7A4A]/10 text-[#1A7A4A] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {r.title && <p className="text-[#F2F2F7] font-semibold text-sm">{r.title}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#F2F2F7] text-xs font-medium">{r.user.name ?? "Anonymous"}</p>
                  <p className="text-[#8E8E93] text-xs">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              {r.body && <p className="text-[#8E8E93] text-sm leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
