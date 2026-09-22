import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { products } from "@/lib/catalog";
import { getCartPricing } from "@/lib/pricing";

type CartContextValue = {
  cart: Record<number, number>;
  cartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  qualifiesForFreeShipping: boolean;
  canSubscribe: boolean;
  subscribe: boolean;
  setSubscribe: (subscribe: boolean) => void;
  setCartOpen: (open: boolean) => void;
  addToCart: (id: number, quantity?: number) => void;
  addBundle: (ids: number[]) => void;
  changeQuantity: (id: number, amount: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    const pricing = getCartPricing(
      products
        .filter((product) => (cart[product.id] ?? 0) > 0)
        .map((product) => ({ ...product, quantity: cart[product.id] ?? 0 })),
    );

    return {
      cart,
      cartOpen,
      cartCount,
      cartTotal: subscribe && pricing.canSubscribe ? pricing.subtotal * 0.85 : pricing.subtotal,
      cartSavings:
        pricing.savings + (subscribe && pricing.canSubscribe ? pricing.subtotal * 0.15 : 0),
      qualifiesForFreeShipping:
        (subscribe && pricing.canSubscribe ? pricing.subtotal * 0.85 : pricing.subtotal) >= 75,
      canSubscribe: pricing.canSubscribe,
      subscribe,
      setSubscribe,
      setCartOpen,
      addToCart: (id: number, quantity = 1) => {
        const count = Math.max(1, Math.floor(quantity));
        setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + count }));
        setCartOpen(true);
      },
      addBundle: (ids: number[]) => {
        setCart((current) =>
          ids.reduce((next, id) => ({ ...next, [id]: (next[id] ?? 0) + 1 }), current),
        );
        setCartOpen(true);
      },
      changeQuantity: (id: number, amount: number) => {
        setCart((current) => {
          const next = Math.max(0, (current[id] ?? 0) + amount);
          const updated = { ...current, [id]: next };
          if (next === 0) delete updated[id];
          return updated;
        });
      },
    };
  }, [cart, cartOpen, subscribe]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
