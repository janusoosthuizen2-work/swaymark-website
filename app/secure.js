/* SWAYMARK Business Hub secure cloud client (no third-party runtime dependencies).
   Records are never cached locally; Supabase RLS protects per-owner records.
   Browser config uses ONLY the publishable key. */
(() => {
"use strict";
const config=window.SWAYMARK_APP_CONFIG||{};
const endpoint=String(config.supabaseUrl||"").replace(/\/+$/,"");
const publishableKey=String(config.publishableKey||"");
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(endpoint)&&publishableKey.startsWith("sb_publishable_");
const KIND=["enquiries","clients","quotes","bookings","projects","tasks","finance"];
const CURRENCIES=["ZAR","AUD","USD","GBP","EUR"];
const defs={
 enquiries:{name:"Enquiries",singular:"enquiry",description:"New conversations, service requests and follow-ups from one place.",columns:[["name","Name"],["service","Interested in"],["source","Source"],["status","Status"],["followup","Follow-up"]],fields:[
 ["name","Contact name","text",true],["email","Email address","email"],["phone","Phone number","tel"],["service","Service","select",true,["New website","Website redesign","Website maintenance","SEO & Google visibility","Digital marketing","Social media & content","Performance & analytics","A mix of services","Other"]],["source","Source","select",false,["Website","Email","Phone","Social media","Referral","Other"]],["status","Enquiry stage","select",false,["New","Contacted","Quoted","Won","Closed"]],["followup","Follow-up date","date"],["message","Project details","textarea"]]},
 clients:{name:"Clients",singular:"client",description:"Contacts and businesses with their associated projects.",columns:[["name","Contact"],["business","Business"],["email","Email"],["phone","Phone"]],fields:[
 ["name","Contact name","text",true],["business","Business name","text"],["email","Email address","email"],["phone","Phone number","tel"],["notes","Notes","textarea"]]},
 quotes:{name:"Quotes",singular:"quote",description:"Prepare, print and track quotes for clients.",columns:[["title","Quote"],["clientId","Client"],["amount","Amount"],["status","Stage"],["validUntil","Valid until"]],fields:[
 ["title","Quote title","text",true],["clientId","Client","client"],["amount","Amount","number",true],["status","Stage","select",false,["Draft","Sent","Accepted","Declined"]],["validUntil","Valid until","date"],["notes","Scope, inclusions and exclusions","textarea"]]},
 bookings:{name:"Bookings",singular:"booking",description:"Calls and project sessions, stored in your private workspace.",columns:[["service","Booking"],["clientId","Client"],["date","Date"],["time","Time"],["status","Status"]],fields:[
 ["service","Booking title","text",true],["clientId","Client","client"],["date","Date","date",true],["time","Time","time"],["status","Stage","select",false,["Planned","Confirmed","Completed","Cancelled"]],["notes","Agenda","textarea"]]},
 projects:{name:"Projects",singular:"project",description:"Keep every website and marketing project on track.",columns:[["title","Project"],["clientId","Client"],["deadline","Deadline"],["status","Stage"],["budget","Value"]],fields:[
 ["title","Project name","text",true],["clientId","Client","client"],["deadline","Target completion","date"],["status","Stage","select",false,["Planning","In progress","Waiting","Completed"]],["budget","Agreed value","number"],["notes","Deliverables and notes","textarea"]]},
 tasks:{name:"Tasks",singular:"task",description:"Track tasks without losing completed history.",columns:[["title","Task"],["projectId","Project"],["due","Due"],["priority","Priority"],["status","Status"]],fields:[
 ["title","Task title","text",true],["projectId","Related project","project"],["due","Due date","date"],["priority","Priority","select",false,["Low","Normal","High"]],["status","Progress","select",false,["To do","In progress","Done"]],["notes","Notes","textarea"]]},
 finance:{name:"Finance",singular:"finance record",description:"Track invoices, payments and expenses. Not a replacement for accounting software.",columns:[["reference","Reference"],["type","Type"],["clientId","Client"],["amount","Amount"],["status","Status"]],fields:[
 ["reference","Reference / description","text",true],["type","Type","select",false,["Invoice","Payment","Expense"]],["clientId","Client","client"],["amount","Amount","number",true],["status","Stage","select",false,["Due","Paid","Recorded","Cancelled"]],["due","Date / due date","date"],["notes","Notes","textarea"]]}
};
const defaults={enquiries:{status:"New",source:"Website"},quotes:{status:"Draft"},bookings:{status:"Planned"},projects:{status:"Planning"},tasks:{status:"To do",priority:"Normal"},finance:{status:"Due",type:"Invoice"}};
const views={dashboard:["Your business, in one place.","The enquiries, clients and projects that keep SWAYMARK moving."],settings:["Workspace settings.","Security, data exports and cloud connection details."]};
const $=id=>document.getElementById(id);
const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const db=Object.fromEntries(KIND.map(key=>[key,[]]));
let session=null,refreshing=null,authenticated=false,activeView="dashboard",searchText="",filter="all",editType="",editId="",busy=false,currency="ZAR";
let toastTimeout;
const authGate=$("authGate"),shell=document.querySelector(".app-shell"),form=$("recordForm"),editor=$("editor"),screen=$("screen");
const sessionKey="swaymark-cloud-session-v1";

function inform(message){clearTimeout(toastTimeout);$("toast").textContent=message;$("toast").classList.add("show");toastTimeout=setTimeout(()=>$("toast").classList.remove("show"),4700);}
function dateISO(offset=0){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function niceDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return"—";const d=new Date(value+"T12:00:00");return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("en-ZA",{day:"numeric",month:"short",year:"numeric"}).format(d);}
function money(amount){return new Intl.NumberFormat("en-ZA",{style:"currency",currency,maximumFractionDigits:2}).format(Number(amount)||0);}
function label(type,id){const item=(db[type]||[]).find(x=>x.id===id);return item?item.name||item.title||item.service||"Untitled":"—";}
function pill(status){const green=["Won","Accepted","Confirmed","Completed","Done","Paid","Recorded"],amber=["New","Draft","Due","To do","Planned","High"],red=["Closed","Declined","Cancelled"],blue=["Contacted","Quoted","Sent","Waiting","In progress"];const color=green.includes(status)?"green":amber.includes(status)?"amber":red.includes(status)?"red":blue.includes(status)?"blue":"";return'<span class="pill '+color+'">'+esc(status||"—")+'</span>';}
function nameOf(type,item){return type==="enquiries"||type==="clients"?item.name:type==="bookings"?item.service:type==="finance"?item.reference:item.title;}
function count(type,predicate){return db[type].filter(predicate).length;}
function storageGet(){try{return JSON.parse(sessionStorage.getItem(sessionKey)||"null");}catch(_){return null;}}
function storageSet(value){try{if(value)sessionStorage.setItem(sessionKey,JSON.stringify(value));else sessionStorage.removeItem(sessionKey);}catch(_){}}
function lock(message=""){
  authenticated=false;session=null;storageSet(null);
  for(const kind of KIND)db[kind]=[];
  authGate.hidden=false;shell.classList.add("locked");
  $("authError").textContent=message;
  $("authLead").textContent=configured?"Sign in to your private workspace to manage enquiries, quotes, bookings and projects.":"The secure app is ready to connect, but the separate SWAYMARK database is not configured yet.";
  $("authSetup").hidden=configured;$("authForm").hidden=!configured;
  $("loginPassword").value="";
  $("screen").innerHTML="";
}
function unlock(){
  authenticated=true;authGate.hidden=true;shell.classList.remove("locked");render();
}
function authErrorText(raw){
  const message=raw&&typeof raw==="object"?(raw.msg||raw.error_description||raw.message||raw.error):null;
  return typeof message==="string"?message.slice(0,200):"The request was not successful. Please try again.";
}
async function request(method,path,body,accessToken=null){
  if(!configured)throw new Error("SWAYMARK cloud settings have not been configured.");
  const headers={"apikey":publishableKey,"Content-Type":"application/json"};
  if(accessToken)headers.Authorization="Bearer "+accessToken;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch(endpoint+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,cache:"no-store"});
    const raw=await response.text();
    let parsed=null;
    try{parsed=raw?JSON.parse(raw):null;}catch(_){parsed=null;}
    if(!response.ok){
      const error=new Error(authErrorText(parsed));
      error.status=response.status;
      throw error;
    }
    return parsed;
  }catch(error){
    if(error.name==="AbortError")throw new Error("The request timed out. Please try again.");
    if(error instanceof TypeError)throw new Error("Cannot reach the SWAYMARK database. Check your connection.");
    throw error;
  }finally{clearTimeout(timeout);}
}
function validSession(saved){
  return saved&&typeof saved.access_token==="string"&&typeof saved.refresh_token==="string"&&typeof saved.expires_at==="number";
}
async function freshToken(){
  if(!authenticated||!validSession(session))throw new Error("Please sign in again.");
  if(session.expires_at>Date.now()+60000)return session.access_token;
  if(!refreshing){
    refreshing=(async()=>{
      try{
        const refreshed=await request("POST","/auth/v1/token?grant_type=refresh_token",{refresh_token:session.refresh_token});
        if(!refreshed||!refreshed.access_token||!refreshed.refresh_token)throw new Error("Session expired.");
        session={access_token:refreshed.access_token,refresh_token:refreshed.refresh_token,expires_at:Date.now()+1000*Number(refreshed.expires_in||3600)};
        storageSet(session);return session.access_token;
      }catch(error){lock("Your session expired. Please sign in again.");throw error;}
      finally{refreshing=null;}
    })();
  }
  return refreshing;
}
async function api(method,path,body){
  const token=await freshToken();
  try{return await request(method,"/rest/v1/swaymark_items"+path,body,token);}
  catch(error){if(error.status===401){lock("Please sign in again.");}throw error;}
}
async function reload(){
  for(const kind of KIND)db[kind]=[];
  let offset=0;
  for(let page=0;page<20;page++){
    const rows=await api("GET","?select=id,kind,payload,created_at,updated_at&order=created_at.desc&limit=1000&offset="+offset);
    if(!Array.isArray(rows))throw new Error("Unexpected response from database.");
    for(const row of rows){
      if(!KIND.includes(row.kind)||!row.payload||typeof row.payload!=="object"||Array.isArray(row.payload))continue;
      const payload=row.payload;
      db[row.kind].push({...payload,id:String(row.id),createdAt:row.created_at,updatedAt:row.updated_at});
    }
    if(rows.length<1000)break;
    offset+=rows.length;
    if(page===19)inform("Large workspace: only the first 20,000 records were loaded.");
  }
  render();
}
async function signIn(event){
  event.preventDefault();
  if(!configured)return;
  const email=$("loginEmail").value.trim(),password=$("loginPassword").value;
  if(!email||!password)return;
  const btn=$("loginButton");
  btn.disabled=true;btn.textContent="Signing in…";$("authError").textContent="";
  try{
    const data=await request("POST","/auth/v1/token?grant_type=password",{email,password});
    if(!data||!data.access_token||!data.refresh_token)throw new Error("Sign-in response was incomplete.");
    session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+1000*Number(data.expires_in||3600)};
    storageSet(session);authenticated=true;
    await request("GET","/auth/v1/user",undefined,session.access_token);
    await reload();unlock();
    $("loginPassword").value="";
    inform("Welcome to your SWAYMARK workspace.");
  }catch(error){lock(error.message||"Sign in failed.");}
  finally{btn.disabled=false;btn.textContent="Sign in to SWAYMARK Hub ↗";}
}
async function signOut(){
  if(session&&configured){try{await request("POST","/auth/v1/logout",undefined,session.access_token);}catch(_){}}
  lock();inform("Signed out.");
}
async function restoreSession(){
  if(!configured){lock();return;}
  const saved=storageGet();if(!validSession(saved)){lock();return;}
  session=saved;authenticated=true;
  try{
    const token=await freshToken();
    await request("GET","/auth/v1/user",undefined,token);
    await reload();unlock();
  }catch(_){lock("Your previous session ended. Please sign in again.");}
}
function changeView(view){
  if(!authenticated)return;
  if(!defs[view]&&!views[view])return;
  searchText="";filter="all";
  if(location.hash==="#"+view)render();else location.hash=view;
}
function closeNav(){
  $("sidePanel").classList.remove("open");$("sideScrim").classList.remove("open");$("navToggle").setAttribute("aria-expanded","false");
}
function render(){
  if(!authenticated)return;
  const hash=(location.hash||"#dashboard").replace(/^#/,"");
  activeView=defs[hash]||views[hash]?hash:"dashboard";
  const def=defs[activeView],headline=def?[def.name+" at a glance.",def.description]:views[activeView];
  $("viewTitle").textContent=headline[0];$("viewDescription").textContent=headline[1];$("breadcrumbCurrent").textContent=def?def.name:activeView==="settings"?"Settings":"Dashboard";
  $("enquiryCount").textContent=count("enquiries",x=>!["Closed","Won"].includes(x.status))||"";
  document.querySelectorAll(".nav-link[data-view]").forEach(item=>{
    const selected=item.dataset.view===activeView;item.classList.toggle("active",selected);
    if(selected)item.setAttribute("aria-current","page");else item.removeAttribute("aria-current");
  });
  $("listToolbar").hidden=true;
  if(activeView==="dashboard")renderDashboard();
  else if(activeView==="settings")renderSettings();
  else renderList();
  closeNav();
}
function metric(title,value,caption,icon,highlight=false){
  return'<article class="metric'+(highlight?" metric-accent":"")+'"><div class="metric-top"><span>'+esc(title)+'</span><span class="metric-icon" aria-hidden="true">'+esc(icon)+'</span></div><strong>'+esc(value)+'</strong><small>'+esc(caption)+'</small></article>';
}
function row(title,sub,side){
  return'<div class="timeline-row"><span class="item-avatar">'+esc(String(title||"?").charAt(0).toUpperCase())+'</span><div class="timeline-info"><strong>'+esc(title)+'</strong><small>'+esc(sub)+'</small></div><div class="timeline-side">'+esc(side)+'</div></div>';
}
function panel(title,subtitle,view,items,emptyText){
  return'<section class="panel"><div class="panel-head"><div><h2>'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></div><button class="text-action" data-action="goto" data-view="'+view+'">View all ↗</button></div>'+
    (items.length?items.join(""):'<p class="section-note">'+esc(emptyText)+'</p>')+'</section>';
}
function renderDashboard(){
 const enquiries=[...db.enquiries].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,5);
 const upcoming=[...db.bookings].filter(x=>x.date>=dateISO()&&!["Cancelled","Completed"].includes(x.status)).sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time))).slice(0,5);
 const tasks=db.tasks.filter(x=>x.status!=="Done").sort((a,b)=>String(a.due||"9999").localeCompare(String(b.due||"9999"))).slice(0,5);
 const pipeline=db.quotes.filter(x=>["Draft","Sent"].includes(x.status)).reduce((v,x)=>v+(Number(x.amount)||0),0);
 const paid=db.finance.filter(x=>x.type==="Payment"&&["Paid","Recorded"].includes(x.status)).reduce((v,x)=>v+(Number(x.amount)||0),0);
 screen.innerHTML='<div class="metrics">'+metric("Open enquiries",count("enquiries",x=>!["Closed","Won"].includes(x.status)),"Awaiting next steps","↗",true)+
 metric("Pending quotes",count("quotes",x=>["Draft","Sent"].includes(x.status)),"Awaiting a decision","▤")+
 metric("Upcoming bookings",count("bookings",x=>x.date>=dateISO()&&!["Cancelled","Completed"].includes(x.status)),"From today onward","▦")+
 metric("Tasks to action",count("tasks",x=>x.status!=="Done"),"Outstanding priorities","☑")+'</div>'+
 '<div class="dashboard-grid">'+
 panel("Latest enquiries","Your newest opportunities","enquiries",enquiries.map(x=>row(x.name,x.service||x.source,x.status)),"New website enquiries will appear here after the form integration is switched on.")+
 panel("Upcoming bookings","Calls and project sessions","bookings",upcoming.map(x=>row(x.service,label("clients",x.clientId),niceDate(x.date))),"No upcoming bookings.")+
 panel("Priority tasks","Keep the next action clear","tasks",tasks.map(x=>row(x.title,label("projects",x.projectId),x.due?niceDate(x.due):x.status)),"No open tasks.")+
 '<section class="panel"><div class="panel-head"><div><h2>Business snapshot</h2><p>Your private workspace</p></div><button class="text-action" data-action="goto" data-view="finance">Finance ↗</button></div>'+
 '<div class="stats-stack"><div class="mini-stat"><strong>'+db.clients.length+'</strong><small>Clients</small></div><div class="mini-stat"><strong>'+count("projects",x=>x.status!=="Completed")+'</strong><small>Active projects</small></div><div class="mini-stat"><strong>'+db.quotes.length+'</strong><small>Quotes</small></div></div>'+
 row("Quotes in progress","Draft and sent proposals",money(pipeline))+row("Payments recorded","Entries marked paid / recorded",money(paid))+'</section></div>'+
 '<div class="overview-banner"><div><strong>A clearer view of the work behind SWAYMARK.</strong><p>Your records are stored in your private cloud project after sign-in. Website form connection is a separate step and must be tested before activation.</p></div><button class="btn btn-lime" data-action="new" data-type="projects">+ Start a project</button></div>';
}
function cell(type,key,rec){
 const value=rec[key]||"";
 if(key==="clientId")return esc(label("clients",value));
 if(key==="projectId")return esc(label("projects",value));
 if(key==="status"||key==="priority")return pill(value);
 if(["date","due","validUntil","deadline","followup"].includes(key))return esc(niceDate(value));
 if(key==="amount"||key==="budget")return'<strong>'+esc(money(rec[key]))+'</strong>';
 if(key===defs[type].columns[0][0]){
   const sub=type==="enquiries"?rec.email:type==="clients"?rec.business:rec.notes;
   return'<span class="record-title">'+esc(value||"—")+'</span>'+(sub?'<span class="record-sub">'+esc(String(sub).slice(0,55))+'</span>':"");
 }
 return esc(value||"—");
}
function actions(type,rec){
 const id=esc(rec.id);
 let extra="";
 if(type==="enquiries")extra='<button class="action-button" data-action="convert" data-id="'+id+'">Add client</button>';
 if(type==="quotes")extra='<button class="action-button" data-action="print" data-id="'+id+'">Print</button>';
 if(type==="tasks")extra='<button class="action-button" data-action="toggle" data-id="'+id+'">'+(rec.status==="Done"?"Reopen":"Complete")+'</button>';
 return'<div class="record-actions">'+extra+'<button class="action-button" data-action="edit" data-type="'+type+'" data-id="'+id+'">Edit</button><button class="action-button danger" data-action="delete" data-type="'+type+'" data-id="'+id+'">Delete</button></div>';
}
function renderList(){
 const type=activeView,def=defs[type];if(!def)return;
 let rows=[...db[type]].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 if(searchText){const term=searchText.toLowerCase();rows=rows.filter(x=>(JSON.stringify(x)+" "+label("clients",x.clientId)+" "+label("projects",x.projectId)).toLowerCase().includes(term));}
 if(filter!=="all")rows=rows.filter(x=>x.status===filter);
 const status=def.fields.find(f=>f[0]==="status");
 $("listToolbar").hidden=false;$("searchInput").value=searchText;$("searchInput").placeholder="Search "+def.name.toLowerCase();$("sectionAdd").textContent="+ Add "+def.singular;
 $("statusFilter").hidden=!status;
 $("statusFilter").innerHTML='<option value="all">All statuses</option>'+(status?status[4].map(s=>'<option value="'+esc(s)+'"'+(filter===s?" selected":"")+'>'+esc(s)+'</option>').join(""):"");
 if(!rows.length){
   const hasFilter=!!searchText||filter!=="all";
   screen.innerHTML='<section class="table-panel"><div class="table-heading"><div><h2>'+esc(def.name)+'</h2><p>'+db[type].length+' total records</p></div></div><div class="empty-state"><span class="empty-illustration" aria-hidden="true">◇</span><h3>'+(hasFilter?"No matching records":"No records yet")+'</h3><p>'+(hasFilter?"Try another search or status.":"Add your first "+esc(def.singular)+" to start.")+'</p><button class="btn btn-dark" data-action="'+(hasFilter?"clear":"new")+'" data-type="'+type+'">'+(hasFilter?"Clear search":"+ Add "+esc(def.singular))+'</button></div></section>';
   return;
 }
 screen.innerHTML='<section class="table-panel"><div class="table-heading"><div><h2>'+esc(def.name)+'</h2><p>'+rows.length+' shown of '+db[type].length+'</p></div></div><table class="record-table"><thead><tr>'+def.columns.map(col=>'<th scope="col">'+esc(col[1])+'</th>').join("")+'<th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>'+
 rows.map(rec=>'<tr>'+def.columns.map(col=>'<td>'+cell(type,col[0],rec)+'</td>').join("")+'<td>'+actions(type,rec)+'</td></tr>').join("")+'</tbody></table></section>';
}
function renderSettings(){
 const opts=CURRENCIES.map(c=>'<option value="'+c+'"'+(currency===c?" selected":"")+'>'+c+'</option>').join("");
 screen.innerHTML='<div class="settings-grid">'+
 '<section class="panel"><span class="eyebrow">ACCOUNT</span><h2>Private cloud workspace</h2><p>Signed in to your separate SWAYMARK Supabase project. Records are saved to the database, protected by owner-based row-level security.</p><p>For security, sessions last for the current browser session. Sign out on shared devices.</p><button class="btn btn-outline" data-action="signout">Sign out</button></section>'+
 '<section class="panel"><span class="eyebrow">DATA</span><h2>Export a backup</h2><p>Download a JSON copy of all records currently loaded. This file contains client data, so store it securely and do not share it publicly.</p><button class="btn btn-dark" data-action="export">Download private backup</button><p class="small-note">Cloud database backups must also be configured and checked in Supabase.</p></section>'+
 '<section class="panel"><span class="eyebrow">PREFERENCES</span><h2>Currency display</h2><p>The currency changes how amounts appear, not exchange rates or values. This preference resets in a new browser session.</p><label for="currencyPref">Display currency</label><select id="currencyPref">'+opts+'</select></section>'+
 '<section class="panel"><span class="eyebrow">CONNECTIVITY</span><h2>Website enquiries</h2><p>The current website form still uses FormSubmit to send email. A protected website-to-app endpoint is prepared, but it must be configured and tested before switching the form.</p><p>Quotes are draft documents, bookings are not connected to your calendar, and finance is not a tax or accounting system.</p></section>'+
 '</div>';
}
function fieldMarkup(field,value){
 const [key,title,type,required=false,options=[]]=field, id="field-"+key,val=value==null?"":value;
 let control="";
 if(type==="textarea")control='<textarea id="'+id+'" name="'+key+'" maxlength="2000">'+esc(val)+'</textarea>';
 else if(["select","client","project"].includes(type)){
   const list=type==="select"?options.map(x=>({value:x,label:x})):type==="client"?db.clients.map(x=>({value:x.id,label:(x.business?x.business+" — ":"")+x.name})):db.projects.map(x=>({value:x.id,label:x.title}));
   control='<select id="'+id+'" name="'+key+'"'+(required?" required":"")+'><option value="">'+(type==="select"?"Select an option":"No record linked")+'</option>'+
     list.map(o=>'<option value="'+esc(o.value)+'"'+(o.value===val?" selected":"")+'>'+esc(o.label)+'</option>').join("")+'</select>';
 }else{
   const max=type==="number"?' min="0" max="1000000000" step="0.01"':type==="text"||type==="tel"||type==="email"?' maxlength="180"':"";
   control='<input id="'+id+'" name="'+key+'" type="'+type+'" value="'+esc(val)+'"'+max+(required?" required":"")+'>';
 }
 return'<div class="form-field '+(type==="textarea"?"full":"")+'"><label for="'+id+'">'+esc(title)+(required?' <span aria-hidden="true">*</span>':"")+'</label>'+control+'</div>';
}
function openEditor(type,id=""){
 if(!authenticated||!defs[type])return;
 editType=type;editId=id;
 const existing=id?db[type].find(x=>x.id===id):null;
 $("modalHeading").textContent=(existing?"Edit ":"New ")+defs[type].singular;
 $("modalDescription").textContent="Saved securely in your SWAYMARK cloud database.";
 $("recordFields").innerHTML=defs[type].fields.map(f=>fieldMarkup(f,existing?existing[f[0]]:(defaults[type]||{})[f[0]])).join("");
 $("saveRecord").textContent=existing?"Save changes":"Create "+defs[type].singular;
 editor.showModal();const first=form.querySelector("input,select,textarea");if(first)first.focus();
}
function formPayload(type){
 const data={};
 for(const [key,_,inputType,required=false] of defs[type].fields){
   const el=form.elements.namedItem(key);if(!el)continue;
   let value=String(el.value).trim();
   if(required&&!value)throw new Error("Please complete the required fields.");
   if(inputType==="number"){
     const n=value?Number(value):0;
     if(!Number.isFinite(n)||n<0||n>1e9)throw new Error("Amount must be between 0 and 1,000,000,000.");
     data[key]=Math.round(n*100)/100;
   }else data[key]=value.slice(0,2000);
 }
 return data;
}
async function storeRecord(method,type,id,payload){
 if(method==="POST")return api("POST","?select=id,kind,payload",[{kind:type,payload}]);
 if(method==="PATCH")return api("PATCH","?id=eq."+encodeURIComponent(id),{payload,updated_at:new Date().toISOString()});
 if(method==="DELETE")return api("DELETE","?id=eq."+encodeURIComponent(id));
}
async function saveRecord(event){
 event.preventDefault();if(busy||!authenticated||!editType||!form.reportValidity())return;
 const type=editType,id=editId;
 let payload;try{payload=formPayload(type);}catch(err){inform(err.message);return;}
 busy=true;$("saveRecord").disabled=true;
 try{
   await storeRecord(id?"PATCH":"POST",type,id,payload);
   editor.close();await reload();inform(id?"Changes saved to cloud.":"Record created in cloud.");
 }catch(error){inform("Save failed: "+error.message);}
 finally{busy=false;$("saveRecord").disabled=false;}
}
async function deleteRecord(type,id){
 const rec=(db[type]||[]).find(x=>x.id===id);if(!rec)return;
 if(!confirm('Delete "'+(nameOf(type,rec)||"this record")+'"? This cannot be undone.'))return;
 if(type==="clients"&&["quotes","bookings","projects","finance"].some(k=>db[k].some(x=>x.clientId===id))){
   if(!confirm("Related records will remain, but show an unlinked client. Continue?"))return;
 }
 if(type==="projects"&&db.tasks.some(x=>x.projectId===id)){
   if(!confirm("Project tasks will remain but lose their project link. Continue?"))return;
 }
 try{await storeRecord("DELETE",type,id);await reload();inform("Record deleted.");}
 catch(error){inform("Delete failed: "+error.message);}
}
async function toggleTask(id){
 const rec=db.tasks.find(x=>x.id===id);if(!rec)return;
 try{await storeRecord("PATCH","tasks",id,{...payloadOf("tasks",rec),status:rec.status==="Done"?"To do":"Done"});await reload();inform("Task updated.");}
 catch(error){inform("Task update failed: "+error.message);}
}
function payloadOf(type,record){const out={};for(const f of defs[type].fields)out[f[0]]=record[f[0]];return out;}
async function convertLead(id){
 const lead=db.enquiries.find(x=>x.id===id);if(!lead)return;
 if(lead.email&&db.clients.some(c=>c.email&&c.email.toLowerCase()===lead.email.toLowerCase())){inform("A client with this email already exists.");changeView("clients");return;}
 try{
   const payload={name:lead.name||"Unknown",business:"",email:lead.email||"",phone:lead.phone||"",notes:"Created from enquiry: "+String(lead.service||"")+" — "+String(lead.message||"").slice(0,1700)};
   await storeRecord("POST","clients",null,payload);await reload();changeView("clients");inform("Added to clients.");
 }catch(error){inform("Unable to add client: "+error.message);}
}
function printQuote(id){
 const rec=db.quotes.find(x=>x.id===id);if(!rec)return;
 const client=db.clients.find(x=>x.id===rec.clientId);
 $("printArea").innerHTML='<img src="/assets/logo-mark.webp" width="56" height="56" alt=""><h1>SWAYMARK</h1><p>Website development • SEO • Digital marketing</p><div class="print-card"><h2>Project quote</h2>'+
 '<div class="print-row"><strong>Prepared for</strong><span>'+esc(client?(client.business||client.name):"Unassigned client")+'</span></div>'+
 '<div class="print-row"><strong>Quote title</strong><span>'+esc(rec.title)+'</span></div>'+
 '<div class="print-row"><strong>Valid until</strong><span>'+esc(niceDate(rec.validUntil))+'</span></div>'+
 '<h3>Proposed scope</h3><p>'+esc(rec.notes||"Scope subject to agreement.").replace(/\n/g,"<br>")+'</p>'+
 '<div class="print-amount">'+esc(money(rec.amount))+'</div><p class="print-foot">Draft quote only — not a tax invoice. Scope, taxes, commercial terms and acceptance are subject to a written agreement.</p></div>';
 $("printArea").setAttribute("aria-hidden","false");setTimeout(()=>window.print(),80);
}
function exportBackup(){
 if(!confirm("This backup may contain real client data. Only download it on a trusted device and store it securely. Continue?"))return;
 const records=KIND.flatMap(kind=>db[kind].map(item=>({kind,...item})));
 const out={product:"SWAYMARK Business Hub",version:2,exportedAt:new Date().toISOString(),currency,records};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="swaymark-cloud-backup-"+dateISO()+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 inform("Private backup downloaded.");
}
function actionHandler(event){
 if(!authenticated)return;
 const el=event.target.closest("[data-action]");if(!el)return;
 const action=el.dataset.action,type=el.dataset.type,id=el.dataset.id;
 if(action==="new")openEditor(type||"enquiries");
 if(action==="edit")openEditor(type,id);
 if(action==="delete")deleteRecord(type,id);
 if(action==="toggle")toggleTask(id);
 if(action==="convert")convertLead(id);
 if(action==="print")printQuote(id);
 if(action==="goto")changeView(el.dataset.view);
 if(action==="clear"){searchText="";filter="all";render();}
 if(action==="export")exportBackup();
 if(action==="signout")signOut();
}
document.addEventListener("click",actionHandler);
document.querySelectorAll(".nav-link[data-view]").forEach(x=>x.addEventListener("click",()=>{searchText="";filter="all";}));
$("authForm").addEventListener("submit",signIn);
$("logoutBtn").addEventListener("click",signOut);
$("topExport").addEventListener("click",exportBackup);
$("sectionAdd").addEventListener("click",()=>openEditor(activeView));
$("modalClose").addEventListener("click",()=>editor.close());
$("cancelEditor").addEventListener("click",()=>editor.close());
$("recordForm").addEventListener("submit",saveRecord);
$("searchInput").addEventListener("input",e=>{searchText=e.target.value.trim();renderList();});
$("statusFilter").addEventListener("change",e=>{filter=e.target.value;renderList();});
document.addEventListener("change",e=>{if(e.target.id==="currencyPref"&&CURRENCIES.includes(e.target.value)){currency=e.target.value;render();inform("Display currency updated for this session.");}});
$("navToggle").addEventListener("click",()=>{const open=!$("sidePanel").classList.contains("open");$("sidePanel").classList.toggle("open",open);$("sideScrim").classList.toggle("open",open);$("navToggle").setAttribute("aria-expanded",String(open));});
$("closeNav").addEventListener("click",closeNav);
$("sideScrim").addEventListener("click",closeNav);
window.addEventListener("hashchange",()=>{searchText="";filter="all";render();});
window.addEventListener("afterprint",()=>{$("printArea").innerHTML="";$("printArea").setAttribute("aria-hidden","true");});
$("todayDisplay").textContent=new Intl.DateTimeFormat("en-ZA",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
shell.classList.add("locked");
restoreSession();
if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",()=>navigator.serviceWorker.register("/app/sw.js",{scope:"/app/"}).catch(()=>{}));
})();
