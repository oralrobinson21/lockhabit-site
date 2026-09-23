import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Sun, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";
import { useCart } from "@/lib/cart";

const tickerItems = [
  "BUILD 3 FOR $89 · SAVE $16",
  "6 CHOSEN BARS $169 · SAVE $41",
  "FREE SHIPPING $75+",
  "TODAY'S FORECAST: LATHER",
];

const menuLinks: Array<[string, string]> = [
  ["Shop", "shop"],
  ["Bundles", "bundles"],
  ["Our story", "story"],
];

function TickerGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="ticker-group" aria-hidden={hidden || undefined}>
      {tickerItems.map((item) => (
        <span key={item} className="flex shrink-0 items-center gap-2.5">
          <Sun size={11} /> {item}
        </span>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { cartCount, setCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const updatePinned = () => setPinned(window.scrollY > 44);
    updatePinned();
    window.addEventListener("scroll", updatePinned, { passive: true });
    return () => window.removeEventListener("scroll", updatePinned);
  }, []);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (window.location.pathname === "/") {
      event.preventDefault();
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div
        className="relative z-40 overflow-hidden border-b-2 border-foreground bg-coral py-2 text-coral-foreground"
        aria-label="Lobby notices"
      >
        <div className="ticker-track memo">
          <TickerGroup />
          <TickerGroup hidden />
        </div>
      </div>

      <div className="h-24">
        <header
          className={`${pinned ? "fixed inset-x-0 top-0 shadow-lg" : "relative"} z-30 border-b-2 border-foreground bg-background/95 backdrop-blur transition-shadow`}
        >
        <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-5 lg:px-10">
          <button
            className="icon-button z-10 bg-background hover:bg-sun md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className="hidden flex-1 items-center gap-7 md:flex" aria-label="Main navigation">
            {menuLinks.map(([label, hash]) => (
              <Link key={hash} className="nav-link" to="/" hash={hash}>
                {label}
              </Link>
            ))}
            <Link className="nav-link" to="/about">
              About
            </Link>
            <Link className="nav-link" to="/faq">FAQ</Link>
          </nav>

          <Link
            to="/"
            onClick={handleLogoClick}
            className="brand-logo pointer-events-auto absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            aria-label="Return to LOCKHABIT home"
            title="Return to LOCKHABIT home"
          >
            <img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" />
          </Link>

          <div className="z-10 flex flex-1 items-center justify-end gap-2">
            <button
              className="icon-button hover:bg-sun bg-background"
              onClick={() => setCartOpen(true)}
              aria-label={`Open bag with ${cartCount} items`}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t-2 border-foreground bg-secondary px-5 py-3 md:hidden">
            {menuLinks.map(([label, hash]) => (
              <Link
                key={hash}
                to="/"
                hash={hash}
                className="memo block border-b border-foreground/20 py-3.5 last:border-0"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/about"
              className="memo block border-b border-foreground/20 py-3.5 last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link to="/faq" className="memo block border-b border-foreground/20 py-3.5" onClick={() => setMenuOpen(false)}>FAQ</Link>
          </nav>
        )}
        </header>
      </div>
    </>
  );
}
