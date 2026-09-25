import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, LockKeyhole, PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import heroImage from "@/assets/lockhabit-hero.jpg";
import { CheckInOffer, CheckInTicketButton, type CheckInOfferState } from "@/components/checkin-offer";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/handoff")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT UX Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Handoff,
});

type Surface = "offer" | "ticket" | "cart" | "success";

const surfaces: Array<[Surface, string, string]> = [
  ["offer", "A01", "10% postcard"],
  ["ticket", "A02", "Ticket state"],
  ["cart", "A03", "Cart + trust"],
  ["success", "A04", "Success + 5%"],
];

function Handoff() {
  const [surface, setSurface] = useState<Surface>("offer");
  const [offerState, setOfferState] = useState<CheckInOfferState>("open");
  const [stacked, setStacked] = useState(false);
  const [copied, setCopied] = useState(false);

  const promoSlot =
    surface === "ticket" && offerState !== "open" ? (
      <CheckInTicketButton
        state={offerState}
        onOpen={() => {
          setOfferState("open");
          setSurface("offer");
        }}
      />
    ) : undefined;

  const demoItems = useMemo(() => products.filter((_, index) => [0, 3, 8].includes(index)), []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-[80] border-b-2 border-foreground bg-foreground px-3 py-2 text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <p className="memo">Internal design handoff · noindex · demo data only</p>
          <div className="flex flex-wrap gap-1.5">
            {surfaces.map(([key, id, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSurface(key);
                  if (key === "offer") setOfferState("open");
                  if (key === "ticket") setOfferState("pending");
                }}
                className={`rounded-full border border-background/60 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] ${surface === key ? "bg-sun text-sun-foreground" : "bg-transparent text-background"}`}
              >
                {id} · {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SiteHeader promoSlot={promoSlot} />

      {surface === "offer" || surface === "ticket" ? (
        <section className="relative min-h-[72vh] overflow-hidden border-b-2 border-foreground">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-shade absolute inset-0" />
          <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-end px-5 pb-16 lg:px-10">
            <div className="max-w-2xl text-hero-foreground">
              <p className="memo mb-3 text-sun">LOCKHABIT SOAP CO. · EST. IN THE SUN</p>
              <h1 className="slab-title text-[clamp(3rem,7vw,5.7rem)]">Permanent vacation for your skin.</h1>
              <p className="mt-4 max-w-lg text-lg text-hero-muted">
                Twelve soap and body-care essentials made for slow mornings, warm tile, and the kind of day where nothing is urgent.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {surface === "offer" ? (
        <>
          <CheckInOffer state={offerState} onStateChange={setOfferState} />
          <PreviewControls state={offerState} onChange={setOfferState} />
        </>
      ) : null}

      {surface === "ticket" ? (
        <section className="mx-auto max-w-5xl px-5 py-14 lg:px-10">
          <p className="eyebrow">A02 / Dismissed + applied state</p>
          <h2 className="section-title max-w-3xl">The offer waits without nagging.</h2>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            The ticket sits immediately left of the shopping bag. Badge “1” means the reusable 10% offer is waiting; the calm check state means it has already been applied.
          </p>
          <div className="mt-8 flex gap-3">
            <button className="secondary-button" onClick={() => setOfferState("pending")}>Pending ticket</button>
            <button className="secondary-button" onClick={() => setOfferState("applied")}>Applied check</button>
          </div>
        </section>
      ) : null}

      {surface === "cart" ? (
        <section className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">A03 / Cart conversion + trust</p>
              <h2 className="section-title">A clear receipt before Stripe.</h2>
            </div>
            <button className="secondary-button" onClick={() => setStacked((value) => !value)}>
              {stacked ? "Show 10% only" : "Preview 10% + 5%"}
            </button>
          </div>
          <CartDesign items={demoItems} stacked={stacked} />
        </section>
      ) : null}

      {surface === "success" ? (
        <section className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
          <p className="eyebrow">A04 / Order success + next-order reward</p>
          <OrderSuccess copied={copied} onCopy={() => { void navigator.clipboard?.writeText("LH-000214"); setCopied(true); }} />
        </section>
      ) : null}

      <section className="border-t-2 border-foreground bg-secondary px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="memo">Continue the handoff</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="secondary-button bg-background" to="/creator/login">A05 creator sign-in</Link>\n            <Link className="secondary-button bg-background" to="/creator">A05 creator dashboard</Link>
            <Link className="secondary-button bg-background" to="/owner/creator-program">A06 owner tools</Link>
            <Link className="secondary-button bg-background" to="/journal">A07 journal</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewControls({
  state,
  onChange,
}: {
  state: CheckInOfferState;
  onChange: (state: CheckInOfferState) => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 gap-1 rounded-full border-2 border-foreground bg-paper p-1 shadow-[4px_4px_0_var(--color-foreground)]">
      {(["open", "pending", "applied"] as const).map((value) => (
        <button
          key={value}
          type="button"
          className={`rounded-full px-3 py-2 text-[0.62rem] font-black uppercase ${state === value ? "bg-sun text-sun-foreground" : ""}`}
          onClick={() => onChange(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function CartDesign({
  items,
  stacked,
}: {
  items: typeof products;
  stacked: boolean;
}) {
  const subtotal = 89;
  const checkIn = 8.9;
  const afterTen = subtotal - checkIn;
  const reward = stacked ? Number((afterTen * 0.05).toFixed(2)) : 0;
  const total = Number((afterTen - reward).toFixed(2));

  return (
    <div className="mx-auto grid overflow-hidden rounded-[1.6rem] border-2 border-foreground bg-paper shadow-[8px_8px_0_var(--color-foreground)] md:grid-cols-[1fr_420px]">
      <div className="relative min-h-[520px] bg-secondary p-8">
        <div className="max-w-md">
          <p className="memo text-primary">Current LockHabit cart logic preserved</p>
          <h3 className="mt-3 font-display text-4xl font-semibold">Discounts should feel obvious, not suspicious.</h3>
          <p className="mt-4 text-muted-foreground">
            Bundle price first. Then reusable Check-In 10%. If a valid prior order is entered, the additional 5% reward stacks after it.
          </p>
          <div className="mt-8 rounded-2xl border-2 border-foreground bg-background p-5">
            <div className="flex items-center justify-between text-sm font-black">
              <span>FREE SHIPPING $75+</span><span>Unlocked</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border border-foreground/30 bg-muted">
              <div className="h-full w-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
      <aside className="border-l-0 border-foreground bg-background md:border-l-2">
        <div className="border-b-2 border-foreground p-5">
          <p className="font-display text-2xl font-semibold">Your bag</p>
          <p className="memo mt-1 text-muted-foreground">3 sunny essentials</p>
        </div>
        <div className="p-5">
          {items.map((product) => (
            <div key={product.id} className="flex gap-3 border-b border-border py-4">
              <img src={product.images[0]?.src} alt="" className="h-16 w-16 rounded-lg border-2 border-foreground object-cover" />
              <div className="flex-1">
                <p className="font-display font-semibold leading-tight">{product.name}</p>
                <p className="memo mt-1 text-muted-foreground">Qty 1</p>
              </div>
              <span className="font-bold">$35.00</span>
            </div>
          ))}
          <div className="mt-5 rounded-xl border-2 border-foreground bg-sun/30 p-4">
            <div className="flex justify-between text-sm font-bold"><span>Bundle savings</span><span>−$16.00</span></div>
            <div className="mt-2 flex justify-between text-sm font-bold text-primary"><span>Check-In 10%</span><span>−${checkIn.toFixed(2)}</span></div>
            {stacked ? <div className="mt-2 flex justify-between text-sm font-bold text-coral"><span>Next-order 5% · LH-000214</span><span>−${reward.toFixed(2)}</span></div> : null}
          </div>
          <div className="mt-4 space-y-2 border-t border-foreground/20 pt-4">
            <div className="flex justify-between text-sm"><span>Merchandise</span><span>$89.00</span></div>
            <div className="flex justify-between font-black"><span>Total before shipping/tax</span><span>${total.toFixed(2)}</span></div>
          </div>
          {!stacked ? (
            <div className="mt-4 rounded-xl border border-foreground/30 p-3">
              <label htmlFor="reward" className="memo">Have a previous order number?</label>
              <div className="mt-2 flex gap-2">
                <input id="reward" className="min-w-0 flex-1 rounded-full border-2 border-foreground bg-paper px-4 py-2 text-sm" placeholder="LH-000214" />
                <button className="rounded-full border-2 border-foreground bg-sun px-4 text-xs font-black uppercase">Apply 5%</button>
              </div>
            </div>
          ) : null}
          <button className="dark-button mt-5 w-full justify-center"><LockKeyhole size={17} /> Secure checkout</button>
          <div className="mt-5 space-y-2 text-xs">
            <Trust icon={<ShieldCheck size={16} />}>Secure checkout powered by Stripe</Trust>
            <Trust icon={<RotateCcw size={16} />}>14-day returns on unopened, unused items</Trust>
            <Trust icon={<Truck size={16} />}>Tracking emailed when your order ships</Trust>
            <Trust icon={<PackageCheck size={16} />}>Free shipping on $75+</Trust>
            <a href="/returns" className="font-bold underline underline-offset-4">Returns Policy → return details & shipping costs</a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Trust({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="flex items-center gap-2">{icon}<span>{children}</span></div>;
}

function OrderSuccess({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[1.7rem] border-2 border-foreground bg-paper p-6 shadow-[8px_8px_0_var(--color-foreground)] md:p-10">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-sun/40" aria-hidden="true" />
      <div className="relative z-10 grid gap-8 md:grid-cols-[1.25fr_.75fr]">
        <div>
          <p className="memo text-primary">Guest services · order complete</p>
          <h2 className="mt-3 font-slab text-5xl uppercase leading-none md:text-7xl">You’re checked in.</h2>
          <p className="mt-5 max-w-xl text-lg">Thanks for your order. We’ll email tracking as soon as your package leaves the front desk.</p>
          <div className="mt-7 inline-flex rounded-full border-2 border-foreground bg-background px-5 py-3 font-black">Order LH-000214</div>
        </div>
        <div className="rounded-2xl border-2 border-foreground bg-coral p-5 text-coral-foreground shadow-[4px_4px_0_var(--color-foreground)]">
          <p className="memo text-coral-foreground/80">Keep the good habit going</p>
          <h3 className="mt-2 font-display text-3xl font-semibold">Take 5% off your next order.</h3>
          <p className="mt-2 text-sm">Use this order number as your reward credential.</p>
          <button onClick={onCopy} className="mt-4 flex w-full items-center justify-between rounded-xl border-2 border-foreground bg-paper px-4 py-3 text-foreground">
            <span className="font-black">LH-000214</span><span className="flex items-center gap-2 text-xs font-black uppercase">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div className="relative z-10 mt-8 grid gap-3 border-t border-foreground/20 pt-6 sm:grid-cols-3">
        <div><p className="memo">Order updates</p><p className="mt-2 text-sm">Tracking emailed when shipped.</p></div>
        <div><p className="memo">Returns & exchanges</p><p className="mt-2 text-sm">14-day returns on unopened, unused items.</p></div>
        <div><p className="memo">Need help?</p><p className="mt-2 text-sm">Use the existing LockHabit support contact.</p></div>
      </div>
    </div>
  );
}
