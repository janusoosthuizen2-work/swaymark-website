/* SWAYMARK HQ 2.0 - agency and website operations. Standalone desktop module.
   This client accesses ONLY the owner-protected swaymark_items table. */
const API="https://glopetsbjaoxutjghgdo.supabase.co";
const KEY="sb_publishable_PCwNwdUBSUdq3tZbSbVTPg_3q7W8Sm6";
const SESSION="swaymark_hq_auth_v2";
const F={
 websites:{title:"Websites",single:"website",cols:["name","url","clientId","platform","status","domainExpiry"],fields:[
 ["name","Website name","text",1],["url","Website URL","url",1],["clientId","Client","client"],
 ["platform","Platform","select",0,["WordPress","Joomla","Shopify","Webflow","Wix","Static / GitHub","Custom","Other"]],
 ["status","Status","select",0,["Active","Building","Maintenance","Paused","Archived"]],
 ["adminUrl","Website admin URL","url"],["hosting","Hosting company","text"],["hostingUrl","Hosting control panel","url"],
 ["registrar","Domain registrar","text"],["domainExpiry","Domain renewal date","date"],
 ["hostingExpiry","Hosting renewal date","date"],["sslExpiry","SSL expiry date","date"],
 ["plan","Maintenance plan","select",0,["None","Basic","Standard","Premium","Ad hoc"]],
 ["fee","Monthly maintenance fee","number"],["backupDate","Last verified backup","date"],
 ["gscUrl","Search Console link","url"],["ga4Url","Analytics link","url"],
 ["vaultRef","Password manager reference (no passwords)","text"],["notes","Site notes","textarea"]],
 defaults:{status:"Active",platform:"Custom",plan:"None"}},
 clients:{title:"Clients",single:"client",cols:["name","company","email","phone","status"],fields:[
 ["name","Contact name","text",1],["company","Company","text"],["email","Email","email"],["phone","Phone","tel"],
 ["status","Relationship","select",0,["Active","Lead","Paused","Former"]],["notes","Notes","textarea"]],
 defaults:{status:"Active"}},
 enquiries:{title:"Enquiries",single:"enquiry",cols:["name","service","source","status","followup"],fields:[
 ["name","Contact name","text",1],["email","Email","email"],["phone","Phone","tel"],["clientId","Client","client"],
 ["websiteId","Website","website"],["service","Service","select",0,["New website","Website redesign","Website maintenance","SEO","Digital marketing","Social media","Other"]],
 ["source","Source","select",0,["Website","Email","Phone","Referral","Social media","Other"]],
 ["status","Status","select",0,["New","Contacted","Quoted","Won","Closed"]],
 ["followup","Follow up date","date"],["budget","Budget","number"],["notes","Enquiry details","textarea"]],
 defaults:{status:"New",source:"Website"}},
 projects:{title:"Projects",single:"project",cols:["title","websiteId","clientId","status","dueDate"],fields:[
 ["title","Project title","text",1],["websiteId","Website","website"],["clientId","Client","client"],
 ["status","Stage","select",0,["Planning","In progress","Waiting","On hold","Completed"]],
 ["priority","Priority","select",0,["High","Normal","Low"]],["dueDate","Deadline","date"],
 ["budget","Project value","number"],["notes","Deliverables and notes","textarea"]],
 defaults:{status:"Planning",priority:"Normal"}},
 tasks:{title:"Tasks",single:"task",cols:["title","websiteId","projectId","priority","dueDate","status"],fields:[
 ["title","Task","text",1],["websiteId","Website","website"],["projectId","Project","project"],
 ["category","Category","select",0,["Website","SEO","Maintenance","Content","Marketing","Client follow-up","Admin","Other"]],
 ["priority","Priority","select",0,["High","Normal","Low"]],["dueDate","Due date","date"],
 ["status","Status","select",0,["To do","In progress","Waiting","Done"]],["notes","Notes","textarea"]],
 defaults:{status:"To do",priority:"Normal",category:"Website"}},
 seo:{title:"SEO Tracker",single:"SEO task",cols:["title","websiteId","area","status","dueDate"],fields:[
 ["title","SEO check or action","text",1],["websiteId","Website","website",1],
 ["area","SEO area","select",0,["Indexing","Technical SEO","On-page SEO","Performance","Content","Local SEO","AI visibility"]],
 ["status","Status","select",0,["To do","In progress","Blocked","Completed"]],
 ["dueDate","Target date","date"],["keyword","Target keyword","text"],["pageUrl","Relevant page","url"],
 ["notes","Findings and next actions","textarea"]],defaults:{status:"To do",area:"Technical SEO"}},
 maintenance:{title:"Maintenance",single:"maintenance task",cols:["title","websiteId","frequency","dueDate","status"],fields:[
 ["title","Maintenance work","text",1],["websiteId","Website","website",1],
 ["frequency","Frequency","select",0,["One-off","Weekly","Monthly","Quarterly","Yearly"]],
 ["dueDate","Due date","date"],["doneDate","Completed date","date"],
 ["status","Status","select",0,["Scheduled","In progress","Waiting","Completed"]],
 ["notes","Changes, checks and findings","textarea"]],defaults:{frequency:"Monthly",status:"Scheduled"}},
 domains:{title:"Domains & Renewals",single:"renewal",cols:["name","websiteId","type","expiry","status"],fields:[
 ["name","Domain or service name","text",1],["websiteId","Website","website"],
 ["type","Type","select",0,["Domain","Hosting","SSL","Software","Other"]],
 ["provider","Provider","text"],["expiry","Renewal date","date"],["cost","Renewal cost","number"],
 ["autoRenew","Auto-renew","select",0,["Yes","No","Unknown"]],
 ["status","Status","select",0,["Active","Renewed","Cancelled"]],["notes","Notes","textarea"]],
 defaults:{type:"Domain",status:"Active",autoRenew:"Unknown"}},
 content:{title:"Content Planner",single:"content item",cols:["title","websiteId","channel","keyword","publishDate","status"],fields:[
 ["title","Title","text",1],["websiteId","Website","website"],
 ["channel","Channel","select",0,["Blog","Website page","Facebook","Instagram","Email","Other"]],
 ["keyword","Topic or keyword","text"],["publishDate","Publish date","date"],
 ["status","Status","select",0,["Idea","Draft","Review","Scheduled","Published"]],
 ["url","Published URL","url"],["notes","Outline and notes","textarea"]],
 defaults:{status:"Idea",channel:"Blog"}},
 campaigns:{title:"Campaigns",single:"campaign",cols:["title","websiteId","channel","budget","status"],fields:[
 ["title","Campaign title","text",1],["websiteId","Website","website"],["clientId","Client","client"],
 ["channel","Channel","select",0,["Google Ads","Meta Ads","Organic social","SEO","Email","Other"]],
 ["budget","Budget","number"],["startDate","Start date","date"],["endDate","End date","date"],
 ["status","Status","select",0,["Planning","Active","Paused","Finished"]],
 ["notes","Objectives and results","textarea"]],defaults:{status:"Planning",channel:"Google Ads"}},
 quotes:{title:"Quotes",single:"quote",cols:["title","clientId","amount","status","validUntil"],fields:[
 ["title","Quote title","text",1],["clientId","Client","client"],["websiteId","Website","website"],
 ["amount","Amount","number",1],["validUntil","Valid until","date"],
 ["status","Status","select",0,["Draft","Sent","Accepted","Declined"]],
 ["notes","Scope and exclusions","textarea"]],defaults:{status:"Draft"}},
 bookings:{title:"Bookings",single:"booking",cols:["title","clientId","date","time","status"],fields:[
 ["title","Booking title","text",1],["clientId","Client","client"],["websiteId","Website","website"],
 ["date","Date","date",1],["time","Time","time"],["location","Meeting link or location","text"],
 ["status","Status","select",0,["Requested","Confirmed","Completed","Cancelled"]],
 ["notes","Notes","textarea"]],defaults:{status:"Requested"}},
 finance:{title:"Business Finance",single:"business entry",cols:["reference","type","clientId","amount","status"],fields:[
 ["reference","Reference","text",1],["type","Type","select",0,["Invoice","Payment","Expense"]],
 ["clientId","Client","client"],["websiteId","Website","website"],
 ["amount","Amount","number",1],["dueDate","Date or due date","date"],
 ["status","Status","select",0,["Due","Paid","Recorded","Cancelled"]],
 ["notes","Notes","textarea"]],defaults:{type:"Invoice",status:"Due"}},
 settings:{title:"Settings",single:"profile",cols:["businessName","businessEmail"],fields:[
 ["businessName","Business name","text",1],["businessEmail","Business email","email"],
 ["businessWebsite","Business website","url"],["phone","Phone","tel"],
 ["notes","Notes","textarea"]],defaults:{businessName:"SWAYMARK",businessEmail:"swaymark.studio@gmail.com",businessWebsite:"https://swaymark.pages.dev/"}}
};
const GROUPS=[
 ["WORKSPACE",[["overview","Overview","◈"],["websites","Websites","◎"],["clients","Clients","◉"],["enquiries","Enquiries","↗"]]],
 ["DELIVERY",[["projects","Projects","▣"],["tasks","Tasks","✓"],["seo","SEO Tracker","⌕"],["maintenance","Maintenance","⚒"],["domains","Domains & Renewals","◷"],["content","Content Planner","▤"]]],
 ["BUSINESS",[["campaigns","Campaigns","▶"],["quotes","Quotes","▱"],["bookings","Bookings","▦"],["finance","Business Finance","▥"]]],
 ["PREFERENCES",[["settings","Settings","⚙"]]]
];
const SEO_BASE=[
 ["Check indexing, noindex rules and canonicals","Indexing"],["Verify XML sitemap and Search Console","Indexing"],
 ["Review robots.txt and crawl access","Technical SEO"],["Optimise unique titles and meta descriptions","On-page SEO"],
 ["Review heading structure and H1","On-page SEO"],["Fix internal links and orphan pages","On-page SEO"],
 ["Check Core Web Vitals and mobile LCP","Performance"],["Check 404 errors and 301 redirects","Technical SEO"],
 ["Check structured data validity","Technical SEO"],["Improve descriptive image alt text","On-page SEO"],
 ["Review content quality and freshness","Content"],["Check service and location information","Local SEO"],
 ["Review AI visibility and clear business details","AI visibility"]
];
const MAINT_BASE=["Verify a restorable website backup","Review platform and plugin updates","Test contact and booking forms","Review broken links and redirects","Check site security and mobile speed","Prepare client maintenance summary"];
let S={session:null,items:[],page:"overview",siteId:null,tab:"overview",search:"",filter:"All",menu:false,loading:false,error:"",saving:false};
const $=s=>document.querySelector(s);
function e(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function list(kind){return S.items.filter(x=>x.kind===kind);}
function byId(kind,id){return list(kind).find(x=>x.id===id);}
function name(kind,id){const x=byId(kind,id);return x?(x.company||x.name||x.title||x.reference||"Untitled"):"—";}
function money(v){return new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",maximumFractionDigits:0}).format(Number(v)||0);}
function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fmtDate(x){if(!x||!/^\d{4}-\d{2}-\d{2}$/.test(x))return "—";const d=new Date(x+"T12:00:00");return Number.isFinite(d.getTime())?d.toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"}):"—";}
function daysTo(x){if(!x||!/^\d{4}-\d{2}-\d{2}$/.test(x))return null;return Math.round((new Date(x+"T12:00:00")-new Date(today()+"T12:00:00"))/86400000);}
function cls(s){if(["Done","Completed","Published","Active","Paid","Confirmed","Won","Accepted","Renewed"].includes(s))return "good";if(["Overdue","Cancelled","Declined","Closed","Blocked","High"].includes(s))return "bad";if(["New","Due","To do","In progress","Scheduled","Building","Waiting"].includes(s))return "warn";return "plain";}
function chip(s){return '<span class="chip '+cls(s)+'">'+e(s||"—")+'</span>';}
function urlLink(u,label){try{const x=new URL(u);return ["https:","http:"].includes(x.protocol)?'<a href="'+e(x.href)+'" target="_blank" rel="noopener noreferrer" class="simple-link">'+e(label||x.hostname)+' ↗</a>':"";}catch{return "";}}
function notice(t,isError=false){let el=$("#hq-notice");if(!el){el=document.createElement("div");el.id="hq-notice";document.body.append(el);}el.textContent=String(t);el.className="notice show"+(isError?" error":"");clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.classList.remove("show"),4500);}
function storeSession(v){S.session=v;if(v)sessionStorage.setItem(SESSION,JSON.stringify(v));else sessionStorage.removeItem(SESSION);}
async function readResponse(r){const t=await r.text();let v;try{v=t?JSON.parse(t):null;}catch{v={message:t.slice(0,180)}}if(!r.ok)throw Error(v?.error_description||v?.msg||v?.message||"Request failed "+r.status);return v;}
async function passwordLogin(email,password){const r=await fetch(API+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});const x=await readResponse(r);if(!x.access_token||!x.refresh_token)throw Error("Missing sign-in tokens.");storeSession({access:x.access_token,refresh:x.refresh_token,email:x.user?.email||email,id:x.user?.id||"",expires:Date.now()+(x.expires_in||3600)*1000});}
let refreshing=null;
async function renewSession(){if(refreshing)return refreshing;refreshing=(async()=>{if(!S.session?.refresh)throw Error("Please sign in again.");const r=await fetch(API+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:S.session.refresh})});const x=await readResponse(r);if(!x.access_token||!x.refresh_token)throw Error("Session expired.");storeSession({access:x.access_token,refresh:x.refresh_token,email:x.user?.email||S.session.email,id:x.user?.id||S.session.id,expires:Date.now()+(x.expires_in||3600)*1000});})();try{await refreshing;}finally{refreshing=null;}}
async function db(method,params="",body,again=false){
 if(!S.session)throw Error("Please sign in.");
 if(Date.now()>S.session.expires-60000)await renewSession();
 const headers={"apikey":KEY,"Authorization":"Bearer "+S.session.access,"Accept":"application/json"};
 if(body!==undefined)headers["Content-Type"]="application/json";
 if(method==="POST")headers.Prefer="return=representation";
 const r=await fetch(API+"/rest/v1/swaymark_items"+params,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});
 if(r.status===401&&!again){await renewSession();return db(method,params,body,true);}
 return readResponse(r);
}
async function fetchItems(){
 S.loading=true;S.error="";render();
 try{const items=[];for(let offset=0;offset<10000;offset+=1000){const chunk=await db("GET","?select=id,kind,payload,created_at,updated_at&order=created_at.desc&limit=1000&offset="+offset);if(!Array.isArray(chunk))throw Error("Unexpected data format.");items.push(...chunk);if(chunk.length<1000)break;}
 S.items=items.filter(x=>F[x.kind]&&x.payload&&typeof x.payload==="object").map(x=>Object.assign({},x.payload,{id:x.id,kind:x.kind,createdAt:x.created_at}));}
 catch(err){S.error=err.message||"Data could not load.";if(/JWT|refresh|session expired/i.test(S.error)){storeSession(null);S.items=[];}}
 finally{S.loading=false;render();}
}
async function add(kind,payload){await db("POST","",{kind,payload});await fetchItems();}
async function modify(id,payload){await db("PATCH","?id=eq."+encodeURIComponent(id),{payload,updated_at:new Date().toISOString()});await fetchItems();}
async function remove(id){await db("DELETE","?id=eq."+encodeURIComponent(id));await fetchItems();}
async function bulk(rows){for(let i=0;i<rows.length;i+=50)await db("POST","",rows.slice(i,i+50));await fetchItems();}
function go(page,id){S.page=page;S.siteId=id||null;S.tab="overview";S.search="";S.filter="All";S.menu=false;render();}
function title(){if(S.page==="site")return byId("websites",S.siteId)?.name||"Website";return S.page==="overview"?"Overview":F[S.page]?.title||"Overview";}
function nav(){return GROUPS.map(g=>'<section class="nav-section"><div class="nav-label">'+g[0]+'</div>'+g[1].map(x=>'<button type="button" class="nav-item '+(S.page===x[0]?"active":"")+'" data-nav="'+x[0]+'"><i>'+x[2]+'</i>'+x[1]+'</button>').join("")+'</section>').join("");}
function shell(body){return '<div class="app"><aside class="sidebar '+(S.menu?"open":"")+'"><div class="brand"><div class="brand-icon">S<span>.</span></div><div><b>SWAYMARK</b><small>BUSINESS HQ</small></div></div><div class="nav-scroller">'+nav()+'</div><div class="account"><div class="account-avatar">'+e(S.session?.email?.charAt(0).toUpperCase()||"S")+'</div><div class="account-info"><strong>My workspace</strong><small>'+e(S.session?.email||"")+'</small></div><button type="button" data-logout title="Sign out">↪</button></div></aside><div class="scrim '+(S.menu?"on":"")+'" data-menu-close></div><div class="area"><header class="topbar"><button class="mobile-menu" data-menu-open type="button">☰</button><div class="crumb">SWAYMARK <span>/</span> '+e(title())+'</div><div class="top-right"><span class="private-dot">● Private workspace</span><button class="btn primary small" type="button" data-new="websites">+ Add website</button></div></header><main class="page">'+(S.error?'<div class="error-strip">Sync issue: '+e(S.error)+' <button data-reload>Retry</button></div>':"")+(S.loading?'<div class="loading-bar"></div>':"")+body+'</main><footer class="footer">SWAYMARK HQ · Your digital business, organised · v2.0</footer></div></div>';}
function login(){return '<div class="login-layout"><div class="login-brand"><div class="logo-large">S<span>.</span></div><div><div class="eyebrow">SWAYMARK / BUSINESS MANAGEMENT</div><h1>Your business.<br><em>One clear view.</em></h1><p>Websites, clients, projects, SEO, maintenance and every task that matters. All in one workspace.</p></div><small>Private business tools, built around your workflow.</small></div><div class="login-right"><form id="login"><div class="eyebrow green">YOUR WORKSPACE</div><h2>Welcome back.</h2><p>Use your existing account to open SWAYMARK HQ.</p><label>Email<input name="email" type="email" required autocomplete="username" placeholder="you@email.com"></label><label>Password<input name="password" type="password" required autocomplete="current-password" placeholder="Your password"></label><div id="login-error" class="form-error"></div><button class="btn primary block" type="submit">Sign in to SWAYMARK HQ →</button><p class="login-small">Your old personal finance screens have been replaced by business management.</p></form></div></div>';}
function hero(h,p,button){return '<div class="hero"><div><div class="eyebrow">SWAYMARK / WORKSPACE</div><h1>'+e(h)+'</h1><p>'+e(p)+'</p></div>'+(button||"")+'</div>';}
function empty(h,p,button){return '<div class="empty"><div class="empty-mark">✦</div><h3>'+e(h)+'</h3><p>'+e(p)+'</p>'+(button||"")+'</div>';}
function stat(k,v,sub,focus=false){return '<div class="stat '+(focus?"focus":"")+'"><div class="stat-heading">'+e(k)+' <span>↗</span></div><div class="stat-value">'+e(v)+'</div><div class="stat-sub">'+e(sub)+'</div></div>';}
function alerts(){
 const r=[];list("domains").filter(x=>x.status!=="Cancelled").forEach(x=>{const n=daysTo(x.expiry);if(n!==null&&n<=60)r.push({title:x.name,type:x.type,date:x.expiry,n});});
 list("websites").forEach(w=>[["domainExpiry","Domain"],["hostingExpiry","Hosting"],["sslExpiry","SSL"]].forEach(p=>{const n=daysTo(w[p[0]]);if(n!==null&&n<=60)r.push({title:w.name,type:p[1],date:w[p[0]],n});}));
 return r.sort((a,b)=>a.n-b.n);
}
function openTasks(){return list("tasks").filter(x=>x.status!=="Done").sort((a,b)=>String(a.dueDate||"9999").localeCompare(String(b.dueDate||"9999")));}
function overview(){
 const sites=list("websites").filter(x=>x.status!=="Archived"),tasks=openTasks(),projects=list("projects").filter(x=>x.status!=="Completed"),leads=list("enquiries").filter(x=>!["Won","Closed"].includes(x.status));
 let h=hero("Your business, organised.","Everything happening across your websites, clients and ongoing work.",'<button class="btn primary" data-new="websites">+ Add website</button>');
 h+='<div class="stats">'+stat("Managed websites",sites.length,"Your current website portfolio",true)+stat("Open tasks",tasks.length,"Next actions to complete")+stat("Active projects",projects.length,"Work in progress")+stat("Open enquiries",leads.length,"Potential new business")+'</div>';
 h+='<div class="two-col"><section class="panel"><div class="panel-head"><h2>Your websites</h2><button data-nav="websites">All websites ↗</button></div>';
 h+=sites.length?sites.slice(0,6).map(w=>'<button class="item-line" data-site="'+e(w.id)+'"><span class="item-avatar">'+e(w.name.charAt(0))+'</span><span><b>'+e(w.name)+'</b><small>'+e(w.platform||"Website")+' · '+e(name("clients",w.clientId))+'</small></span>'+chip(w.status)+'</button>').join(""):empty("Start with a website","Add the sites you build or manage.",'<button class="btn secondary" data-new="websites">Add your first site</button>');
 h+='</section><section class="panel"><div class="panel-head"><h2>Next actions</h2><button data-nav="tasks">All tasks ↗</button></div>';
 h+=tasks.length?tasks.slice(0,6).map(x=>'<div class="item-line"><span class="task-dot"></span><span><b>'+e(x.title)+'</b><small>'+e(name("websites",x.websiteId))+' · '+e(fmtDate(x.dueDate))+'</small></span><button class="text-link" data-edit="tasks:'+e(x.id)+'">Edit</button></div>').join(""):empty("All caught up","Your task list is clear.",'<button class="btn secondary" data-new="tasks">Add task</button>');
 h+='</section></div><div class="two-col"><section class="panel"><div class="panel-head"><h2>Renewals coming up</h2><button data-nav="domains">All renewals ↗</button></div>';
 h+=alerts().length?alerts().slice(0,6).map(x=>'<div class="item-line"><span class="task-dot '+(x.n<=14?"urgent":"")+'"></span><span><b>'+e(x.title)+' · '+e(x.type)+'</b><small>'+e(fmtDate(x.date))+'</small></span>'+chip(x.n<0?"Overdue":x.n+" days")+'</div>').join(""):empty("Nothing urgent","Renewals within 60 days will appear here.","");
 h+='</section><section class="panel tip-panel"><div class="eyebrow">A SMARTER WAY TO WORK</div><h2>Everything starts with a website.</h2><p>Link the client, keep its login URLs, plan SEO, track maintenance and connect tasks. All in one place.</p><button class="btn dark" data-nav="websites">Explore websites ↗</button></section></div>';
 return h;
}
function siteCard(w){
 const seo=list("seo").filter(x=>x.websiteId===w.id),done=seo.filter(x=>x.status==="Completed").length,pc=seo.length?Math.round(done/seo.length*100):0;
 const tasks=list("tasks").filter(x=>x.websiteId===w.id&&x.status!=="Done").length,left=daysTo(w.domainExpiry);
 return '<article class="site-card"><div class="site-top"><span class="site-monogram">'+e(w.name.charAt(0).toUpperCase())+'</span>'+chip(w.status)+'</div><h2>'+e(w.name)+'</h2><p>'+e(w.platform||"Website")+' · '+e(name("clients",w.clientId))+'</p><div class="site-url">'+(urlLink(w.url)||"No URL")+'</div><div class="site-progress"><div><span>SEO checklist</span><b>'+pc+'%</b></div><div class="progress"><i style="width:'+pc+'%"></i></div></div><div class="site-numbers"><span><b>'+tasks+'</b> Open tasks</span><span><b>'+(left===null?"—":left<0?"Late":left+"d")+'</b> Domain renewal</span></div><button class="site-enter" type="button" data-site="'+e(w.id)+'">Open workspace <span>↗</span></button></article>';
}
function websites(){
 let a=list("websites").filter(w=>(!S.search||[w.name,w.url,w.platform,name("clients",w.clientId)].join(" ").toLowerCase().includes(S.search.toLowerCase()))&&(S.filter==="All"||w.status===S.filter));
 let h=hero("Your websites.","A dedicated workspace for every site you build or maintain.",'<button class="btn primary" data-new="websites">+ Add website</button>')+toolbar("websites");
 return h+(a.length?'<div class="sites">'+a.map(siteCard).join("")+'</div>':empty("No websites yet","Add your first site and keep everything together.",'<button class="btn secondary" data-new="websites">Add website</button>'));
}
function toolbar(kind){const vals=kind==="websites"?["Active","Building","Maintenance","Paused","Archived"]:[...new Set(list(kind).map(x=>x.status).filter(Boolean))];return '<div class="toolbar"><label class="search"><span>⌕</span><input type="search" data-search placeholder="Search '+e(F[kind].title.toLowerCase())+'…" value="'+e(S.search)+'"></label><select data-filter><option>All</option>'+vals.map(v=>'<option '+(S.filter===v?"selected":"")+'>'+e(v)+'</option>').join("")+'</select><span>'+list(kind).length+' total</span></div>';}
function renderCell(key,x){let v=x[key];if(key==="clientId")return e(name("clients",v));if(key==="websiteId")return e(name("websites",v));if(key==="projectId")return e(name("projects",v));if(key==="status"||key==="priority")return chip(v);if(["date","dueDate","expiry","followup","publishDate","validUntil","domainExpiry"].includes(key))return e(fmtDate(v));if(["amount","budget"].includes(key))return e(money(v));if(key==="url")return urlLink(v,"Open site")||"—";return e(v||"—");}
function table(kind,rows){
 const f=F[kind];if(!rows.length)return empty("No "+f.title.toLowerCase()+" yet","Keep this part of your business organised.",'<button class="btn secondary" data-new="'+kind+'">+ Add '+e(f.single)+'</button>');
 return '<div class="table-scroll"><table class="data-table"><thead><tr>'+f.cols.map(k=>'<th>'+e((f.fields.find(x=>x[0]===k)||[k,k])[1])+'</th>').join("")+'<th>Actions</th></tr></thead><tbody>'+rows.map(x=>'<tr>'+f.cols.map(k=>'<td>'+renderCell(k,x)+'</td>').join("")+'<td class="table-actions"><button data-edit="'+kind+':'+e(x.id)+'">Edit</button>'+(kind==="tasks"?'<button data-done="'+e(x.id)+'">'+(x.status==="Done"?"Reopen":"Done")+'</button>':"")+(kind==="quotes"?'<button data-quote="'+e(x.id)+'">Print</button>':"")+(kind==="enquiries"?'<button data-clientify="'+e(x.id)+'">Client</button>':"")+'<button class="delete" data-delete="'+kind+':'+e(x.id)+'">Delete</button></td></tr>').join("")+'</tbody></table></div>';
}
function modulePage(kind){
 const f=F[kind],rows=list(kind).filter(x=>(!S.search||JSON.stringify(x).toLowerCase().includes(S.search.toLowerCase()))&&(S.filter==="All"||x.status===S.filter));
 let h=hero(f.title+".","All your "+f.title.toLowerCase()+" in one simple view.",'<button class="btn primary" data-new="'+kind+'">+ New '+e(f.single)+'</button>')+toolbar(kind);
 if(kind==="seo")h+='<div class="hint"><b>SEO works best per website.</b> Open a website to generate your technical and content checklist. All results here are entered manually, not fabricated.</div>';
 return h+table(kind,rows);
}
function quickRow(kind,siteId){const rows=list(kind).filter(x=>x.websiteId===siteId);return rows.length?'<div class="quick-rows">'+rows.slice(0,20).map(x=>'<button data-edit="'+kind+':'+e(x.id)+'"><span><b>'+e(x.title||x.name||x.reference||"Item")+'</b><small>'+e(fmtDate(x.dueDate||x.expiry||x.publishDate))+'</small></span>'+chip(x.status)+'</button>').join("")+'</div>':empty("No linked items yet","Add the first item for this website.",'<button class="btn secondary" data-new="'+kind+'" data-for-site="'+e(siteId)+'">Add '+e(F[kind].single)+'</button>');}
function siteDetail(){
 const w=byId("websites",S.siteId);if(!w)return empty("Website not found","Go back to your websites.",'<button class="btn secondary" data-nav="websites">Back</button>');
 const tabs=[["overview","Overview"],["seo","SEO"],["maintenance","Maintenance"],["tasks","Tasks"],["projects","Projects"],["content","Content"],["domains","Renewals"]];
 let h='<button class="back" data-nav="websites">← All websites</button><div class="site-hero"><div class="site-heading"><span class="site-monogram big">'+e(w.name.charAt(0))+'</span><div><div class="eyebrow">WEBSITE WORKSPACE</div><h1>'+e(w.name)+'</h1><div>'+urlLink(w.url,"Visit website")+' <span class="sep">·</span> '+e(w.platform||"Website")+' <span class="sep">·</span> '+e(name("clients",w.clientId))+'</div></div></div><div class="site-buttons">'+chip(w.status)+'<button class="btn secondary" data-edit="websites:'+e(w.id)+'">Edit website</button></div></div>';
 h+='<div class="site-metrics">'+[["Open tasks",list("tasks").filter(x=>x.websiteId===w.id&&x.status!=="Done").length],["SEO actions",list("seo").filter(x=>x.websiteId===w.id).length],["Maintenance",list("maintenance").filter(x=>x.websiteId===w.id).length],["Projects",list("projects").filter(x=>x.websiteId===w.id).length]].map(x=>'<div><strong>'+x[1]+'</strong><span>'+x[0]+'</span></div>').join("")+'</div>';
 h+='<div class="tabs">'+tabs.map(x=>'<button data-tab="'+x[0]+'" class="'+(S.tab===x[0]?"active":"")+'">'+x[1]+'</button>').join("")+'</div>';
 if(S.tab==="overview"){
 const fields=[["Hosting provider",w.hosting],["Domain registrar",w.registrar],["Domain renewal",fmtDate(w.domainExpiry)],["Hosting renewal",fmtDate(w.hostingExpiry)],["SSL expiry",fmtDate(w.sslExpiry)],["Maintenance plan",w.plan],["Monthly fee",money(w.fee)],["Last backup",fmtDate(w.backupDate)],["Password vault reference",w.vaultRef]];
 h+='<div class="two-col"><section class="panel"><div class="panel-head"><h2>Website essentials</h2></div><dl class="details">'+fields.map(x=>'<dt>'+e(x[0])+'</dt><dd>'+e(x[1]||"Not recorded")+'</dd>').join("")+'</dl></section><section class="panel"><div class="panel-head"><h2>Quick access</h2></div><div class="quick-links">'+[["Live website",w.url],["Admin dashboard",w.adminUrl],["Hosting panel",w.hostingUrl],["Search Console",w.gscUrl],["Google Analytics",w.ga4Url],["PageSpeed Insights",w.url?"https://pagespeed.web.dev/analysis?url="+encodeURIComponent(w.url):""]].filter(x=>urlLink(x[1],x[0])).map(x=>'<div>'+urlLink(x[1],x[0])+'</div>').join("")+'</div><p class="fine">Never save client passwords or API secrets here. Store only a reference to your password manager.</p></section></div>';
 h+='<div class="panel templates"><div class="panel-head"><h2>Set up this website</h2></div><div class="template-actions"><button data-seo-template="'+e(w.id)+'"><strong>⌕ &nbsp; Generate SEO checklist</strong><small>13 standard checks</small></button><button data-maint-template="'+e(w.id)+'"><strong>⚒ &nbsp; Generate maintenance checklist</strong><small>6 standard tasks</small></button><button data-new="tasks" data-for-site="'+e(w.id)+'"><strong>✓ &nbsp; Add a task</strong><small>Keep the next step in view</small></button></div></div>';
 if(w.notes)h+='<section class="panel"><h2>Website notes</h2><p>'+e(w.notes).replace(/\n/g,"<br>")+'</p></section>';
 }else h+='<section class="panel"><div class="panel-head"><h2>'+e(F[S.tab]?.title||"Items")+'</h2><button class="btn primary small" data-new="'+S.tab+'" data-for-site="'+e(w.id)+'">+ Add item</button></div>'+quickRow(S.tab,w.id)+'</section>';
 return h;
}
function settings(){const x=list("settings")[0]||F.settings.defaults;return hero("Settings.","Private preferences and data export.","")+'<div class="two-col"><section class="panel"><h2>Business profile</h2><dl class="details"><dt>Business</dt><dd>'+e(x.businessName||"SWAYMARK")+'</dd><dt>Email</dt><dd>'+e(x.businessEmail||"Not added")+'</dd><dt>Website</dt><dd>'+e(x.businessWebsite||"Not added")+'</dd><dt>Phone</dt><dd>'+e(x.phone||"Not added")+'</dd></dl><button class="btn primary" data-edit-settings>Update profile</button></section><section class="panel"><h2>Data and privacy</h2><p>Export your SWAYMARK business records to a private JSON backup. Personal-finance data is not included.</p><button class="btn secondary" data-export>Export data</button><p class="fine">Keep exported files secure: they may include personal contact details. Do not store client passwords in website notes.</p></section></div>';}
function render(){document.title="SWAYMARK HQ — Business management";const root=$("#root");if(!root)return;if(!S.session){root.innerHTML=login();return;}let body=S.page==="overview"?overview():S.page==="websites"?websites():S.page==="site"?siteDetail():S.page==="settings"?settings():F[S.page]?modulePage(S.page):overview();root.innerHTML=shell(body);}
function fieldEl(f,values){
 const [key,label,type,req,opts=[]]=f,v=values[key]??"";let input="";
 if(type==="textarea")input='<textarea name="'+e(key)+'" rows="4" maxlength="2800">'+e(v)+'</textarea>';
 else if(type==="select"||type==="client"||type==="website"||type==="project"){
  const pairs=type==="select"?opts.map(x=>[x,x]):type==="client"?list("clients").map(x=>[x.id,x.name+(x.company?" · "+x.company:"")]):type==="website"?list("websites").map(x=>[x.id,x.name]):list("projects").map(x=>[x.id,x.title]);
  input='<select name="'+e(key)+'" '+(req?"required":"")+'><option value="">— Select —</option>'+pairs.map(x=>'<option value="'+e(x[0])+'" '+(v===x[0]?"selected":"")+'>'+e(x[1])+'</option>').join("")+'</select>';
 }else input='<input name="'+e(key)+'" type="'+e(type)+'" value="'+e(v)+'" '+(req?"required":"")+(type==="number"?' min="0" max="999999999" step="0.01"':type==="time"?"":' maxlength="240"')+'>';
 return '<label class="field '+(type==="textarea"?"wide":"")+'"><span>'+e(label)+(req?" *":"")+'</span>'+input+'</label>';
}
function editor(kind,id="",seed={}){
 const cfg=F[kind];if(!cfg)return;const prior=id?byId(kind,id):null,values=Object.assign({},cfg.defaults||{},seed,prior||{});
 $("#edit-dialog")?.remove();
 const dlg=document.createElement("dialog");dlg.id="edit-dialog";dlg.className="dialog";
 dlg.innerHTML='<div class="dialog-head"><div><div class="eyebrow">SWAYMARK / '+e(cfg.title.toUpperCase())+'</div><h2>'+(prior?"Edit ":"Add ")+e(cfg.single)+'</h2></div><button type="button" data-close-dialog aria-label="Close">×</button></div><form id="record-form"><div class="form-grid">'+cfg.fields.map(x=>fieldEl(x,values)).join("")+'</div>'+(kind==="websites"?'<p class="warning-note">Passwords and API secrets should stay in your password manager, not in website notes.</p>':"")+'<div class="dialog-actions"><button type="button" class="btn ghost" data-close-dialog>Cancel</button><button class="btn primary" id="submit-record" type="submit">Save '+e(cfg.single)+'</button></div></form>';
 document.body.append(dlg);dlg.showModal();
 dlg.addEventListener("close",()=>dlg.remove(),{once:true});
 dlg.addEventListener("click",ev=>{if(ev.target.closest("[data-close-dialog]"))dlg.close();});
 dlg.querySelector("form").addEventListener("submit",async ev=>{
  ev.preventDefault();if(S.saving)return;
  const form=ev.currentTarget;if(!form.reportValidity())return;
  const payload={};
  for(const f of cfg.fields){
   const raw=String(form.elements.namedItem(f[0])?.value||"").trim();if(f[3]&&!raw){notice("Complete the required fields.",true);return;}
   if(f[2]==="number"){const n=raw?Number(raw):0;if(!Number.isFinite(n)||n<0||n>999999999){notice("Invalid amount.",true);return;}payload[f[0]]=Math.round(n*100)/100;}
   else if(f[2]==="url"&&raw){try{const v=new URL(raw);if(!["http:","https:"].includes(v.protocol))throw Error("Invalid protocol");payload[f[0]]=v.href;}catch{notice("Use a valid http or https link in "+f[1],true);return;}}
   else payload[f[0]]=raw.slice(0,2800);
  }
  S.saving=true;const btn=$("#submit-record");btn.disabled=true;btn.textContent="Saving…";
  try{if(prior)await modify(id,payload);else await add(kind,payload);dlg.close();notice("Saved "+cfg.single+".");}
  catch(err){notice("Save failed: "+err.message,true);}
  finally{S.saving=false;if(btn.isConnected){btn.disabled=false;btn.textContent="Save "+cfg.single;}}
 });
}
async function template(kind,id){
 const original=kind==="seo"?SEO_BASE.map(x=>({title:x[0],area:x[1],websiteId:id,status:"To do",notes:"Review and update after checking the live website."})):MAINT_BASE.map(x=>({title:x,websiteId:id,status:"Scheduled",frequency:"Monthly",dueDate:today(),notes:"Record what was checked or changed."}));
 const existing=list(kind).filter(x=>x.websiteId===id).map(x=>x.title);
 const rows=original.filter(x=>!existing.includes(x.title)).map(payload=>({kind,payload}));
 if(!rows.length){notice("The checklist is already set up.");return;}
 try{await bulk(rows);notice(rows.length+" checklist items created.");}catch(err){notice(err.message,true);}
}
async function toggleTask(id){const x=byId("tasks",id);if(!x)return;const payload={};for(const f of F.tasks.fields)payload[f[0]]=x[f[0]]??"";payload.status=x.status==="Done"?"To do":"Done";try{await modify(id,payload);notice("Task updated.");}catch(err){notice(err.message,true);}}
async function convertLead(id){const x=byId("enquiries",id);if(!x)return;if(x.email&&list("clients").some(y=>y.email&&y.email.toLowerCase()===x.email.toLowerCase())){notice("This email is already linked to a client.",true);return;}try{await add("clients",{name:x.name,email:x.email||"",phone:x.phone||"",company:"",status:"Active",notes:"From enquiry: "+String(x.notes||"").slice(0,1500)});notice("Client added.");}catch(err){notice(err.message,true);}}
function printQuote(id){const q=byId("quotes",id);if(!q)return;const brand=e(list("settings")[0]?.businessName||"SWAYMARK");const w=window.open("","_blank","width=860,height=760");if(!w){notice("Allow pop-ups to print.",true);return;}w.opener=null;
 const html='<html><head><title>Quote</title><meta charset="utf-8"><style>body{font:15px/1.7 Arial,sans-serif;margin:50px;color:#15301f}h1{letter-spacing:.1em}.line{padding:12px 0;border-bottom:1px solid #dde5db}.total{text-align:right;font-size:30px;font-weight:bold}small{color:#68766b}</style></head><body><h1>'+brand+'</h1><p>Project quote</p><div class="line"><b>Client:</b> '+e(name("clients",q.clientId))+'</div><div class="line"><b>Project:</b> '+e(q.title)+'</div><div class="line"><b>Valid until:</b> '+e(fmtDate(q.validUntil))+'</div><h2>Scope</h2><p>'+e(q.notes||"Scope to be agreed in writing.").replace(/\n/g,"<br>")+'</p><p class="total">'+e(money(q.amount))+'</p><small>Draft quote only, not a tax invoice. Final terms must be confirmed in writing.</small></body></html>';w.document.open();w.document.write(html);w.document.close();w.focus();w.print();}
function exportData(){const records=S.items.map(x=>({kind:x.kind,payload:Object.fromEntries(Object.entries(x).filter(pair=>!["id","kind","createdAt"].includes(pair[0])))}));const b=new Blob([JSON.stringify({format:"swaymark-hq",version:2,exportedAt:new Date().toISOString(),records},null,2)],{type:"application/json"});const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="swaymark-hq-"+today()+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);notice("Business data exported. Keep the file secure.");}
async function logout(){try{await fetch(API+"/auth/v1/logout",{method:"POST",headers:{"apikey":KEY,"Authorization":"Bearer "+S.session.access}});}catch{}storeSession(null);S.items=[];render();}
document.addEventListener("click",async ev=>{
 const t=ev.target.closest("[data-nav],[data-site],[data-new],[data-edit],[data-delete],[data-done],[data-clientify],[data-quote],[data-tab],[data-seo-template],[data-maint-template],[data-edit-settings],[data-export],[data-logout],[data-reload],[data-menu-open],[data-menu-close]");
 if(!t)return;const d=t.dataset;
 if("menuOpen" in d){S.menu=true;render();return;}if("menuClose" in d){S.menu=false;render();return;}
 if(d.nav){go(d.nav);return;}if(d.site){go("site",d.site);return;}if(d.tab){S.tab=d.tab;render();return;}
 if(d.new){const w=d.forSite?byId("websites",d.forSite):null;editor(d.new,"",w?{websiteId:w.id,clientId:w.clientId||""}:{});return;}
 if(d.edit){const n=d.edit.indexOf(":");editor(d.edit.slice(0,n),d.edit.slice(n+1));return;}
 if("editSettings" in d){editor("settings",list("settings")[0]?.id||"");return;}
 if(d.delete){const n=d.delete.indexOf(":"),kind=d.delete.slice(0,n),id=d.delete.slice(n+1);if(!window.confirm("Delete this "+F[kind].single+"? This cannot be undone."))return;try{await remove(id);notice("Item deleted.");}catch(err){notice(err.message,true);}return;}
 if(d.done){await toggleTask(d.done);return;}if(d.clientify){await convertLead(d.clientify);return;}
 if(d.quote){printQuote(d.quote);return;}
 if(d.seoTemplate){await template("seo",d.seoTemplate);return;}if(d.maintTemplate){await template("maintenance",d.maintTemplate);return;}
 if("export" in d){exportData();return;}if("logout" in d){await logout();return;}if("reload" in d){await fetchItems();return;}
});
document.addEventListener("input",ev=>{if(ev.target.matches("[data-search]")){S.search=ev.target.value.slice(0,120);const start=ev.target.selectionStart,end=ev.target.selectionEnd;render();const x=$("[data-search]");if(x){x.focus();try{x.setSelectionRange(start,end);}catch{}}}});
document.addEventListener("change",ev=>{if(ev.target.matches("[data-filter]")){S.filter=ev.target.value;render();}});
document.addEventListener("submit",async ev=>{if(ev.target.id!=="login")return;ev.preventDefault();const data=new FormData(ev.target);const button=ev.target.querySelector("button[type=submit]");button.disabled=true;button.textContent="Signing in…";try{await passwordLogin(String(data.get("email")||"").trim(),String(data.get("password")||""));await fetchItems();notice("Welcome to SWAYMARK HQ.");}catch(err){storeSession(null);$("#login-error").textContent=err.message||"Could not sign in.";button.disabled=false;button.textContent="Sign in to SWAYMARK HQ →";}});
document.addEventListener("keydown",ev=>{if(ev.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){const x=$("[data-search]");if(x){ev.preventDefault();x.focus();}}});
(async()=>{try{const x=JSON.parse(sessionStorage.getItem(SESSION)||"null");if(x?.access&&x?.refresh&&x?.id){S.session=x;if(Date.now()>x.expires-60000)await renewSession();}}catch{storeSession(null);}render();if(S.session)await fetchItems();})();
