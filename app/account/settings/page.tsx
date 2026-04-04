"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, AlertTriangle } from "lucide-react";

export default function AccountSettingsPage() {
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Deletion failed");
      }
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-[#8E8E93] hover:text-[#F2F2F7] text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <h1 className="font-(family-name:--font-bebas-neue) text-4xl text-[#F2F2F7] tracking-wide">
          Account Settings
        </h1>

        {/* Export Data */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <h2 className="text-[#F2F2F7] font-bold text-lg">Export My Data</h2>
              <p className="text-[#8E8E93] text-sm mt-1">
                Download a copy of all your personal data including orders, addresses, reviews, loyalty
                history, and wishlist as a JSON file.
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
          >
            {exporting ? "Preparing export..." : "Export My Data"}
          </button>
        </div>

        {/* Delete Account */}
        <div className="bg-[#1C1C1E] border border-red-900/40 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-red-900/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-[#F2F2F7] font-bold text-lg">Delete Account</h2>
              <p className="text-[#8E8E93] text-sm mt-1">
                Permanently delete your account and anonymize your personal data. Active subscriptions
                will be cancelled. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">
              Your name and email will be anonymized. Order history will be retained for legal and tax
              compliance purposes.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#8E8E93] text-sm mb-2">
                Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full max-w-xs px-4 py-2.5 bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg text-[#F2F2F7] font-mono placeholder:text-[#3C3C3E] focus:outline-none focus:border-red-500 text-sm"
              />
            </div>

            {deleteError && (
              <p className="text-red-400 text-sm">{deleteError}</p>
            )}

            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
            >
              {deleting ? "Deleting account..." : "Delete My Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
