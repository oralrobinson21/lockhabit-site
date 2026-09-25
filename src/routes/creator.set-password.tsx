import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { CreatorAuthShell } from "@/components/creator-auth-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/creator/set-password")({
 head:()=>({meta:[{title:"Set Creator Password · LOCKHABIT"},{name:"robots",content:"noindex,nofollow"}]}), component:SetCreatorPassword
});
function SetCreatorPassword(){
 const navigate=useNavigate(); const [ready,setReady]=useState(false); const [p,setP]=useState(""); const [confirm,setConfirm]=useState(""); const [notice,setNotice]=useState(""); const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true; supabase.auth.getSession().then(({data})=>{if(active)setReady(Boolean(data.session));}); const {data}=supabase.auth.onAuthStateChange((_e,s)=>{if(active)setReady(Boolean(s));}); return()=>{active=false;data.subscription.unsubscribe();};},[]);
 async function save(e:FormEvent){e.preventDefault(); if(p!==confirm){setNotice("Passwords do not match.");return;} setBusy(true);setNotice(""); const {error}=await supabase.auth.updateUser({password:p}); if(error){setNotice("Password could not be updated. Open the newest reset/invite email and try again.");setBusy(false);return;} void navigate({to:"/creator"});}
 return <CreatorAuthShell eyebrow="Creator security" title="Make the account yours." description="Open this page from your secure LockHabit invite or password-reset email, then choose a password only you know." footer={<p className="text-sm text-muted-foreground">Already set it? <Link to="/creator/login" className="font-black text-foreground underline underline-offset-4">Sign in</Link></p>}>
  {!ready?<div className="space-y-4"><p className="text-sm">This password page needs a valid creator invite or reset session.</p><Link to="/creator/forgot-password" className="secondary-button justify-center">Request a reset email</Link></div>:
  <form className="space-y-5" onSubmit={save}><div><label htmlFor="new-password" className="memo block">New password</label><input id="new-password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={p} onChange={e=>setP(e.target.value)} className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" /></div><div><label htmlFor="confirm-password" className="memo block">Confirm new password</label><input id="confirm-password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" /></div><button disabled={busy} className="dark-button w-full justify-center"><KeyRound size={17}/>{busy?"Saving…":"Save password & continue"}</button>{notice?<p role="status" className="text-sm">{notice}</p>:null}</form>}
 </CreatorAuthShell>;
}
