/*
 * SWAYMARK Business extension for Janus Personal Finance Hub.
 * Staged integration source; NOT enabled in the live finance app.
 *
 * Loaded after the finance app core/suite scripts. Uses the existing signed-in
 * Supabase session via window.__financeHub, and ONLY the swaymark_items table.
 * No access to personal transactions, accounts, budgets or other finance tables.
 */
(() => {
  "use strict";
  if (window.__swaymarkBusinessExtension) return;
  window.__swaymarkBusinessExtension = true;

  const KINDS = {
    enquiries: {
      label:"Enquiries",one:"enquiry",headline:"Keep conversations moving.",
      columns:["name","service","status","followup"],
      fields:[
        ["name","Contact name","text",true],["email","Email","email"],["phone","Phone","tel"],
        ["service","Interested in","select",false,["New website","Website redesign","Website maintenance","SEO","Digital marketing","Social media","Analytics","Other"]],
        ["source","Source","select",false,["Website","Email","Phone","Referral","Social media","Other"]],
        ["status","Stage","select",false,["New","Contacted","Quoted","Won","Closed"]],
        ["followup","Follow-up date","date"],["message","Project details","textarea"]
      ]
    },
    clients: {
      label:"Clients",one:"client",headline:"Every client, organised.",
      columns:["name","business","email","phone"],
      fields:[["name","Contact name","text",true],["business","Business","text"],["email","Email","email"],["phone","Phone","tel"],["notes","Notes","textarea"]]
    },
    quotes: {
      label:"Quotes",one:"quote",headline:"Know what has been quoted.",
      columns:["title","clientId","amount","status","validUntil"],
      fields:[["title","Quote title","text",true],["clientId","Client","client"],["amount","Quoted amount","number",true],["status","Stage","select",false,["Draft","Sent","Accepted","Declined"]],["validUntil","Valid until","date"],["notes","Scope / exclusions","textarea"]]
    },
    bookings: {
      label:"Bookings",one:"booking",headline:"Keep sessions and calls in view.",
      columns:["service","clientId","date","time","status"],
      fields:[["service","Session title","text",true],["clientId","Client","client"],["date","Date","date",true],["time","Time","time"],["status","Stage","select",false,["Planned","Confirmed","Completed","Cancelled"]],["notes","Notes","textarea"]]
    },
    projects: {
      label:"Projects",one:"project",headline:"Deliver work with clarity.",
      columns:["title","clientId","deadline","status","budget"],
      fields:[["title","Project title","text",true],["clientId","Client","client"],["deadline","Target date","date"],["status","Stage","select",false,["Planning","In progress","Waiting","Completed"]],["budget","Project value","number"],["notes","Deliverables","textarea"]]
    },
    tasks: {
      label:"Tasks",one:"task",headline:"The next action, always visible.",
      columns:["title","projectId","due","priority","status"],
      fields:[["title","Task","text",true],["projectId","Project","project"],["due","Due date","date"],["priority","Priority","select",false,["Low","Normal","High"]],["status","Stage","select",false,["To do","In progress","Done"]],["notes","Notes","textarea"]]
    },
    finance: {
      label:"Business finance",one:"finance record",headline:"Business entries, separate from personal money.",
      columns:["reference","type","clientId","amount","status"],
      fields:[["reference","Reference","text",true],["type","Type","select",false,["Invoice","Payment","Expense"]],["clientId","Client","client"],["amount","Amount","number",true],["status","Stage","select",false,["Due","Paid","Recorded","Cancelled"]],["due","Date","date"],["notes","Notes","textarea"]]
    }
  };
  const DEFAULTS = {enquiries:{status:"New",source:"Website"},quotes:{status:"Draft"},bookings:{status:"Planned"},projects:{status:"Planning"},tasks:{status:"To do",priority:"Normal"},finance:{type:"Invoice",status:"Due"}};
  const ORDER = ["dashboard","enquiries","clients","quotes","bookings","projects","tasks","finance"];
  const store = Object.fromEntries(Object.keys(KINDS).map(type => [type,[]]));
  let selected="dashboard",search="",inProgress=false,dbReady=false,lastError="",navTimer=0,navObserver=null,hasLoaded=false,requestVersion=0;

  function htmlSafe(value) {
    return String(value==null?"":value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function dateToday() {
    const d=new Date();d.setHours(12,0,0,0);
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  function dateLabel(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
    const d = new Date(value+"T12:00:00");
    return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("en-ZA",{day:"numeric",month:"short",year:"numeric"}).format(d);
  }
  function money(value) {
    return new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(Number(value)||0);
  }
  function ctx() { return window.__financeHub; }
  function tokenHeaders(write=false) {
    const c=ctx();
    if(!c || !c.apiOrigin || !c.apiHeaders) throw new Error("Please sign in to Janus Personal Finance first.");
    const h=new Headers(c.apiHeaders);
    h.delete("Range");h.delete("Range-Unit");h.delete("Prefer");
    h.set("Accept","application/json");
    if(write)h.set("Content-Type","application/json");
    return h;
  }
  async function db(method,path,body) {
    const c=ctx();
    const headers=tokenHeaders(method!=="GET");
    if(method==="POST")headers.set("Prefer","return=representation");
    const response=await fetch(c.apiOrigin+"/rest/v1/swaymark_items"+path,{
      method,headers,cache:"no-store",
      body:body===undefined?undefined:JSON.stringify(body)
    });
    if(!response.ok){
      let why="Database unavailable ("+response.status+").";
      try{const x=await response.json();why=String(x.message||x.hint||why).slice(0,250)}catch(_){}
      throw new Error(why);
    }
    const t=await response.text();
    return t?JSON.parse(t):[];
  }
  async function reloadData(){
    const version=++requestVersion;
    for(const k of Object.keys(store))store[k]=[];
    const all=[];
    for(let offset=0;offset<10000;offset+=1000){
      const chunk=await db("GET","?select=id,kind,payload,created_at,updated_at&order=created_at.desc&limit=1000&offset="+offset);
      if(!Array.isArray(chunk))throw new Error("Unexpected database response.");
      all.push(...chunk);
      if(chunk.length<1000)break;
    }
    if(version!==requestVersion)return;
    for(const row of all){
      if(!KINDS[row.kind] || !row.payload || typeof row.payload!=="object" || Array.isArray(row.payload))continue;
      store[row.kind].push({...row.payload,id:row.id,createdAt:row.created_at,updatedAt:row.updated_at});
    }
    dbReady=true;lastError="";hasLoaded=true;
  }
  function initial(item) {return String(item||"?").trim().charAt(0).toUpperCase();}
  function lookup(kind,id) {
    const r=(store[kind]||[]).find(x=>x.id===id);
    return r ? (r.business||r.name||r.title||r.service||"Untitled") : "—";
  }
  function badge(status) {
    let color="gray";
    if(["Done","Accepted","Completed","Won","Paid","Confirmed","Recorded"].includes(status)) color="green";
    else if(["New","Draft","Due","High","To do","Planned"].includes(status))color="yellow";
    else if(["Declined","Closed","Cancelled"].includes(status))color="red";
    return '<span class="sm-badge sm-'+color+'">'+htmlSafe(status||"—")+'</span>';
  }
  function panel() {return document.querySelector("#pageHost");}
  function viewTitle(){return (document.querySelector("#pageTitle")?.textContent||"").trim();}
  function setHeader(title,subtitle) {
    const t=document.querySelector("#pageTitle"),s=document.querySelector("#pageSub");
    if(t)t.textContent=title;
    if(s)s.textContent=subtitle;
    document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
    document.querySelector("[data-swaymark-business]")?.classList.add("active");
    const month=document.querySelector("#monthPicker"),quick=document.querySelector("#quickAdd");
    if(month)month.style.display="none";
    if(quick)quick.style.display="none";
    ctx()?.stopMarketRefresh?.();
  }
  function menu() {
    const nav=document.querySelector(".nav");
    if(!nav)return;
    let btn=nav.querySelector("[data-swaymark-business]");
    if(!btn) {
      btn=document.createElement("button");
      btn.type="button";btn.dataset.swaymarkBusiness="";
      btn.innerHTML='<span class="icon" aria-hidden="true">S</span><span class="label">SWAYMARK Business</span>';
      const settings=nav.querySelector('[data-page="settings"]');
      if(settings)nav.insertBefore(btn,settings);else nav.appendChild(btn);
      btn.addEventListener("click",()=>open("dashboard"));
    }
    btn.classList.toggle("active",viewTitle()==="SWAYMARK Business");
  }
  function initMenu(){
    if(!document.body)return;
    menu();
    if(!navObserver){
      navObserver=new MutationObserver(() => {
        if(navTimer)return;
        navTimer=requestAnimationFrame(()=>{navTimer=0;menu();});
      });
      navObserver.observe(document.body,{subtree:true,childList:true});
    }
  }
  function toast(message) {
    if(typeof ctx()?.toastLocal==="function") ctx().toastLocal(message);
    else window.alert(message);
  }
  function stat(label,value,detail){
    return '<div class="sm-stat"><small>'+htmlSafe(label)+'</small><strong>'+htmlSafe(value)+'</strong><span>'+htmlSafe(detail)+'</span></div>';
  }
  function overview(){
    const openLeads=store.enquiries.filter(x=>!["Won","Closed"].includes(x.status)).length;
    const openQuotes=store.quotes.filter(x=>["Draft","Sent"].includes(x.status)).length;
    const openTasks=store.tasks.filter(x=>x.status!=="Done").length;
    const projects=store.projects.filter(x=>x.status!=="Completed").length;
    const outstanding=store.quotes.filter(x=>["Draft","Sent"].includes(x.status)).reduce((s,x)=>s+(Number(x.amount)||0),0);
    const recent=[...store.enquiries].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,4);
    const next=[...store.tasks].filter(x=>x.status!=="Done").sort((a,b)=>String(a.due||"9999").localeCompare(String(b.due||"9999"))).slice(0,4);
    const listing=(title,items,label,kind)=>'<section class="sm-panel"><div class="sm-panel-head"><h3>'+htmlSafe(title)+'</h3><button type="button" data-sm-go="'+kind+'">View all ↗</button></div>'+
      (items.length?items.map(x=>'<div class="sm-mini-row"><span class="sm-avatar">'+htmlSafe(initial(label(x)))+'</span><span><strong>'+htmlSafe(label(x))+'</strong><small>'+htmlSafe(x.status||x.service||"")+'</small></span></div>').join(""):'<div class="sm-empty">Nothing here yet.</div>')+'</section>';
    return '<div class="sm-grid4">'+stat("Open enquiries",openLeads,"Conversations to follow up")+stat("Quotes pending",openQuotes,"Proposals to progress")+stat("Active projects",projects,"Work in motion")+stat("Tasks to action",openTasks,"Your priorities")+'</div>'+
      '<div class="sm-grid2">'+listing("Latest enquiries",recent,x=>x.name,"enquiries")+listing("Next tasks",next,x=>x.title,"tasks")+'</div>'+
      '<div class="sm-banner"><div><strong>SWAYMARK, all in one workspace.</strong><p>Business quotes awaiting a decision: '+htmlSafe(money(outstanding))+'. Your personal finance accounts stay separate.</p></div><button data-sm-new="enquiries" type="button">+ Add an enquiry</button></div>';
  }
  function tableValue(kind,key,row) {
    const value=row[key];
    if(key==="clientId")return htmlSafe(lookup("clients",value));
    if(key==="projectId")return htmlSafe(lookup("projects",value));
    if(key==="status"||key==="priority")return badge(value);
    if(["date","due","deadline","validUntil","followup"].includes(key))return htmlSafe(dateLabel(value));
    if(key==="amount"||key==="budget")return '<strong>'+htmlSafe(money(value))+'</strong>';
    return htmlSafe(String(value==null?"—":value).slice(0,160));
  }
  function records(kind){
    const cfg=KINDS[kind];
    const term=search.toLowerCase();
    let arr=store[kind].filter(x=>!term||JSON.stringify(x).toLowerCase().includes(term));
    arr=arr.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    if(!arr.length)return '<section class="sm-panel sm-empty"><h3>Nothing here yet</h3><p>Keep SWAYMARK records here without mixing them with your personal finance data.</p><button data-sm-new="'+kind+'" type="button">+ Add '+htmlSafe(cfg.one)+'</button></section>';
    return '<div class="sm-table-wrap"><table class="sm-table"><thead><tr>'+cfg.columns.map(k=>'<th scope="col">'+htmlSafe(k.replace(/([A-Z])/g," $1"))+'</th>').join("")+'<th scope="col">Actions</th></tr></thead><tbody>'+
      arr.map(x=>'<tr>'+cfg.columns.map(k=>'<td>'+tableValue(kind,k,x)+'</td>').join("")+'<td><div class="sm-actions">'+
      (kind==="tasks"?'<button data-sm-complete="'+htmlSafe(x.id)+'" type="button">'+(x.status==="Done"?"Reopen":"Done")+'</button>':"")+
      (kind==="quotes"?'<button data-sm-print="'+htmlSafe(x.id)+'" type="button">Print</button>':"")+
      (kind==="enquiries"?'<button data-sm-convert="'+htmlSafe(x.id)+'" type="button">Client</button>':"")+
      '<button data-sm-edit="'+kind+':'+htmlSafe(x.id)+'" type="button">Edit</button><button data-sm-delete="'+kind+':'+htmlSafe(x.id)+'" type="button">Delete</button></div></td></tr>').join("")+'</tbody></table></div>';
  }
  function render(){
    if(viewTitle()!=="SWAYMARK Business")return;
    const h=panel();if(!h)return;
    const title=selected==="dashboard"?"Overview":KINDS[selected]?.label||"Overview";
    let body="<div class='sm-empty'>Loading business records…</div>";
    if(lastError)body='<section class="sm-panel sm-error"><h3>Business data is unavailable</h3><p>'+htmlSafe(lastError)+'</p><button type="button" data-sm-refresh>Try again</button><p>Your personal finance data is not affected.</p></section>';
    else if(dbReady)body=selected==="dashboard"?overview():records(selected);
    h.innerHTML='<section id="smBusinessPanel"><div class="sm-header"><div><span>SWAYMARK / BUSINESS WORKSPACE</span><h2>'+htmlSafe(title)+'</h2><p>'+htmlSafe(selected==="dashboard"?"Enquiries, clients, quotes, bookings and projects alongside your personal finance tools.":KINDS[selected].headline)+'</p></div><button type="button" data-sm-refresh>Refresh ↻</button></div>'+
      '<nav class="sm-tabs" aria-label="SWAYMARK business sections">'+ORDER.map(k=>'<button type="button" data-sm-go="'+k+'"'+(k===selected?' aria-current="page" class="active"':'')+'>'+htmlSafe(k==="dashboard"?"Overview":KINDS[k].label)+'</button>').join("")+'</nav>'+
      (selected!=="dashboard"&&dbReady&&!lastError?'<div class="sm-bar"><label>Search <input type="search" data-sm-search autocomplete="off" placeholder="Search '+htmlSafe(title.toLowerCase())+'" value="'+htmlSafe(search)+'"></label><button type="button" data-sm-new="'+selected+'">+ New '+htmlSafe(KINDS[selected].one)+'</button></div>':"")+
      body+'<p class="sm-foot">SWAYMARK records use a separate, owner-protected business table. Draft quotes are not tax invoices; entries in Business finance do not automatically alter personal finance balances.</p></section>';
  }
  async function open(kind){
    if(!ORDER.includes(kind))kind="dashboard";
    selected=kind;search="";
    setHeader("SWAYMARK Business","Enquiries, clients, bookings, tasks and projects");
    render();
    if(!hasLoaded)await refresh();
  }
  async function refresh(){
    if(inProgress)return;
    inProgress=true;lastError="";dbReady=false;render();
    try{await reloadData();}catch(error){lastError=String(error?.message||"Could not load data.");dbReady=false;}
    finally{inProgress=false;render();}
  }
  function fieldRow(field,value){
    const [key,label,type,required=false,options=[]]=field;
    const safeKey=htmlSafe(key),safeVal=htmlSafe(value==null?"":value);
    let el;
    if(type==="textarea")el='<textarea name="'+safeKey+'" maxlength="2000">'+safeVal+'</textarea>';
    else if(type==="select"||type==="client"||type==="project"){
      const arr=type==="select"?options.map(s=>[s,s]):type==="client"?store.clients.map(x=>[x.id,(x.business?x.business+" — ":"")+x.name]):store.projects.map(x=>[x.id,x.title]);
      el='<select name="'+safeKey+'"'+(required?" required":"")+'><option value="">Select…</option>'+arr.map(x=>'<option value="'+htmlSafe(x[0])+'"'+(x[0]===value?" selected":"")+'>'+htmlSafe(x[1])+'</option>').join("")+'</select>';
    }else{
      el='<input name="'+safeKey+'" type="'+htmlSafe(type)+'" value="'+safeVal+'"'+(required?" required":"")+(type==="number"?' min="0" max="1000000000" step="0.01"':' maxlength="180"')+'>';
    }
    return '<label class="sm-field"><span>'+htmlSafe(label)+(required?' *':'')+'</span>'+el+'</label>';
  }
  function showEditor(kind,id){
    const data=id?store[kind].find(x=>x.id===id):null;
    const cfg=KINDS[kind];if(!cfg)return;
    const dlg=document.createElement("dialog");dlg.className="sm-dialog";
    dlg.innerHTML='<form method="dialog" class="sm-form"><div class="sm-dialog-head"><h2>'+(data?"Edit ":"New ")+htmlSafe(cfg.one)+'</h2><button value="cancel" type="button" data-sm-cancel aria-label="Close">×</button></div>'+
      '<div class="sm-fields">'+cfg.fields.map(f=>fieldRow(f,data?data[f[0]]:(DEFAULTS[kind]||{})[f[0]])).join("")+'</div>'+
      '<div class="sm-dialog-foot"><button type="button" data-sm-cancel>Cancel</button><button type="submit" data-sm-save>Save</button></div></form>';
    document.body.appendChild(dlg);
    function cleanup(){dlg.remove();}
    dlg.addEventListener("close",cleanup,{once:true});
    dlg.addEventListener("click",e=>{if(e.target.closest("[data-sm-cancel]"))dlg.close();});
    dlg.querySelector("form").addEventListener("submit",async e=>{
      e.preventDefault();
      if(inProgress)return;
      const form=e.currentTarget;
      if(!form.reportValidity())return;
      const payload={};
      for(const field of cfg.fields){
        const key=field[0],type=field[2],raw=String(form.elements.namedItem(key).value||"").trim();
        if(field[3]&&!raw){toast("Please complete required fields.");return;}
        if(type==="number"){
          const value=raw?Number(raw):0;
          if(!Number.isFinite(value)||value<0||value>1e9){toast("Invalid amount.");return;}
          payload[key]=Math.round(value*100)/100;
        }else payload[key]=raw.slice(0,2000);
      }
      const btn=dlg.querySelector("[data-sm-save]");
      btn.disabled=true;
      try{
        if(data)await db("PATCH","?id=eq."+encodeURIComponent(id),{payload,updated_at:new Date().toISOString()});
        else await db("POST","",[{kind,payload}]);
        dlg.close();hasLoaded=false;await refresh();toast("Business record saved.");
      }catch(error){toast("Couldn't save: "+error.message);}
      finally{btn.disabled=false;}
    });
    dlg.showModal();
  }
  async function deleteRow(kind,id){
    const row=store[kind]?.find(x=>x.id===id);if(!row)return;
    if(!confirm("Delete this SWAYMARK "+KINDS[kind].one+"? This cannot be undone."))return;
    try{await db("DELETE","?id=eq."+encodeURIComponent(id));hasLoaded=false;await refresh();toast("Business record deleted.");}
    catch(error){toast("Delete failed: "+error.message);}
  }
  async function completeTask(id){
    const task=store.tasks.find(x=>x.id===id);if(!task)return;
    const payload={};for(const f of KINDS.tasks.fields)payload[f[0]]=task[f[0]]??"";
    payload.status=task.status==="Done"?"To do":"Done";
    try{await db("PATCH","?id=eq."+encodeURIComponent(id),{payload,updated_at:new Date().toISOString()});hasLoaded=false;await refresh();}
    catch(error){toast("Update failed: "+error.message);}
  }
  async function convertLead(id){
    const lead=store.enquiries.find(x=>x.id===id);if(!lead)return;
    if(lead.email&&store.clients.some(x=>x.email&&x.email.toLowerCase()===lead.email.toLowerCase())){
      toast("This email already exists in clients.");return;
    }
    const payload={name:lead.name||"Unknown",email:lead.email||"",phone:lead.phone||"",business:"",notes:"From enquiry: "+String(lead.service||"")+"\n"+String(lead.message||"").slice(0,1400)};
    try{await db("POST","",[{kind:"clients",payload}]);selected="clients";hasLoaded=false;await refresh();toast("Client added.");}
    catch(error){toast("Cannot add client: "+error.message);}
  }
  function printQuote(id){
    const q=store.quotes.find(x=>x.id===id);if(!q)return;
    const client=lookup("clients",q.clientId);
    const w=window.open("","_blank","noopener,noreferrer,width=820,height=720");
    if(!w){toast("Allow pop-ups to print a quote.");return;}
    const doc='<html><head><title>SWAYMARK Project Quote</title><meta charset="utf-8"><style>body{font:15px/1.7 Arial,sans-serif;padding:38px;color:#111}h1{letter-spacing:.12em}small{color:#666}.amount{font-size:31px;font-weight:bold;text-align:right}.line{padding:13px 0;border-bottom:1px solid #ddd}em{font-size:12px;color:#777}</style></head><body><h1>SWAYMARK</h1><p>Project quote</p><div class="line"><b>Client:</b> '+htmlSafe(client)+'</div><div class="line"><b>Project:</b> '+htmlSafe(q.title)+'</div><div class="line"><b>Valid until:</b> '+htmlSafe(dateLabel(q.validUntil))+'</div><h3>Proposed scope</h3><p>'+htmlSafe(q.notes||"Scope to be agreed in writing.").replace(/\n/g,"<br>")+'</p><p class="amount">'+htmlSafe(money(q.amount))+'</p><em>Draft quote, not a tax invoice. Final scope, taxes and commercial terms require a written agreement.</em></body></html>';
    w.document.open();w.document.write(doc);w.document.close();w.focus();w.print();
  }
  document.addEventListener("click",event=>{
    const root=event.target.closest("#smBusinessPanel");
    if(!root)return;
    const el=event.target.closest("[data-sm-go],[data-sm-new],[data-sm-edit],[data-sm-delete],[data-sm-complete],[data-sm-convert],[data-sm-print],[data-sm-refresh]");
    if(!el)return;
    if(el.dataset.smGo)open(el.dataset.smGo);
    if(el.dataset.smNew)showEditor(el.dataset.smNew);
    if(el.dataset.smEdit){const parts=el.dataset.smEdit.split(":");showEditor(parts[0],parts[1]);}
    if(el.dataset.smDelete){const parts=el.dataset.smDelete.split(":");deleteRow(parts[0],parts[1]);}
    if(el.dataset.smComplete)completeTask(el.dataset.smComplete);
    if(el.dataset.smConvert)convertLead(el.dataset.smConvert);
    if(el.dataset.smPrint)printQuote(el.dataset.smPrint);
    if(el.hasAttribute("data-sm-refresh")){hasLoaded=false;refresh();}
  });
  document.addEventListener("input",event=>{
    if(event.target.matches("#smBusinessPanel [data-sm-search]")){
      search=event.target.value.trim().slice(0,100);
      const first=event.target.selectionStart,second=event.target.selectionEnd;
      render();
      const replacement=document.querySelector("#smBusinessPanel [data-sm-search]");
      if(replacement){replacement.focus();try{replacement.setSelectionRange(first,second);}catch(_){}}
    }
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initMenu,{once:true});
  else initMenu();
})();
