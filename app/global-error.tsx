"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry if available
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      import("@sentry/nextjs").then(({ captureException }) => {
        captureException(error);
      }).catch(() => {});
    }
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] text-[#F2F2F7] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl font-bold text-[#FF5500] mb-4">500</div>
          <h1 className="text-2xl font-bold text-[#F2F2F7] mb-2">Something went wrong</h1>
          <p className="text-[#8E8E93] mb-8">
            An unexpected error occurred. Our team has been notified and is working on a fix.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="border border-[#2C2C2E] hover:border-[#FF5500] text-[#F2F2F7] font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
            >
              Go Home
            </Link>
          </div>
          {error.digest && (
            <p className="text-[#2C2C2E] text-xs mt-6 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
