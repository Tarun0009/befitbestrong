"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOffline = () => {
      setOffline(true);
      setShowReconnected(false);
    };
    const handleOnline = () => {
      setOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
        offline ? "bg-[#C0392B] text-white" : "bg-[#1A7A4A] text-white"
      }`}
    >
      {offline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0" />
          You&apos;re offline. Check your connection — cart and orders will resume when you reconnect.
        </>
      ) : (
        "You&apos;re back online!"
      )}
    </div>
  );
}
