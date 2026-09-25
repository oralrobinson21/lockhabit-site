import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Copy, DollarSign, KeyRound, Link2, LockKeyhole, MousePointerClick, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";
import { useState } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Creator Portal · Design Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CreatorPortal,
});

type View = "login" | "password" | "forgot" | "dashboard" | "transactions" | "payouts" | "profile";

const views: Array<[View, string]> = [
  ["login", "Login"],
  ["password", "First login"],
  ["forgot", "Forgot"],
  ["dashboard", "Dashboard"],
  ["transactions", "Transactions"],
  ["payouts", "Cash-out"],
  ["profile", "Profile"],
];

function CreatorPortal() {
  const [view, setView] = useState<View>("dashboard");
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  return (
    <main className="min-h-screen bg-[#f7edd5] text-foreground">
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 lg:px-10">
          <Link to="/" className="brand-logo" aria-label="LOCKHABIT home">
            <img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" />
          </Link>
          <div className="text-right">
            <p className="memo text-primary">Creator program</p>
            <p className="text-xs font-bold">Design handoff · demo data</p>
          </div>
        </div>
      </header>

      <div className="border-b-2 border-foreground bg-foreground p-2 text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-1">
          {views.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`rounded-full px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.08em] ${view === key ? "bg-sun text-sun-foreground" : "border border-background/30"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "login" || view === "password" || view === "forgot" ? (
        <AuthPreview view={view} />
      ) : (
        <PortalShell view={view} setView={setView} copied={copied} setCopied={setCopied} />
      )}
    </main>
  );
}

function AuthPreview({ view }: { view: Extract<View, "login" | "password" | "forgot"> }) {
  const content = {
    login: {
      eyebrow: "Welcome back",
      title: "Creator check-in.",
      body: "Use the creator account LockHabit invited you to.",
      button: "Sign in",
    },
    password: {
      eyebrow: "First login",
      title: "Make it yours.",
      body: "Your one-time invite gets replaced with a password you choose.",
      button: "Create password",
    },
    forgot: {
      eyebrow: "Account recovery",
      title: "Reset your key.",
      body: "We’ll send a secure reset link to the creator email on file.",
      button: "Send reset link",
    },
  }[view];

  return (
    <section className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl place-items-center px-5 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[1.7rem] border-2 border-foreground bg-paper shadow-[8px_8px_0_var(--color-foreground)] md:grid-cols-[.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-coral p-8 text-coral-foreground">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sun/70" />
          <p className="memo relative">LOCKHABIT partner desk</p>
          <h1 className="relative mt-5 font-slab text-5xl uppercase leading-none">Good links.<br />Brighter days.</h1>
          <p className="relative mt-6 max-w-sm text-sm">Your referral link, attributed orders, commission ledger, and cash-out status — without customer private data.</p>
        </div>
        <form className="p-7 md:p-10" onSubmit={(event) => event.preventDefault()}>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="font-display text-4xl font-semibold">{content.title}</h2>
          <p className="mt-3 text-muted-foreground">{content.body}</p>
          <label className="memo mt-7 block">Email</label>
          <input className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="creator@example.com" />
          {view !== "forgot" ? (
            <>
              <label className="memo mt-5 block">{view === "password" ? "New password" : "Password"}</label>
              <input type="password" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="••••••••••••" />
            </>
          ) : null}
          {view === "password" ? (
            <>
              <label className="memo mt-5 block">Confirm password</label>
              <input type="password" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="••••••••••••" />
            </>
          ) : null}
          <button className="dark-button mt-7 w-full justify-center"><KeyRound size={17} /> {content.button}</button>
          <p className="mt-4 text-center text-xs text-muted-foreground">Staging interaction only · Cursor wires authentication and RLS.</p>
        </form>
      </div>
    </section>
  );
}

function PortalShell({
  view,
  setView,
  copied,
  setCopied,
}: {
  view: View;
  setView: (view: View) => void;
  copied: "link" | "code" | null;
  setCopied: (copied: "link" | "code" | null) => void;
}) {
  const nav: Array<[View, string]> = [
    ["dashboard", "Overview"],
    ["transactions", "Transactions"],
    ["payouts", "Cash-out"],
    ["profile", "Profile"],
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[220px_1fr] lg:px-10">
      <aside className="h-fit rounded-2xl border-2 border-foreground bg-background p-3 shadow-[4px_4px_0_var(--color-foreground)]">
        <p className="memo px-3 py-2 text-primary">Partner desk</p>
        {nav.map(([key, label]) => (
          <button key={key} className={`block w-full rounded-xl px-3 py-3 text-left text-sm font-bold ${view === key ? "bg-sun" : "hover:bg-muted"}`} onClick={() => setView(key)}>{label}</button>
        ))}
        <div className="mt-3 border-t border-border px-3 pt-4">
          <p className="text-xs font-bold">Jessica Rivers</p>
          <p className="mt-1 text-xs text-muted-foreground">Active creator · 10%</p>
        </div>
      </aside>

      <section>
        {view === "dashboard" ? <Dashboard copied={copied} setCopied={setCopied} /> : null}
        {view === "transactions" ? <Transactions /> : null}
        {view === "payouts" ? <Payouts /> : null}
        {view === "profile" ? <Profile /> : null}
      </section>
    </div>
  );
}

function Dashboard({ copied, setCopied }: { copied: "link" | "code" | null; setCopied: (value: "link" | "code" | null) => void }) {
  return (
    <>
      <p className="eyebrow">Creator overview</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="section-title">Your link is working.</h1><p className="mt-3 text-muted-foreground">Demo data for the approved portal UX.</p></div>
        <span className="rounded-full border-2 border-foreground bg-secondary px-4 py-2 text-xs font-black uppercase">Active · 10% rate</span>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<MousePointerClick />} label="Clicks" value="1,284" note="Last 30 days" />
        <Metric icon={<ReceiptText />} label="Paid orders" value="43" note="3.35% click → order" />
        <Metric icon={<DollarSign />} label="Merchandise revenue" value="$3,827" note="After customer discounts" />
        <Metric icon={<WalletCards />} label="Available" value="$214.60" note="$118.40 pending" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border-2 border-foreground bg-background p-5">
          <p className="memo text-primary">Referral tools</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Share one link. Track the result.</h2>
          <CopyField label="Your referral link" value="https://lockhabit.com/r/jessica" copied={copied === "link"} onCopy={() => setCopied("link")} />
          <CopyField label="Creator code" value="JESSICA" copied={copied === "code"} onCopy={() => setCopied("code")} />
          <div className="mt-5 rounded-xl border-2 border-foreground bg-sun/25 p-4">
            <p className="memo">Approved disclosure language</p>
            <p className="mt-2 text-sm">“I may earn a commission if you buy through my LockHabit link.” Use a clear, conspicuous disclosure near affiliate content.</p>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-foreground bg-coral p-5 text-coral-foreground">
          <p className="memo text-coral-foreground/80">Commission status</p>
          <div className="mt-5 space-y-4">
            <Balance label="Pending" value="$118.40" note="Return-window hold" />
            <Balance label="Available" value="$214.60" note="Ready to request" />
            <Balance label="Paid" value="$1,084.25" note="Lifetime" />
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <div className="rounded-2xl border-2 border-foreground bg-background p-5 shadow-[3px_3px_0_var(--color-foreground)]"><div className="text-primary">{icon}</div><p className="memo mt-4">{label}</p><p className="mt-2 font-display text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>;
}

function CopyField({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return <div className="mt-4"><p className="memo">{label}</p><button onClick={onCopy} className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border-2 border-foreground bg-paper px-4 py-3 text-left"><span className="truncate text-sm font-bold">{value}</span><span className="flex shrink-0 items-center gap-1 text-xs font-black uppercase">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</span></button></div>;
}

function Balance({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="border-b border-coral-foreground/25 pb-4 last:border-0 last:pb-0"><div className="flex items-baseline justify-between gap-4"><span className="font-bold">{label}</span><span className="font-display text-3xl font-semibold">{value}</span></div><p className="mt-1 text-right text-xs text-coral-foreground/75">{note}</p></div>;
}

const transactionRows = [
  ["LH-000214", "$89.00", "$8.90", "Pending", "Sep 24"],
  ["LH-000207", "$76.10", "$7.61", "Available", "Sep 21"],
  ["LH-000192", "$144.50", "$14.45", "Paid", "Sep 12"],
  ["LH-000181", "$35.00", "$3.50", "Paid", "Sep 7"],
];

function Transactions() {
  return <><p className="eyebrow">Transactions</p><h1 className="section-title">Every attributed sale.</h1><p className="mt-3 text-muted-foreground">No customer PII — only the order reference and commission facts you need.</p><div className="mt-7 overflow-x-auto rounded-2xl border-2 border-foreground bg-background"><table className="min-w-full text-sm"><thead className="bg-foreground text-background"><tr>{["Order","Merchandise","Commission","Status","Date"].map((h)=><th key={h} className="px-4 py-3 text-left text-xs uppercase">{h}</th>)}</tr></thead><tbody>{transactionRows.map((row)=><tr key={row[0]} className="border-t border-border">{row.map((cell,i)=><td key={cell} className="px-4 py-4 font-semibold">{i===3?<span className="rounded-full bg-muted px-3 py-1 text-xs">{cell}</span>:cell}</td>)}</tr>)}</tbody></table></div></>;
}

function Payouts() {
  return <><p className="eyebrow">Cash-out</p><h1 className="section-title">Available means available.</h1><div className="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border-2 border-foreground bg-sun p-6"><p className="memo">Available balance</p><p className="mt-3 font-display text-5xl font-semibold">$214.60</p><p className="mt-2 text-sm">Minimum cash-out: $20</p><button className="dark-button mt-6 w-full justify-center"><WalletCards size={17}/> Request payout</button></div><div className="rounded-2xl border-2 border-foreground bg-background p-6"><p className="memo">Payout history</p><div className="mt-4 space-y-3">{[["Sep 10","$165.20","Paid"],["Aug 23","$98.40","Paid"],["Aug 4","$72.15","Paid"]].map(([date,amount,status])=><div key={date} className="flex items-center justify-between border-b border-border pb-3"><div><p className="font-bold">{amount}</p><p className="text-xs text-muted-foreground">{date}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{status}</span></div>)}</div></div></div></>;
}

function Profile() {
  return <><p className="eyebrow">Profile + compliance</p><h1 className="section-title">Keep the account payout-ready.</h1><div className="mt-7 grid gap-5 md:grid-cols-2"><ProfileCard icon={<LockKeyhole/>} title="Security" rows={["Email: jessica@example.com","Password: ••••••••••••","Last sign-in: Sep 25"]}/><ProfileCard icon={<WalletCards/>} title="Payout preference" rows={["Method: Manual business payout","Minimum: $20","Status: Ready"]}/><ProfileCard icon={<ShieldCheck/>} title="Tax profile" rows={["Status: Complete (demo)","Payout gate: Clear","Sensitive tax values are never shown here"]}/><ProfileCard icon={<Link2/>} title="Partner agreement" rows={["Agreement: Accepted","Disclosure guidance: Viewed","Commission rate: 10%"]}/></div></>;
}

function ProfileCard({ icon, title, rows }: { icon: React.ReactNode; title: string; rows: string[] }) {
  return <div className="rounded-2xl border-2 border-foreground bg-background p-5"><div className="text-primary">{icon}</div><h2 className="mt-3 font-display text-2xl font-semibold">{title}</h2><div className="mt-4 space-y-2 text-sm">{rows.map((row)=><p key={row} className="rounded-lg bg-muted px-3 py-2">{row}</p>)}</div><button className="secondary-button mt-5">Manage <ArrowUpRight size={15}/></button></div>;
}
