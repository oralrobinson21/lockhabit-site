import * as Dialog from "@radix-ui/react-dialog";
import { Check, Package, Ticket, X } from "lucide-react";
import type { ReactNode } from "react";

import heroImage from "@/assets/lockhabit-hero.jpg";
import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export type CheckInOfferState = "open" | "pending" | "applied";

export function CheckInTicketButton({
  state,
  onOpen,
}: {
  state: Exclude<CheckInOfferState, "open">;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="icon-button bg-background hover:bg-sun"
      aria-label={state === "applied" ? "10% Check-In offer applied" : "One Check-In offer waiting"}
      title={state === "applied" ? "10% Check-In applied" : "10% Check-In offer waiting"}
      onClick={onOpen}
    >
      {state === "applied" ? <Check size={19} /> : <Ticket size={19} />}
      {state === "pending" ? <span className="cart-count">1</span> : null}
    </button>
  );
}

function ScenicPanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute overflow-hidden border-2 border-foreground shadow-[3px_3px_0_var(--color-foreground)] ${className}`}
      aria-hidden="true"
    >
      <img src={heroImage} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-coral/10 mix-blend-multiply" />
    </div>
  );
}

function Stamp({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-2 border-dashed border-coral bg-paper/90 px-2 py-2 text-center text-[0.52rem] font-black uppercase tracking-[0.18em] text-foreground shadow-[2px_2px_0_var(--color-coral)] ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export function CheckInOffer({
  state,
  onStateChange,
}: {
  state: CheckInOfferState;
  onStateChange: (state: CheckInOfferState) => void;
}) {
  const open = state === "open";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && state === "open") onStateChange("pending");
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-foreground/45 backdrop-blur-[5px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-1.5rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 outline-none"
          onEscapeKeyDown={() => onStateChange("pending")}
        >
          <div className="relative isolate overflow-hidden rounded-[1.65rem] border-[3px] border-foreground bg-[#f7e8c7] shadow-[10px_12px_0_rgba(62,45,33,.92)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-35"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(84,57,30,.18) .55px, transparent .7px), radial-gradient(rgba(255,255,255,.28) .6px, transparent .8px)",
                backgroundPosition: "0 0, 2px 2px",
                backgroundSize: "4px 4px, 5px 5px",
              }}
            />
            <div className="pointer-events-none absolute -top-16 left-[36%] h-44 w-44 rounded-full bg-coral/20" aria-hidden="true" />
            <div className="pointer-events-none absolute left-[4%] top-[22%] hidden h-52 w-[35%] rotate-[-1deg] sm:block" aria-hidden="true">
              <ScenicPanel className="inset-0 rounded-sm" />
            </div>

            <div className="pointer-events-none absolute left-4 top-24 hidden text-[3.5rem] leading-none text-[#214232] sm:block" aria-hidden="true">🌴</div>
            <div className="pointer-events-none absolute left-[34%] top-[23%] hidden text-4xl text-sun sm:block" aria-hidden="true">✦</div>
            <div className="pointer-events-none absolute left-[37%] top-[38%] hidden text-3xl text-sun sm:block" aria-hidden="true">✦</div>

            <div className="pointer-events-none absolute right-4 top-20 hidden w-24 rotate-[2deg] space-y-3 sm:block" aria-hidden="true">
              <Stamp className="h-24 bg-coral/10">
                <div className="mb-2 text-3xl">🌴</div>
                brighter days
              </Stamp>
              <Stamp className="bg-[#f2e2b8] text-[0.48rem] leading-5">
                luggage<br />good vibes<br />brighter days<br /><span className="text-xl">✈</span>
              </Stamp>
              <Stamp className="h-20 bg-pool/15">
                travel<br />brighter
              </Stamp>
            </div>

            <div className="pointer-events-none absolute right-[22%] top-4 hidden h-20 w-20 rounded-full border-2 border-coral text-center text-[0.52rem] font-black uppercase tracking-[0.12em] text-coral sm:grid sm:place-items-center" aria-hidden="true">
              <span>good bags<br /><span className="text-xl">🌴</span><br />brighter days</span>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border-2 border-foreground bg-paper/80 transition hover:bg-sun"
                aria-label="Close 10% offer"
              >
                <X size={24} />
              </button>
            </Dialog.Close>

            <div className="relative z-10 px-5 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
              <div className="flex min-h-[74px] items-center pr-14 sm:w-[38%] sm:pr-0">
                <img
                  src={logoTransparent}
                  alt="LOCKHABIT Soap and Body Care"
                  className="h-[66px] w-[190px] object-contain object-left mix-blend-multiply sm:h-[74px]"
                />
              </div>

              <div className="mx-auto mt-4 max-w-[470px] text-center sm:ml-[34%] sm:mr-[13%] sm:mt-0">
                <Dialog.Title className="font-slab text-[2.6rem] uppercase leading-[.9] text-coral sm:text-[3.75rem]">
                  Check in for
                  <span className="block text-[3.55rem] text-[#173c2d] sm:text-[5.2rem]">10% off</span>
                </Dialog.Title>
                <div className="mx-auto mt-1 h-3 w-[78%] rotate-[-2deg] rounded-[50%] bg-sun" aria-hidden="true" />

                <Dialog.Description className="mx-auto mt-5 max-w-[440px] font-display text-[1.05rem] leading-[1.2] text-foreground sm:text-[1.2rem]">
                  A little something for your bag.
                  <span className="block">Add your welcome offer instantly.</span>
                </Dialog.Description>
                <p className="mt-2 text-sm text-muted-foreground">Applied automatically at checkout.</p>

                <button
                  type="button"
                  className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-4 rounded-full border-2 border-foreground bg-coral px-6 font-display text-lg font-semibold text-coral-foreground shadow-[3px_3px_0_var(--color-foreground)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-foreground)]"
                  onClick={() => onStateChange("applied")}
                >
                  Tap to Add to Bag <span aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="mt-3 font-bold underline underline-offset-4"
                  onClick={() => onStateChange("pending")}
                >
                  Maybe later
                </button>
              </div>

              <div className="mt-5 hidden items-end justify-between sm:flex">
                <div className="max-w-[230px] -rotate-6 font-display text-2xl italic text-coral" aria-hidden="true">
                  Good Bags<br />Brighter Days ♡
                </div>
                <div className="mr-[8%] max-w-[240px] border-t border-foreground/40 pt-3 text-right text-xs font-bold uppercase tracking-[0.12em]" aria-hidden="true">
                  travel brighter
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 border-t border-foreground/30 pt-4 text-center text-[0.72rem] font-semibold sm:text-sm">
                <Package size={18} />
                <span>14-day returns on unopened, unused items.</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
