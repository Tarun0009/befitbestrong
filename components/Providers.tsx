"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import OfflineBanner from "@/components/store/OfflineBanner";

// ─── Cart Context ────────────────────────────────────────────────────────────
interface CartCtx {
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartCtx>({ cartCount: 0, refreshCart: () => {} });
export const useCart = () => useContext(CartContext);

function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const count = (data.cart?.items ?? []).reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        setCartCount(count);
      }
    } catch {
      // ignore network errors silently
    }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Root Providers ──────────────────────────────────────────────────────────
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <OfflineBanner />
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
