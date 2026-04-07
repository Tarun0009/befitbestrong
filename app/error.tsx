"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl font-bold text-[#FF5500] mb-4">Oops</div>
        <h1 className="text-xl font-bold text-[#F2F2F7] mb-2">Something went wrong</h1>
        <p className="text-[#8E8E93] mb-8 text-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-5 py-2.5 rounded text-sm transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest px-5 py-2.5 rounded text-sm transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
