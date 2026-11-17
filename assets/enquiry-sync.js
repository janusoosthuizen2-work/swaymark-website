// SWAYMARK contact form: when enabled, securely mirror enquiries to HQ.
// The original FormSubmit submission is always the email fallback.
(() => {
  "use strict";
  const form=document.querySelector("[data-enquiry-form]");
  const sync=window.SWAYMARK_CONFIG?.hqSync;
  if(!form||!sync||sync.enabled!==true||typeof sync.siteKey!=="string"||!/^[a-zA-Z0-9_-]{12,150}$/.test(sync.siteKey))return;
  const ENDPOINT="https://glopetsbjaoxutjghgdo.supabase.co/functions/v1/swaymark-public-enquiry";
  const area=form.querySelector(".form-actions");
  if(!area)return;
  const widget=document.createElement("div");widget.className="sw-sync-captcha";widget.setAttribute("aria-label","Security verification");
  const status=document.createElement("p");status.className="sw-sync-status";status.setAttribute("aria-live","polite");
  status.textContent="Secure enquiry syncing is enabled. Email delivery remains your backup.";
  area.prepend(status);area.prepend(widget);
  let token="",busy=false,ready=false;
  const sendEmail=()=>HTMLFormElement.prototype.submit.call(form);
  const script=document.createElement("script");
  script.async=true;script.defer=true;
  script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.addEventListener("load",()=>{
    if(!window.turnstile?.render)return;
    try {
      window.turnstile.render(widget,{
        sitekey:sync.siteKey,action:"swaymark_contact",
        callback:v=>{token=v;status.textContent="Security check passed. Your enquiry can be saved to SWAYMARK HQ.";},
        "expired-callback":()=>{token="";status.textContent="Security check expired. Complete it again to sync to SWAYMARK HQ.";},
        "error-callback":()=>{token="";status.textContent="App security check is unavailable; the email form remains available.";},
        "timeout-callback":()=>{token="";}
      });
      ready=true;
    }catch{status.textContent="The app security check is unavailable; you can still submit by email.";}
  });
  script.addEventListener("error",()=>{status.textContent="App security check unavailable. Enquiries can still be submitted by email.";});
  document.head.append(script);
  form.addEventListener("submit",async event=>{
    if(busy){event.preventDefault();return;}
    if(!ready||!token)return; // Default HTML form keeps email available.
    event.preventDefault();if(!form.reportValidity())return;
    busy=true;
    const button=form.querySelector('button[type="submit"]');
    if(button)button.disabled=true;
    status.textContent="Saving your enquiry securely…";
    const data=new FormData(form);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),9000);
    try{
      const resp=await fetch(ENDPOINT,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:String(data.get("name")||""),email:String(data.get("email")||""),
          business:String(data.get("business")||""),service:String(data.get("service")||""),
          timeframe:String(data.get("timeframe")||""),message:String(data.get("message")||""),
          honey:String(data.get("_honey")||""),
          consent:data.get("privacy_ack")==="on",turnstileToken:token
        }),
        cache:"no-store",signal:controller.signal
      });
      if(resp.ok){const result=await resp.json();if(result?.synced===true)status.textContent="Your enquiry is saved in SWAYMARK HQ. Sending the email copy…";}
      else status.textContent="App sync is unavailable. Your enquiry will still be sent by email.";
    }catch{status.textContent="App sync could not be confirmed. Sending your enquiry by email.";}
    finally{clearTimeout(timeout);sendEmail();}
  });
})();