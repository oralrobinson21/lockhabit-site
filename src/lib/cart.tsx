import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { products } from "@/lib/catalog";
import { getCartPricing } from "@/lib/pricing";
import { trackMetaEvent } from "@/lib/meta-analytics";

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

  const currentPricing = useMemo(
    () =>
      getCartPricing(
        products
          .filter((product) => (cart[product.id] ?? 0) > 0)
          .map((product) => ({ ...product, quantity: cart[product.id] ?? 0 })),
      ),
    [cart],
  );

  useEffect(() => {
    if (subscribe && !currentPricing.canSubscribe) setSubscribe(false);
  }, [currentPricing.canSubscribe, subscribe]);

  const value = useMemo<CartContextValue>(() => {
    const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    const pricing = currentPricing;

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
        const product = products.find((candidate) => candidate.id === id);
        setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + count }));
        setCartOpen(true);
        if (product) {
          trackMetaEvent("AddToCart", {
            content_ids: [String(product.id)],
            content_name: product.name,
            content_type: "product",
            value: product.price * count,
            currency: "USD",
            num_items: count,
          });
        }
      },
      addBundle: (ids: number[]) => {
        setSubscribe(false);
        setCart((current) =>
          ids.reduce((next, id) => ({ ...next, [id]: (next[id] ?? 0) + 1 }), current),
        );
        setCartOpen(true);
        const bundleProducts = ids
          .map((id) => products.find((product) => product.id === id))
          .filter((product): product is (typeof products)[number] => Boolean(product));
        if (bundleProducts.length) {
          trackMetaEvent("AddToCart", {
            content_ids: bundleProducts.map((product) => String(product.id)),
            content_type: "product",
            value: bundleProducts.reduce((sum, product) => sum + product.price, 0),
            currency: "USD",
            num_items: bundleProducts.length,
          });
        }
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
  }, [cart, cartOpen, subscribe, currentPricing]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
