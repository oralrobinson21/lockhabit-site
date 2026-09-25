import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const inputSchema=z.object({slug:z.string().min(1).max(80),landingPath:z.string().max(500).default("/")});
export const captureCreatorReferral=createServerFn({method:"POST"}).validator((d:{slug:string;landingPath:string})=>inputSchema.parse(d)).handler(async({data})=>{
 const url=process.env['VITE_SUPABASE_URL']; const key=process.env['VITE_SUPABASE_ANON_KEY'];
 if(!url||!key) return {ok:false as const};
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:rows,error}=await client.rpc("capture_creator_referral",{p_slug:data.slug,p_landing_path:data.landingPath,p_referrer_host:null,p_user_agent_hash:null});
 if(error||!rows?.[0]) return {ok:false as const};
 return {ok:true as const,token:String(rows[0].attribution_token),expiresAt:String(rows[0].expires_at)};
});
