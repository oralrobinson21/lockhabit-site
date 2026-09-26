import { useEffect, useRef, useState } from "react";
import {
  CheckInOffer,
  CheckInTicketButton,
  type CheckInOfferState,
} from "@/components/checkin-offer";
import { SiteHeader } from "@/components/site-header";
import { checkCheckInClaim, claimCheckInOffer } from "@/lib/checkin.functions";
import { useCart } from "@/lib/cart";
import { CHECKIN_SESSION_KEY, CHECKIN_STORAGE_KEY } from "@/lib/checkin-storage";

const REQUIRED_MS = 25_000;

function sessionToken() {
  let value = localStorage.getItem(CHECKIN_SESSION_KEY);
  if (!value || !/^[a-f0-9-]{36}$/i.test(value)) {
    value = crypto.randomUUID();
    localStorage.setItem(CHECKIN_SESSION_KEY, value);
  }
  return value;
}

type Persisted = { state: "pending" | "applied"; engagedMs: number; shown: boolean };

function readState(): Persisted {
  if (typeof window === "undefined") return { state: "pending", engagedMs: 0, shown: false };
  try {
    const parsed = JSON.parse(localStorage.getItem(CHECKIN_STORAGE_KEY) || "{}") as Partial<Persisted>;
    return {
      state: parsed.state === "applied" ? "applied" : "pending",
      engagedMs: Math.max(0, Number(parsed.engagedMs) || 0),
      shown: Boolean(parsed.shown),
    };
  } catch {
    return { state: "pending", engagedMs: 0, shown: false };
  }
}

function event(name: string) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: name });
}

export function CheckInSiteHeader() {
  const { setCartOpen, setCheckInOfferSaved } = useCart();
  const initial = useRef<Persisted | null>(null);
  if (!initial.current) initial.current = readState();
  const [state, setState] = useState<CheckInOfferState>(
    initial.current.shown ? initial.current.state : "pending",
  );
  const [visible, setVisible] = useState(initial.current.shown);
  const engaged = useRef(initial.current.engagedMs);
  const lastTick = useRef<number | null>(null);
  const openedFromSavedOffer = useRef(false);
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    if (initial.current?.state !== "applied") return;
    let active = true;
    try {
      void checkCheckInClaim({ data: { sessionToken: sessionToken() } })
        .then((result) => {
          if (active && !result.claimed) {
            setState("pending");
            setCheckInOfferSaved(false);
            localStorage.setItem(
              CHECKIN_STORAGE_KEY,
              JSON.stringify({ state: "pending", engagedMs: REQUIRED_MS, shown: true }),
            );
          }
        })
        .catch(() => {
          if (active) {
            setState("pending");
            setCheckInOfferSaved(false);
          }
        });
    } catch {
      setState("pending");
      setCheckInOfferSaved(false);
    }
    return () => {
      active = false;
    };
  }, [setCheckInOfferSaved]);

  useEffect(() => {
    if (initial.current?.shown || initial.current?.state === "applied") return;
    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible" && document.hasFocus()) {
        if (lastTick.current) engaged.current += Math.min(1000, now - lastTick.current);
        if (engaged.current >= REQUIRED_MS) {
          setState("open");
          setVisible(true);
          event("welcome_offer_shown");
          localStorage.setItem(
            CHECKIN_STORAGE_KEY,
            JSON.stringify({ state: "pending", engagedMs: REQUIRED_MS, shown: true }),
          );
          return;
        }
      }
      lastTick.current = now;
      localStorage.setItem(
        CHECKIN_STORAGE_KEY,
        JSON.stringify({ state: "pending", engagedMs: engaged.current, shown: false }),
      );
      timer = window.setTimeout(tick, 500);
    };
    let timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const change = async (next: CheckInOfferState) => {
    const resolved = next === "pending" && openedFromSavedOffer.current ? "applied" : next;
    if (next === "applied") {
      try {
        await claimCheckInOffer({ data: { sessionToken: sessionToken() } });
        setClaimError("");
      } catch {
        setClaimError("The offer could not be saved. Please try again.");
        return;
      }
    }
    const previous = state;
    setState(resolved);
    setVisible(true);
    if (next === "applied") {
      setCheckInOfferSaved(true);
      setCartOpen(true);
    }
    if (resolved === "pending" && previous === "open") event("welcome_offer_dismissed");
    if (next === "applied") event("welcome_offer_applied");
    openedFromSavedOffer.current = false;
    localStorage.setItem(
      CHECKIN_STORAGE_KEY,
      JSON.stringify({
        state: resolved === "open" ? "pending" : resolved,
        engagedMs: REQUIRED_MS,
        shown: true,
      }),
    );
  };

  const reopen = () => {
    openedFromSavedOffer.current = state === "applied";
    setState("open");
    event("welcome_offer_reopened");
  };

  return (
    <>
      <SiteHeader
        promoSlot={
          visible && state !== "open" ? (
            <CheckInTicketButton state={state} onOpen={reopen} />
          ) : undefined
        }
      />
      {visible ? (
        <CheckInOffer
          state={state}
          onStateChange={(next) => void change(next)}
          error={claimError}
        />
      ) : null}
    </>
  );
}
