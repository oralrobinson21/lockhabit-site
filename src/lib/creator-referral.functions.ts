import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema=z.object({slug:z.string().min(1).max(80),landingPath:z.string().max(500).default("/")});
export const captureCreatorReferral=createServerFn({method:"POST"}).validator((d:{slug:string;landingPath:string})=>inputSchema.parse(d)).handler(async({data})=>{
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const {data:rows,error}=await supabaseAdmin.rpc("capture_creator_referral",{p_slug:data.slug,p_landing_path:data.landingPath,p_referrer_host:null,p_user_agent_hash:null});
 if(error||!rows?.[0]) return {ok:false as const};
 return {ok:true as const,token:String(rows[0].attribution_token),expiresAt:String(rows[0].expires_at)};
});
