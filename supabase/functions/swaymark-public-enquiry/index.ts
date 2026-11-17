// SWAYMARK HQ: protected public lead intake (owner only). Requires Turnstile.
// Deploy with verify_jwt=false. Supabase injects the admin key as a server-side secret.
const ORIGIN="https://swaymark.pages.dev";
const OWNER_ID="ceefdeb8-7358-4ece-969a-2505f373d0f5";
const API="https://glopetsbjaoxutjghgdo.supabase.co";
const HEAD={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Max-Age":"600","Vary":"Origin","Cache-Control":"no-store"};
const clean=(v,n=200)=>typeof v==="string"?v.trim().slice(0,n):"";
function response(status,obj){return Response.json(obj,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex",...HEAD}});}
async function bodyJson(req){
 if(Number(req.headers.get("content-length")||0)>12000)throw Error("large");
 if(!req.body)throw Error("empty");
 const reader=req.body.getReader(),decoder=new TextDecoder();let raw="",size=0;
 try{for(;;){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>12000){await reader.cancel();throw Error("large");}raw+=decoder.decode(r.value,{stream:true});}raw+=decoder.decode();return JSON.parse(raw);}
 finally{try{reader.releaseLock();}catch{}}
}
Deno.serve(async req=>{
 if(req.headers.get("origin")!==ORIGIN)return Response.json({ok:false,error:"Origin not allowed"},{status:403});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:HEAD});
 if(req.method!=="POST")return response(405,{ok:false,error:"Method not allowed"});
 if(!String(req.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return response(415,{ok:false,error:"JSON required"});
 let b;try{b=await bodyJson(req);}catch(err){return response(err.message==="large"?413:400,{ok:false,error:"Invalid request"});}
 if(!b||typeof b!=="object"||Array.isArray(b))return response(400,{ok:false,error:"Invalid submission"});
 if(clean(b._honey||b.honey))return response(200,{ok:true});
 const name=clean(b.name,120),email=clean(b.email,180).toLowerCase(),message=clean(b.message,2000),business=clean(b.business,140),service=clean(b.service,120),timeframe=clean(b.timeframe,100),token=clean(b.turnstileToken,2500);
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||message.length<10||!service||b.consent!==true||token.length<10)return response(400,{ok:false,error:"Complete the required fields and security check"});
 const secret=clean(Deno.env.get("SWAYMARK_TURNSTILE_SECRET"),500);
 if(!secret)return response(503,{ok:false,error:"App intake is not activated"});
 let check;try{
 const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret,response:token})});
 if(!r.ok)throw Error("unavailable");check=await r.json();
 }catch{return response(503,{ok:false,error:"Security check unavailable"});}
 if(!check?.success||check.hostname!=="swaymark.pages.dev"||check.action!=="swaymark_contact")return response(403,{ok:false,error:"Security check failed"});
 let key;try{key=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");}catch{key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");}
 if(!key)return response(503,{ok:false,error:"App storage unavailable"});
 const payload={name,email,business,service,timeframe,source:"Website",status:"New",followup:"",notes:message,message,consentAt:new Date().toISOString(),sourceWebsite:ORIGIN};
 try{
 const r=await fetch(API+"/rest/v1/swaymark_items",{method:"POST",headers:{"apikey":key,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({owner_id:OWNER_ID,kind:"enquiries",payload})});
 if(!r.ok){console.error("Enquiry save status",r.status);return response(503,{ok:false,error:"App sync unavailable"});}
 return response(201,{ok:true,synced:true});
 }catch{return response(503,{ok:false,error:"App sync unavailable"});}
});