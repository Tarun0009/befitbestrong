"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] border-t border-[#2C2C2E] px-4 py-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#8E8E93] text-center sm:text-left">
          We use cookies to improve your experience.{" "}
          <a href="/privacy" className="text-[#FF5500] hover:text-[#CC4400] underline transition-colors">
            Learn more
          </a>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-5 py-2 rounded-lg border border-[#2C2C2E] text-[#8E8E93] hover:text-[#F2F2F7] hover:border-[#8E8E93] text-sm font-medium transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold tracking-wide transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
