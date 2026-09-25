import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, LogOut } from "lucide-react";
import { useState } from "react";
import logoTransparent from "@/assets/lockhabit-logo-transparent.png";
import { getCreatorDashboard, requestCreatorPayout } from "@/lib/creator.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/creator/")({
  head: () => ({ meta: [{ title: "LOCKHABIT Creator Portal" }, { name: "robots", content: "noindex,nofollow" }] }),
  loader: async () => getCreatorDashboard(),
  component: CreatorPortal,
});

const money=(c:number|null|undefined)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format((c||0)/100);

function CreatorPortal(){
  const data=Route.useLoaderData();
  const navigate=useNavigate();
  const [amount,setAmount]=useState("");
  const [notice,setNotice]=useState("");
  const p=data.profile, s=data.summary;
  const link=`https://lockhabit.com/r/${p.referral_slug}`;
  const copy=async(v:string)=>{await navigator.clipboard.writeText(v);setNotice("Copied.");};
  const payout=async()=>{setNotice("");try{const cents=Math.round(Number(amount)*100);await requestCreatorPayout({data:{amountCents:cents}});setNotice("Cash-out request submitted.");setAmount("");}catch(e){setNotice(e instanceof Error?e.message:"Request failed.");}};
  const signout=async()=>{await supabase.auth.signOut();navigate({to:"/creator/login"});};
  return <main className="min-h-screen bg-[#f7edd5] text-foreground">
    <header className="border-b-2 border-foreground bg-background"><div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
      <Link to="/" className="brand-logo"><img src={logoTransparent} alt="LOCKHABIT Soap and Body Care"/></Link>
      <button className="secondary-button" onClick={signout}><LogOut size={16}/> Sign out</button>
    </div></header>
    <section className="mx-auto max-w-7xl px-5 py-9 lg:px-10">
      <p className="eyebrow">Creator program</p><h1 className="section-title">Welcome, {p.display_name || p.username || "creator"}.</h1>
      <p className="mt-2 text-muted-foreground">Status: <b>{p.status}</b> · Commission rate: <b>{(p.commission_bps/100).toFixed(0)}%</b></p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Clicks" value={String(s?.clicks||0)}/><Metric label="Paid orders" value={String(s?.paid_orders||0)}/><Metric label="Merchandise revenue" value={money(s?.merchandise_cents)}/>
        <Metric label="Pending" value={money(s?.pending_cents)}/><Metric label="Available" value={money(s?.available_cents)}/><Metric label="Paid" value={money(s?.paid_cents)}/>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-foreground bg-background p-5"><p className="memo text-primary">Referral tools</p><h2 className="mt-2 font-display text-2xl font-semibold">Your referral link</h2>
          <div className="mt-4 flex gap-2"><input readOnly value={link} className="min-w-0 flex-1 rounded-xl border-2 border-foreground px-3 py-2"/><button className="secondary-button" onClick={()=>copy(link)}><Copy size={16}/></button></div>
          <div className="mt-3 flex gap-2"><input readOnly value={p.referral_code} className="min-w-0 flex-1 rounded-xl border-2 border-foreground px-3 py-2"/><button className="secondary-button" onClick={()=>copy(p.referral_code)}><Copy size={16}/></button></div>
          <p className="mt-4 text-sm">Disclosure: “I may earn a commission if you buy through my LockHabit link.”</p>
        </div>
        <div className="rounded-2xl border-2 border-foreground bg-background p-5"><p className="memo text-primary">Cash-out</p><h2 className="mt-2 font-display text-2xl font-semibold">{money(s?.available_cents)} available</h2><p className="mt-2 text-sm text-muted-foreground">$20 minimum.</p>
          <div className="mt-4 flex gap-2"><input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" placeholder="Amount" className="min-w-0 flex-1 rounded-xl border-2 border-foreground px-3 py-2"/><button className="dark-button" onClick={payout}>Request</button></div>
        </div>
      </div>
      {notice?<p className="mt-4 font-bold">{notice}</p>:null}
      <div className="mt-7 rounded-2xl border-2 border-foreground bg-background p-5"><h2 className="font-display text-2xl font-semibold">Commission activity</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="py-2">Date</th><th>Type</th><th>Status</th><th className="text-right">Amount</th></tr></thead><tbody>{data.transactions.map(t=><tr key={t.id} className="border-t"><td className="py-3">{new Date(t.created_at).toLocaleDateString()}</td><td>{t.entry_type}</td><td>{t.status}</td><td className="text-right">{money(t.amount_cents)}</td></tr>)}</tbody></table></div>
      </div>
    </section>
  </main>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border-2 border-foreground bg-background p-5 shadow-[3px_3px_0_var(--color-foreground)]"><p className="memo text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-semibold">{value}</p></div>}
