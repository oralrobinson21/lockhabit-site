import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CirclePause, MailPlus, MoreHorizontal, Search, Send, UserCheck, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export const Route = createFileRoute("/owner/creator-program")({
  head: () => ({
    meta: [
      { title: "LOCKHABIT Creator Admin · Design Handoff" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OwnerCreatorProgram,
});

type Tab = "creators" | "payouts" | "outreach";

const creators = [
  { name: "Jessica Rivers", email: "jessica@example.com", status: "Active", code: "JESSICA", clicks: 1284, orders: 43, revenue: 3827, pending: 118.4, available: 214.6, paid: 1084.25, compliance: "Ready" },
  { name: "Maya Fields", email: "maya@example.com", status: "Approved", code: "MAYA", clicks: 398, orders: 12, revenue: 1034, pending: 54.2, available: 27.8, paid: 180.3, compliance: "Ready" },
  { name: "Drew Coast", email: "drew@example.com", status: "Applicant", code: "DREW", clicks: 0, orders: 0, revenue: 0, pending: 0, available: 0, paid: 0, compliance: "Needs tax profile" },
  { name: "Sunny Rituals", email: "hello@sunnyrituals.example", status: "Paused", code: "SUNNY", clicks: 902, orders: 21, revenue: 1689, pending: 0, available: 0, paid: 624.55, compliance: "Ready" },
];

const outreach = [
  { name: "Glow With Ana", platform: "TikTok", niche: "Clean beauty", followers: "86K", stage: "Interested", last: "Sep 24" },
  { name: "The Shower Edit", platform: "Blog", niche: "Body care", followers: "42K/mo", stage: "Responded", last: "Sep 23" },
  { name: "Mornings With Mel", platform: "Instagram", niche: "Wellness", followers: "118K", stage: "Contacted", last: "Sep 22" },
  { name: "Routine Notes", platform: "YouTube", niche: "Skin care", followers: "64K", stage: "Prospect", last: "—" },
];

function OwnerCreatorProgram() {
  const [tab, setTab] = useState<Tab>("creators");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(creators[0]!);

  const filtered = useMemo(
    () => creators.filter((creator) => (creator.name + " " + creator.email + " " + creator.code).toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <main className="min-h-screen bg-[#f5efe2] text-foreground">
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 lg:px-10">
          <Link to="/" className="brand-logo"><img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" /></Link>
          <div className="text-right"><p className="memo text-primary">Owner tools</p><p className="text-xs font-bold">Creator program · demo only</p></div>
        </div>
      </header>

      <div className="border-b-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 py-2 lg:px-10">
          {([["creators","Creators"],["payouts","Payout queue"],["outreach","Outreach"]] as const).map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase ${tab===key ? "bg-sun text-sun-foreground" : "border border-background/30"}`}>{label}</button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        {tab === "creators" ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="eyebrow">A06 / Creator administration</p><h1 className="section-title">Simple enough to run daily.</h1></div>
              <button className="primary-button"><MailPlus size={17}/> Invite creator</button>
            </div>
            <div className="mt-7 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
              <div className="overflow-hidden rounded-2xl border-2 border-foreground bg-background">
                <div className="flex items-center gap-2 border-b-2 border-foreground p-4">
                  <Search size={18}/>
                  <input value={query} onChange={(e)=>setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search creator, email, or code" />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted"><tr>{["Creator","Status","Orders","Revenue","Available",""].map((h)=><th key={h} className="px-4 py-3 text-left text-xs uppercase">{h}</th>)}</tr></thead>
                    <tbody>
                      {filtered.map((creator)=>(
                        <tr key={creator.email} className={`border-t border-border ${selected.email===creator.email ? "bg-sun/20" : ""}`}>
                          <td className="px-4 py-4"><button className="text-left" onClick={()=>setSelected(creator)}><p className="font-bold">{creator.name}</p><p className="text-xs text-muted-foreground">{creator.email}</p></button></td>
                          <td className="px-4 py-4"><Status value={creator.status}/></td>
                          <td className="px-4 py-4 font-bold">{creator.orders}</td>
                          <td className="px-4 py-4 font-bold">{"$" + creator.revenue.toFixed(2)}</td>
                          <td className="px-4 py-4 font-bold">{"$" + creator.available.toFixed(2)}</td>
                          <td className="px-4 py-4"><button className="icon-button h-9 w-9"><MoreHorizontal size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <CreatorDetail creator={selected}/>
            </div>
          </>
        ) : null}

        {tab === "payouts" ? <PayoutQueue/> : null}
        {tab === "outreach" ? <Outreach/> : null}
      </section>
    </main>
  );
}

function Status({ value }: { value: string }) {
  const style = value === "Active" ? "bg-secondary" : value === "Approved" ? "bg-sun" : value === "Paused" ? "bg-muted" : "bg-coral/20";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${style}`}>{value}</span>;
}

function CreatorDetail({ creator }: { creator: typeof creators[number] }) {
  return (
    <aside className="rounded-2xl border-2 border-foreground bg-paper p-5 shadow-[4px_4px_0_var(--color-foreground)]">
      <div className="flex items-start justify-between gap-3"><div><p className="memo text-primary">Creator detail</p><h2 className="mt-2 font-display text-2xl font-semibold">{creator.name}</h2><p className="text-sm text-muted-foreground">{creator.email}</p></div><Status value={creator.status}/></div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Mini label="Code" value={creator.code}/>
        <Mini label="Commission" value="10%"/>
        <Mini label="Clicks" value={creator.clicks.toLocaleString()}/>
        <Mini label="Orders" value={creator.orders.toString()}/>
        <Mini label="Pending" value={"$" + creator.pending.toFixed(2)}/>
        <Mini label="Available" value={"$" + creator.available.toFixed(2)}/>
      </div>
      <div className="mt-5 rounded-xl border-2 border-foreground bg-background p-4">
        <p className="memo">Compliance</p>
        <p className="mt-2 flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={17} className="text-primary"/>{creator.compliance}</p>
        <p className="mt-2 text-xs text-muted-foreground">Agreement, disclosure guidance, and tax-profile status gate payouts. Self-purchases are allowed by business rule; commission still follows the 14-day refund hold.</p>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button className="secondary-button justify-center"><UserCheck size={15}/> Approve / activate</button>
        <button className="secondary-button justify-center"><CirclePause size={15}/> Pause</button>
        <button className="secondary-button justify-center">Reset invite</button>
        <button className="secondary-button justify-center">Edit rate</button>
      </div>
    </aside>
  );
}

function Mini({label,value}:{label:string;value:string}) {
  return <div className="rounded-xl bg-muted p-3"><p className="memo text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-semibold">{value}</p></div>;
}

function PayoutQueue() {
  const rows: Array<[string, string, string, string]> = [["Jessica Rivers","$214.60","Requested","Sep 25"],["Maya Fields","$27.80","Approved","Sep 24"],["Sunny Rituals","$122.10","Paid","Sep 20"]];
  return (
    <>
      <p className="eyebrow">Payout queue</p><h1 className="section-title">Requested → approved → paid.</h1><p className="mt-3 max-w-2xl text-muted-foreground">The ledger stays authoritative; this screen is the owner’s operational queue.</p>
      <div className="mt-7 overflow-x-auto rounded-2xl border-2 border-foreground bg-background">
        <table className="min-w-full text-sm"><thead className="bg-foreground text-background"><tr>{["Creator","Amount","Status","Requested","Actions"].map((h)=><th key={h} className="px-4 py-3 text-left text-xs uppercase">{h}</th>)}</tr></thead>
        <tbody>{rows.map(([name,amount,status,date])=><tr key={name} className="border-t border-border"><td className="px-4 py-4 font-bold">{name}</td><td className="px-4 py-4 font-bold">{amount}</td><td className="px-4 py-4"><Status value={status}/></td><td className="px-4 py-4">{date}</td><td className="px-4 py-4"><div className="flex gap-2"><button className="rounded-full border-2 border-foreground px-3 py-1 text-xs font-bold">Approve</button><button className="rounded-full border-2 border-foreground px-3 py-1 text-xs font-bold">Mark paid</button></div></td></tr>)}</tbody></table>
      </div>
      <div className="mt-5 rounded-2xl border-2 border-foreground bg-sun/30 p-5"><div className="flex items-center gap-3"><WalletCards/><div><p className="font-bold">Payout execution stays manual in v1.</p><p className="text-sm text-muted-foreground">Record method, reference, date, and notes so Stripe Connect can plug into the same ledger later.</p></div></div></div>
    </>
  );
}

function Outreach() {
  const [stage,setStage]=useState("All");
  const stages=["All","Prospect","Contacted","Responded","Interested","Approved","Active"];
  const filtered=stage==="All"?outreach:outreach.filter((p)=>p.stage===stage);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Outreach tracker</p><h1 className="section-title">From prospect to partner.</h1></div><button className="primary-button"><Send size={16}/> Add prospect</button></div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{stages.map((s)=><button key={s} onClick={()=>setStage(s)} className={`shrink-0 rounded-full border-2 border-foreground px-4 py-2 text-xs font-black ${stage===s?"bg-sun":"bg-background"}`}>{s}</button>)}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {filtered.map((prospect)=>(
          <article key={prospect.name} className="rounded-2xl border-2 border-foreground bg-background p-5 shadow-[3px_3px_0_var(--color-foreground)]">
            <div className="flex items-start justify-between gap-4"><div><p className="font-display text-2xl font-semibold">{prospect.name}</p><p className="mt-1 text-sm text-muted-foreground">{prospect.platform} · {prospect.niche} · {prospect.followers}</p></div><Status value={prospect.stage}/></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-muted p-3"><p className="memo">Last contacted</p><p className="mt-1 font-bold">{prospect.last}</p></div><div className="rounded-xl bg-muted p-3"><p className="memo">Next step</p><p className="mt-1 font-bold">{prospect.stage==="Interested"?"Approve creator":"Follow up"}</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2"><button className="secondary-button">Open notes</button><button className="secondary-button">{prospect.stage==="Interested"?"Approve Creator":"Move stage"}</button></div>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border-2 border-foreground bg-paper p-5"><p className="memo">Owner rule</p><p className="mt-2 text-sm">Store outreach templates here, but sending remains deliberate rather than uncontrolled bulk spam.</p></div>
    </>
  );
}
