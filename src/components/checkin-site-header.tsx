import { useEffect, useRef, useState } from "react";
import { CheckInOffer, CheckInTicketButton, type CheckInOfferState } from "@/components/checkin-offer";
import { SiteHeader } from "@/components/site-header";

const STORAGE_KEY = "lockhabit_checkin_offer_v1";
const REQUIRED_MS = 25_000;

type Persisted = { state: "pending" | "applied"; engagedMs: number; shown: boolean };

function readState(): Persisted {
  if (typeof window === "undefined") return { state: "pending", engagedMs: 0, shown: false };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<Persisted>;
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
  const initial = useRef<Persisted | null>(null);
  if (!initial.current) initial.current = readState();
  const [state, setState] = useState<CheckInOfferState>(initial.current.shown ? initial.current.state : "pending");
  const [visible, setVisible] = useState(initial.current.shown);
  const engaged = useRef(initial.current.engagedMs);
  const lastTick = useRef<number | null>(null);

  useEffect(() => {
    if (initial.current?.shown || initial.current?.state === "applied") return;
    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible" && document.hasFocus()) {
        if (lastTick.current) engaged.current += Math.min(1000, now - lastTick.current);
        if (engaged.current >= REQUIRED_MS) {
          setState("open");
          setVisible(true);
          event("checkin_offer_shown");
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: "pending", engagedMs: REQUIRED_MS, shown: true }));
          return;
        }
      }
      lastTick.current = now;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: "pending", engagedMs: engaged.current, shown: false }));
      timer = window.setTimeout(tick, 500);
    };
    let timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const change = (next: CheckInOfferState) => {
    const previous = state;
    setState(next);
    setVisible(true);
    if (next === "pending" && previous === "open") event("checkin_offer_dismissed");
    if (next === "applied") event("checkin_offer_applied");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: next === "open" ? "pending" : next, engagedMs: REQUIRED_MS, shown: true }));
  };

  const reopen = () => {
    setState("open");
    event("checkin_offer_reopened");
  };

  return (
    <>
      <SiteHeader promoSlot={visible && state !== "open" ? <CheckInTicketButton state={state} onOpen={reopen} /> : undefined} />
      {visible ? <CheckInOffer state={state} onStateChange={change} /> : null}
    </>
  );
}
