import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { products } from "@/lib/catalog";
import { getCartPricing } from "@/lib/pricing";
import { CART_STORAGE_KEY, parseStoredCart, serializeCart } from "@/lib/cart-storage";
import { trackMetaEvent } from "@/lib/meta-analytics";
import { acceptedCartQuantity, ga4Item, trackAddToCart } from "@/lib/ga4-ecommerce";

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

  const clearCart = useCallback(() => setCart({}), []);

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
        const product = products.find((candidate) => candidate.id === id);
        if (!product) return;
        const accepted = acceptedCartQuantity(cart[id] ?? 0, quantity);
        if (!accepted) return;
        setCart((current) => ({
          ...current,
          [id]: Math.min(20, (current[id] ?? 0) + accepted),
        }));
        setCartOpen(true);
        trackMetaEvent("AddToCart", {
          content_ids: [String(product.id)],
          content_name: product.name,
          content_type: "product",
          value: product.price * accepted,
          currency: "USD",
          num_items: accepted,
        });
        trackAddToCart([ga4Item(product.id, product.name, product.price, accepted)]);
      },
      addBundle: (ids: number[]) => {
        const acceptedByProduct = new Map<number, number>();
        for (const id of ids) {
          if (!products.some((product) => product.id === id)) continue;
          const accepted = acceptedCartQuantity(
            (cart[id] ?? 0) + (acceptedByProduct.get(id) ?? 0),
            1,
          );
          if (accepted) acceptedByProduct.set(id, (acceptedByProduct.get(id) ?? 0) + accepted);
        }
        if (!acceptedByProduct.size) return;
        const acceptedProducts = [...acceptedByProduct.entries()]
          .map(([id, quantity]) => ({
            product: products.find((product) => product.id === id)!,
            quantity,
          }));
        setCart((current) => {
          const next = { ...current };
          for (const { product, quantity } of acceptedProducts) {
            next[product.id] = Math.min(20, (next[product.id] ?? 0) + quantity);
          }
          return next;
        });
        setCartOpen(true);
        trackMetaEvent("AddToCart", {
          content_ids: acceptedProducts.map(({ product }) => String(product.id)),
          content_type: "product",
          value: acceptedProducts.reduce(
            (sum, { product, quantity }) => sum + product.price * quantity,
            0,
          ),
          currency: "USD",
          num_items: acceptedProducts.reduce((sum, { quantity }) => sum + quantity, 0),
        });
        trackAddToCart(acceptedProducts.map(({ product, quantity }) =>
          ga4Item(product.id, product.name, product.price, quantity),
        ));
      },
      clearCart,
      changeQuantity: (id: number, amount: number) => {
        const product = products.find((candidate) => candidate.id === id);
        const previous = cart[id] ?? 0;
        const next = Math.min(20, Math.max(0, previous + amount));
        if (next === previous) return;
        setCart((current) => {
          const updated = { ...current, [id]: next };
          if (next === 0) delete updated[id];
          return updated;
        });
        // The drawer's + button is a real cart addition and belongs in the GA4 funnel.
        if (product && next > previous) {
          const accepted = next - previous;
          trackMetaEvent("AddToCart", {
            content_ids: [String(id)],
            content_name: product.name,
            content_type: "product",
            value: product.price * accepted,
            currency: "USD",
            num_items: accepted,
          });
          trackAddToCart([ga4Item(id, product.name, product.price, accepted)]);
        }
      },
    };
  }, [cart, cartOpen, currentPricing, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
