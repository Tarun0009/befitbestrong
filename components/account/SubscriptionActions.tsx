"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubscriptionActionsProps {
  subscriptionId: string;
  status: string;
}

export default function SubscriptionActions({
  subscriptionId,
  status,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"pause" | "cancel" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(newStatus: "PAUSED" | "CANCELLED") {
    setError(null);
    setLoading(newStatus === "PAUSED" ? "pause" : "cancel");
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update subscription");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(null);
      setConfirmCancel(false);
    }
  }

  if (status === "CANCELLED") {
    return (
      <p className="text-[#8E8E93] text-sm">
        This subscription has been cancelled.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {status === "ACTIVE" && (
          <button
            onClick={() => updateStatus("PAUSED")}
            disabled={loading !== null}
            className="text-sm font-semibold text-[#8E8E93] hover:text-[#F2F2F7] border border-[#2C2C2E] hover:border-[#FF5500]/40 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {loading === "pause" ? "Pausing..." : "Pause Subscription"}
          </button>
        )}
        {status === "PAUSED" && (
          <button
            onClick={() => updateStatus("PAUSED")}
            disabled={loading !== null}
            className="text-sm font-semibold text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            Resume Subscription
          </button>
        )}

        {!confirmCancel ? (
          <button
            onClick={() => setConfirmCancel(true)}
            disabled={loading !== null}
            className="text-sm font-semibold text-[#8E8E93] hover:text-red-400 border border-[#2C2C2E] hover:border-red-500/40 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            Cancel Subscription
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8E8E93] text-sm">Are you sure?</span>
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={loading !== null}
              className="text-sm font-bold text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {loading === "cancel" ? "Cancelling..." : "Yes, Cancel"}
            </button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="text-sm text-[#8E8E93] hover:text-[#F2F2F7] transition-colors"
            >
              Never mind
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
