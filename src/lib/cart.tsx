import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { products } from "@/lib/catalog";
import { getCartPricing } from "@/lib/pricing";
import { CART_STORAGE_KEY, parseStoredCart, serializeCart } from "@/lib/cart-storage";
import { trackMetaEvent } from "@/lib/meta-analytics";

type CartContextValue = {
  cart: Record<number, number>;
  cartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  qualifiesForFreeShipping: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (id: number, quantity?: number) => void;
  addBundle: (ids: number[]) => void;
  changeQuantity: (id: number, amount: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { setCart(parseStoredCart(localStorage.getItem(CART_STORAGE_KEY))); }
    catch { /* private browsing: memory-only cart */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(CART_STORAGE_KEY, serializeCart(cart)); }
    catch { /* storage unavailable; checkout still works */ }
  }, [cart, hydrated]);
  const [cartOpen, setCartOpen] = useState(false);

  const currentPricing = useMemo(
    () =>
      getCartPricing(
        products
          .filter((product) => (cart[product.id] ?? 0) > 0)
          .map((product) => ({ ...product, quantity: cart[product.id] ?? 0 })),
      ),
    [cart],
  );

  const value = useMemo<CartContextValue>(() => {
    const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    const pricing = currentPricing;

    return {
      cart,
      cartOpen,
      cartCount,
      cartTotal: pricing.subtotal,
      cartSavings: pricing.savings,
      qualifiesForFreeShipping: pricing.qualifiesForFreeShipping,
      setCartOpen,
      addToCart: (id: number, quantity = 1) => {
        const count = Math.min(20, Math.max(1, Math.floor(quantity)));
        const product = products.find((candidate) => candidate.id === id);
        if (!product) return;
        setCart((current) => ({ ...current, [id]: Math.min(20, (current[id] ?? 0) + count) }));
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
        setCart((current) =>
          ids.reduce((next, id) => ({ ...next, [id]: Math.min(20, (next[id] ?? 0) + 1) }), current),
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
      clearCart: () => setCart({}),
      changeQuantity: (id: number, amount: number) => {
        setCart((current) => {
          const next = Math.min(20, Math.max(0, (current[id] ?? 0) + amount));
          const updated = { ...current, [id]: next };
          if (next === 0) delete updated[id];
          return updated;
        });
      },
    };
  }, [cart, cartOpen, currentPricing]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
