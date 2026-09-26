import { applyQuantityChange } from "@/lib/cart-quantity";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { products } from "@/lib/catalog";
import { getCartPricing } from "@/lib/pricing";
import { CART_STORAGE_KEY, parseStoredCart, serializeCart } from "@/lib/cart-storage";
import { CHECKIN_STORAGE_KEY, isCheckInOfferSaved } from "@/lib/checkin-storage";
import { trackMetaEvent } from "@/lib/meta-analytics";
import { acceptedCartQuantity, buildGa4AddedCartItems, trackAddToCart } from "@/lib/ga4-ecommerce";

type CartContextValue = {
  cart: Record<number, number>;
  cartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  checkInOfferSaved: boolean;
  qualifiesForFreeShipping: boolean;
  setCartOpen: (open: boolean) => void;
  setCheckInOfferSaved: (saved: boolean) => void;
  addToCart: (id: number, quantity?: number) => void;
  addBundle: (ids: number[]) => void;
  changeQuantity: (id: number, amount: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
/** Use the actual discounted cart tier when reporting accepted additions. */
function reportAcceptedCartAdditions(
  previousCart: Record<number, number>,
  additions: Array<{ id: number; quantity: number }>,
  contentName?: string,
) {
  const addedById = new Map(additions.map(({ id, quantity }) => [id, quantity]));
  const projectedCart = products.flatMap((product) => {
    const quantity = (previousCart[product.id] ?? 0) + (addedById.get(product.id) ?? 0);
    return quantity > 0 ? [{ ...product, quantity }] : [];
  });
  const items = buildGa4AddedCartItems(projectedCart, additions);
  if (!items.length) return;
  const value = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  trackMetaEvent("AddToCart", {
    content_ids: items.map((item) => item.item_id),
    content_name: contentName,
    content_type: "product",
    value,
    currency: "USD",
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
  });
  trackAddToCart(items);
}


export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [checkInOfferSaved, setCheckInOfferSaved] = useState(false);

  useEffect(() => {
    try { setCart(parseStoredCart(localStorage.getItem(CART_STORAGE_KEY))); }
    catch { /* private browsing: memory-only cart */ }
    try { setCheckInOfferSaved(isCheckInOfferSaved(localStorage.getItem(CHECKIN_STORAGE_KEY))); }
    catch { /* private browsing: memory-only offer */ }
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
      checkInOfferSaved,
      qualifiesForFreeShipping: pricing.qualifiesForFreeShipping,
      setCartOpen,
      setCheckInOfferSaved,
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
        reportAcceptedCartAdditions(cart, [{ id: product.id, quantity: accepted }], product.name);
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
        reportAcceptedCartAdditions(cart, acceptedProducts.map(({ product, quantity }) => ({ id: product.id, quantity })));
      },
      clearCart,
      changeQuantity: (id: number, amount: number) => {
        const product = products.find((candidate) => candidate.id === id);
        const previous = cart[id] ?? 0;
        const next = Math.min(20, Math.max(0, previous + amount));
        if (next === previous) return;
        // Apply against the latest state so rapid taps on + or − each count.
        setCart((current) => applyQuantityChange(current, id, amount));
        // The drawer's + button is a real cart addition and belongs in the GA4 funnel.
        if (product && next > previous) {
          const accepted = next - previous;
          reportAcceptedCartAdditions(cart, [{ id, quantity: accepted }], product.name);
        }
      },
    };
  }, [cart, cartOpen, checkInOfferSaved, currentPricing, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
