import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { StripeCartCheckout } from "@/components/stripe-cart-checkout";
import { useCart } from "@/lib/cart";
import { products } from "@/lib/catalog";
import { amountUntilFreeShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    cartCount,
    cartTotal,
    cartSavings,
    checkInOfferSaved,
    qualifiesForFreeShipping,
    setCartOpen,
    changeQuantity,
  } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const checkoutItems = products
    .filter((product) => (cart[product.id] ?? 0) > 0)
    .map((product) => ({ productId: product.id, quantity: cart[product.id] ?? 0 }));
  const freeShippingGap = amountUntilFreeShipping(cartTotal);
  const freeShippingProgress = Math.min(
    100,
    Math.max(0, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  const browse = () => {
    setCartOpen(false);
    void navigate({ to: "/", hash: "shop" });
  };

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l-2 border-foreground bg-background shadow-2xl transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!cartOpen}
      >
        <div className="flex items-center justify-between border-b-2 border-foreground p-5">
          <div>
            <p className="font-display text-2xl font-semibold">
              {checkingOut ? "Secure checkout" : "Your bag"}
            </p>
            <p className="memo mt-1 text-muted-foreground">
              {cartCount} {cartCount === 1 ? "sunny essential" : "sunny essentials"}
            </p>
          </div>
          <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag">
            <X size={20} />
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto ${checkingOut ? "p-2" : "p-5"}`}>
          {!checkingOut && checkInOfferSaved && (
            <div className="rounded-xl border-2 border-foreground bg-paper p-4">
              <p className="font-display text-lg font-semibold">Check-In · 10% offer saved</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Checkout discount redemption is coming soon. The bag subtotal does not include this offer.
              </p>
            </div>
          )}
          {checkingOut ? (
            <StripeCartCheckout items={checkoutItems} />
          ) : cartCount === 0 ? (
            <div className="flex min-h-[16rem] flex-col items-center justify-center text-center">
              <ShoppingBag size={34} className="text-primary" />
              <p className="mt-4 font-display text-2xl font-semibold">
                {checkInOfferSaved ? "Pick your sunny essential." : "Your bag needs sunshine."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {checkInOfferSaved
                  ? "Add a botanical favorite to your bag."
                  : "Pick a botanical favorite to get started."}
              </p>
              <button className="secondary-button mt-6" onClick={browse}>
                Browse the catalog
              </button>
            </div>
          ) : (
            <>
              {products
                .filter((product) => cart[product.id])
                .map((product) => (
                  <div key={product.id} className="flex gap-4 border-b border-border py-5">
                  <img
                    src={product.images[0]?.src}
                    alt=""
                    className="h-20 w-20 rounded-lg border-2 border-foreground object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-display text-lg leading-tight font-semibold">
                          {product.name}
                        </p>
                        <p className="memo mt-1 text-muted-foreground">{product.kind}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold">
                        ${(product.price * (cart[product.id] ?? 0)).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex w-fit items-center rounded-full border-2 border-foreground">
                      <button
                        className="p-2 pl-3"
                        onClick={() => changeQuantity(product.id, -1)}
                        aria-label={`Remove one ${product.name}`}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-xs font-bold">{cart[product.id]}</span>
                      <button
                        className="p-2 pr-3"
                        onClick={() => changeQuantity(product.id, 1)}
                        aria-label={`Add one ${product.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  </div>
                ))}
            </>
          )}
        </div>
        {cartCount > 0 && !checkingOut && (
          <div className="border-t-2 border-foreground p-5">
            {cartSavings > 0 && (
              <div className="mb-2 flex justify-between text-sm font-bold text-primary">
                <span>Bundle savings</span>
                <span>−${cartSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="mb-4 flex justify-between font-bold">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button
              className="primary-button w-full justify-center"
              onClick={() => setCheckingOut(true)}
            >
              Secure checkout <ArrowRight size={18} />
            </button>
            <div className="mt-3">
              <p className="memo text-center text-muted-foreground">
                {qualifiesForFreeShipping
                  ? "You caught free shipping · worldwide details collected at checkout"
                  : `Add ${freeShippingGap.toFixed(2)} more for free shipping`}
              </p>
              {!qualifiesForFreeShipping ? (
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full border border-foreground/20 bg-muted"
                  role="progressbar"
                  aria-label="Progress toward free shipping"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIPPING_THRESHOLD}
                  aria-valuenow={Math.min(cartTotal, FREE_SHIPPING_THRESHOLD)}
                  aria-valuetext={`${freeShippingGap.toFixed(2)} more for free shipping`}
                >
                  <div
                    className="h-full bg-primary transition-[width] duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
        {checkingOut && (
          <div className="border-t-2 border-foreground p-4">
            <button
              className="secondary-button w-full justify-center"
              onClick={() => setCheckingOut(false)}
            >
              <ArrowLeft size={17} /> Back to bag
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
