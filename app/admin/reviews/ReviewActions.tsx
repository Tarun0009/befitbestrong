"use client";

import { useState } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewActionsProps {
  id: string;
  isApproved: boolean;
}

export default function ReviewActions({ id, isApproved }: ReviewActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | "delete" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this review permanently?")) return;
    setLoading("delete");
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div className="flex items-center gap-2">
      {!isApproved && (
        <button
          onClick={handleApprove}
          disabled={busy}
          title="Approve"
          className="p-1.5 rounded bg-[#1A7A4A]/20 text-[#1A7A4A] hover:bg-[#1A7A4A]/40 transition-colors disabled:opacity-50"
        >
          {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
      )}
      {isApproved && (
        <button
          onClick={handleReject}
          disabled={busy}
          title="Unapprove"
          className="p-1.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
        >
          {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={busy}
        title="Delete"
        className="p-1.5 rounded bg-[#C0392B]/10 text-[#C0392B] hover:bg-[#C0392B]/20 transition-colors disabled:opacity-50"
      >
        {loading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
