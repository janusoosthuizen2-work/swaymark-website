/* Cloudflare Pages Function at POST /api/enquiry.
   Fail closed until separate SWAYMARK project secrets are configured.
   DO NOT switch the live website form until end-to-end testing. */
const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex"}});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validMail=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean=(value,max=200)=>typeof value==="string"?value.trim().slice(0,max):"";
async function readLimitedJson(request,max=15000){
  const length=Number(request.headers.get("content-length")||0);
  if(length>max)throw new Error("too_large");
  if(!request.body)throw new Error("empty");
  const reader=request.body.getReader();
  const decoder=new TextDecoder();
  let raw="",read=0;
  try {
    for(;;){
      const {done,value}=await reader.read();if(done)break;
      read+=value.byteLength;
      if(read>max){await reader.cancel();throw new Error("too_large");}
      raw+=decoder.decode(value,{stream:true});
    }
    raw+=decoder.decode();
    return JSON.parse(raw);
  }finally{try{reader.releaseLock();}catch(_){}}
}
export async function onRequestPost({request,env}) {
  const url=clean(env.SUPABASE_URL,120).replace(/\/+$/,"");
  const secret=clean(env.SUPABASE_SECRET_KEY,300);
  const owner=clean(env.SWAYMARK_OWNER_UID,70);
  const turnstile=clean(env.TURNSTILE_SECRET_KEY,300);
  const allowedOrigin=clean(env.SWAYMARK_SITE_ORIGIN,200)||"https://swaymark.pages.dev";
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)||!secret.startsWith("sb_secret_")||!UUID.test(owner)||!turnstile)
    return reply(503,{ok:false,error:"Enquiry integration is not configured."});
  if(request.headers.get("origin")!==allowedOrigin)
    return reply(403,{ok:false,error:"Invalid submission origin."});
  if(!String(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))
    return reply(415,{ok:false,error:"JSON request required."});
  let body;
  try{body=await readLimitedJson(request);}
  catch(error){return reply(error.message==="too_large"?413:400,{ok:false,error:"Invalid or oversized form submission."});}
  if(!body||typeof body!=="object"||Array.isArray(body))
    return reply(400,{ok:false,error:"Invalid form."});
  if(clean(body.honey||body._honey))return reply(200,{ok:true});
  const name=clean(body.name,120),email=clean(body.email,180).toLowerCase(),message=clean(body.message,2000);
  const token=clean(body.turnstileToken,2100);
  if(name.length<2||!validMail.test(email)||message.length<10||!token||body.consent!==true)
    return reply(400,{ok:false,error:"Please complete the required fields and consent."});
  let check;
  try {
    const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({secret:turnstile,response:token,remoteip:request.headers.get("CF-Connecting-IP")||undefined})
    });
    check=await verify.json();
  }catch(_){return reply(503,{ok:false,error:"Spam verification is temporarily unavailable."});}
  if(!check||check.success!==true||check.hostname!==new URL(allowedOrigin).hostname)
    return reply(403,{ok:false,error:"Spam verification failed. Please retry."});
  const payload={name,email,phone:clean(body.phone,80),business:clean(body.business,140),
    service:clean(body.service,120),source:"Website",timeframe:clean(body.timeframe,100),
    status:"New",followup:"",message};
  try{
    const save=await fetch(url+"/rest/v1/swaymark_items",{
      method:"POST",headers:{"apikey":secret,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify({owner_id:owner,kind:"enquiries",payload})
    });
    if(!save.ok)return reply(503,{ok:false,error:"Unable to save enquiry. Please try again."});
    return reply(201,{ok:true,redirect:"/thanks"});
  }catch(_){return reply(503,{ok:false,error:"Unable to save enquiry. Please try again."});}
}
export function onRequestGet(){return reply(405,{ok:false,error:"Method not allowed."});}
