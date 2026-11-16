/* SWAYMARK Business Hub - device-only prototype.
   Important: no backend, no authentication and no website form integration.
   Do not use with confidential real client data until a separate secure backend is in place.
*/
(() => {
  "use strict";
  const STORAGE_KEY = "swaymark-business-hub-demo-v1";
  const VERSION = 1;
  const currencies = ["ZAR","AUD","USD","GBP","EUR"];
  const definitions = {
    enquiries: {
      title: "Enquiries", single: "enquiry", intro: "Keep track of new conversations and follow-ups before they turn into projects.",
      columns: [["name","Name"],["service","Interested in"],["source","Source"],["status","Status"],["followup","Follow up"]],
      fields: [
        {key:"name",label:"Contact name",type:"text",required:true},
        {key:"email",label:"Email address",type:"email"},
        {key:"phone",label:"Phone",type:"tel"},
        {key:"service",label:"Service",type:"select",required:true,options:["New website","Website redesign","Website maintenance","SEO & Google visibility","Digital marketing","Social media & content","Performance & analytics","A mix of services","Other"]},
        {key:"source",label:"Where did they find you?",type:"select",options:["Website","Email","Phone","Social media","Referral","Other"]},
        {key:"status",label:"Enquiry stage",type:"select",options:["New","Contacted","Quoted","Won","Closed"]},
        {key:"followup",label:"Next follow-up",type:"date"},
        {key:"message",label:"Notes / project details",type:"textarea",wide:true}
      ]
    },
    clients: {
      title:"Clients", single:"client", intro:"All your client contacts and business details in one easy-to-find place.",
      columns:[["name","Contact"],["business","Business"],["email","Email"],["phone","Phone"]],
      fields:[
        {key:"name",label:"Contact name",type:"text",required:true},
        {key:"business",label:"Business name",type:"text"},
        {key:"email",label:"Email address",type:"email"},
        {key:"phone",label:"Phone number",type:"tel"},
        {key:"notes",label:"Internal notes",type:"textarea",wide:true}
      ]
    },
    quotes: {
      title:"Quotes",single:"quote",intro:"Prepare, track and print professional project proposals.",
      columns:[["title","Quote"],["clientId","Client"],["amount","Amount"],["status","Stage"],["validUntil","Valid until"]],
      fields:[
        {key:"title",label:"Quote title",type:"text",required:true},
        {key:"clientId",label:"Client",type:"client"},
        {key:"amount",label:"Proposed amount",type:"number",required:true},
        {key:"status",label:"Quote stage",type:"select",options:["Draft","Sent","Accepted","Declined"]},
        {key:"validUntil",label:"Valid until",type:"date"},
        {key:"notes",label:"Scope / inclusions",type:"textarea",wide:true}
      ]
    },
    bookings: {
      title:"Bookings",single:"booking",intro:"Schedule calls, consultations and project sessions without losing track.",
      columns:[["service","Booking"],["clientId","Client"],["date","Date"],["time","Time"],["status","Status"]],
      fields:[
        {key:"service",label:"Booking title / service",type:"text",required:true},
        {key:"clientId",label:"Client",type:"client"},
        {key:"date",label:"Booking date",type:"date",required:true},
        {key:"time",label:"Time",type:"time"},
        {key:"status",label:"Booking stage",type:"select",options:["Planned","Confirmed","Completed","Cancelled"]},
        {key:"notes",label:"Agenda / instructions",type:"textarea",wide:true}
      ]
    },
    projects: {
      title:"Projects",single:"project",intro:"See every website, SEO or marketing project from idea through delivery.",
      columns:[["title","Project"],["clientId","Client"],["deadline","Deadline"],["status","Stage"],["budget","Budget"]],
      fields:[
        {key:"title",label:"Project name",type:"text",required:true},
        {key:"clientId",label:"Client",type:"client"},
        {key:"deadline",label:"Target completion",type:"date"},
        {key:"status",label:"Project stage",type:"select",options:["Planning","In progress","Waiting","Completed"]},
        {key:"budget",label:"Agreed project value",type:"number"},
        {key:"notes",label:"Deliverables / internal notes",type:"textarea",wide:true}
      ]
    },
    tasks: {
      title:"Tasks",single:"task",intro:"Prioritise your day and keep completed work visible for reference.",
      columns:[["title","Task"],["projectId","Project"],["due","Due"],["priority","Priority"],["status","Status"]],
      fields:[
        {key:"title",label:"Task",type:"text",required:true},
        {key:"projectId",label:"Related project",type:"project"},
        {key:"due",label:"Due date",type:"date"},
        {key:"priority",label:"Priority",type:"select",options:["Low","Normal","High"]},
        {key:"status",label:"Progress",type:"select",options:["To do","In progress","Done"]},
        {key:"notes",label:"Task notes",type:"textarea",wide:true}
      ]
    },
    finance: {
      title:"Finance",single:"finance record",intro:"A straightforward view of invoice, payment and expense entries. This is not accounting software.",
      columns:[["reference","Reference"],["type","Type"],["clientId","Client"],["amount","Amount"],["status","Status"]],
      fields:[
        {key:"reference",label:"Reference / description",type:"text",required:true},
        {key:"type",label:"Type",type:"select",options:["Invoice","Payment","Expense"]},
        {key:"clientId",label:"Related client",type:"client"},
        {key:"amount",label:"Amount",type:"number",required:true},
        {key:"status",label:"Status",type:"select",options:["Due","Paid","Recorded","Cancelled"]},
        {key:"due",label:"Date / due date",type:"date"},
        {key:"notes",label:"Notes",type:"textarea",wide:true}
      ]
    }
  };
  const defaults = {
    enquiries:{status:"New",source:"Website"},
    quotes:{status:"Draft"},
    bookings:{status:"Planned"},
    projects:{status:"Planning"},
    tasks:{status:"To do",priority:"Normal"},
    finance:{type:"Invoice",status:"Due"}
  };
  const titles = {dashboard:["Your business, in one place.","A clearer view of your enquiries, bookings, client projects and daily priorities."],settings:["Workspace settings.","Manage your local demo records, backups and preferences."]};
  const screen = document.getElementById("screen");
  const editor = document.getElementById("editor");
  const form = document.getElementById("recordForm");
  const toastEl = document.getElementById("toast");
  let toastTimer;
  let activeView = "dashboard";
  let searchText = "";
  let currentFilter = "all";
  let editorType = "";
  let editorId = "";
  let storageWorks = true;

  function emptyStore() {
    return {enquiries:[],clients:[],quotes:[],bookings:[],projects:[],tasks:[],finance:[],settings:{currency:"ZAR"}};
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function uniqueId() {
    return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : "rec-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
  }
  function cleanStore(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid workspace data.");
    const result = emptyStore();
    for (const type of Object.keys(definitions)) {
      if (!Array.isArray(raw[type])) throw new Error("The backup is missing "+type+".");
      if (raw[type].length > 2500) throw new Error("Too many records in "+type+".");
      result[type] = raw[type].map(item => {
        if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Invalid "+type+" record.");
        const out = {
          id:String(item.id || uniqueId()).slice(0,80),
          createdAt:String(item.createdAt || new Date().toISOString()).slice(0,40),
          updatedAt:String(item.updatedAt || new Date().toISOString()).slice(0,40)
        };
        for (const field of definitions[type].fields) {
          const original = item[field.key];
          if (field.type === "number") {
            const num = Number(original);
            out[field.key] = Number.isFinite(num) && num >= 0 && num <= 1e9 ? num : 0;
          } else {
            out[field.key] = String(original == null ? "" : original).slice(0,2000);
          }
        }
        return out;
      });
    }
    result.settings.currency = currencies.includes(raw.settings && raw.settings.currency) ? raw.settings.currency : "ZAR";
    return result;
  }
  function loadStore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? cleanStore(JSON.parse(saved)) : emptyStore();
    } catch (error) {
      storageWorks = false;
      return emptyStore();
    }
  }
  let db = loadStore();
  function cloneStore() { return JSON.parse(JSON.stringify(db)); }
  function commit(next, successMessage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      db = next;
      storageWorks = true;
      if (successMessage) toast(successMessage);
      render();
      return true;
    } catch (error) {
      storageWorks = false;
      toast("This browser cannot save changes. Check its storage settings.");
      return false;
    }
  }
  function toast(message) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add("show");
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 4600);
  }
  function localDate(days) {
    const d = new Date();
    d.setHours(12,0,0,0);
    d.setDate(d.getDate() + (days || 0));
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }
  function displayDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return "—";
    const date = new Date(value+"T12:00:00");
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-ZA",{day:"numeric",month:"short",year:"numeric"}).format(date);
  }
  function displayMoney(value) {
    const currency = currencies.includes(db.settings.currency) ? db.settings.currency : "ZAR";
    return new Intl.NumberFormat("en-ZA",{style:"currency",currency,maximumFractionDigits:2}).format(Number(value) || 0);
  }
  function iconFor(value) {
    return String(value || "?").trim().charAt(0).toUpperCase() || "?";
  }
  function labelFor(type,id) {
    const record = db[type].find(item => item.id === id);
    return record ? String(record.name || record.title || record.service || "Untitled") : "—";
  }
  function stageColor(stage) {
    if (["Won","Accepted","Confirmed","Completed","Done","Paid","Recorded"].includes(stage)) return "green";
    if (["New","Draft","To do","Due","Planned","High"].includes(stage)) return "amber";
    if (["Closed","Declined","Cancelled"].includes(stage)) return "red";
    if (["In progress","Contacted","Quoted","Sent","Waiting"].includes(stage)) return "blue";
    return "";
  }
  function stagePill(stage) { return '<span class="pill '+stageColor(stage)+'">'+escapeHTML(stage || "—")+'</span>'; }
  function countOpenEnquiries() { return db.enquiries.filter(v => !["Won","Closed"].includes(v.status)).length; }
  function countPendingQuotes() { return db.quotes.filter(v => ["Draft","Sent"].includes(v.status)).length; }
  function countUpcomingBookings() { return db.bookings.filter(v => v.date && v.date >= localDate() && !["Cancelled","Completed"].includes(v.status)).length; }
  function countOpenTasks() { return db.tasks.filter(v => v.status !== "Done").length; }
  function recordTitle(type,record) { return type === "enquiries" || type === "clients" ? record.name : type === "finance" ? record.reference : type === "bookings" ? record.service : record.title; }
  function excerpt(text,n) { const t=String(text||""); return t.length > n ? t.slice(0,n-1)+"…" : t; }
  function infoRow(main,sub,side) {
    return '<div class="timeline-row"><span class="item-avatar">'+escapeHTML(iconFor(main))+'</span><div class="timeline-info"><strong>'+escapeHTML(main)+'</strong><small>'+escapeHTML(sub)+'</small></div><div class="timeline-side">'+escapeHTML(side)+'</div></div>';
  }
  function emptyPanel(message) { return '<p class="section-note">'+escapeHTML(message)+'</p>'; }
  function metric(title,value,caption,symbol,highlight) {
    return '<article class="metric '+(highlight?'metric-accent':'')+'"><div class="metric-top"><span>'+escapeHTML(title)+'</span><span class="metric-icon" aria-hidden="true">'+escapeHTML(symbol)+'</span></div><strong>'+escapeHTML(value)+'</strong><small>'+escapeHTML(caption)+'</small></article>';
  }
  function panel(title,description,link,content) {
    return '<section class="panel"><div class="panel-head"><div><h2>'+escapeHTML(title)+'</h2><p>'+escapeHTML(description)+'</p></div><button class="text-action" data-action="goto" data-view="'+escapeHTML(link)+'">View all ↗</button></div>'+content+'</section>';
  }
  function renderDashboard() {
    const recent = [...db.enquiries].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,5);
    const upcoming = db.bookings.filter(v => v.date && v.date >= localDate() && !["Completed","Cancelled"].includes(v.status)).sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time))).slice(0,5);
    const tasks = db.tasks.filter(v => v.status !== "Done").sort((a,b)=>String(a.due||"9999").localeCompare(String(b.due||"9999"))).slice(0,5);
    const pipeline = db.quotes.filter(q=>["Draft","Sent"].includes(q.status)).reduce((sum,q)=>sum+(Number(q.amount)||0),0);
    const collected = db.finance.filter(f=>f.type==="Payment" && ["Paid","Recorded"].includes(f.status)).reduce((sum,f)=>sum+(Number(f.amount)||0),0);
    const projectCount = db.projects.filter(p=>p.status!=="Completed").length;
    screen.innerHTML =
      '<div class="metrics">'+
        metric("Open enquiries",countOpenEnquiries(),"Waiting for follow-up","↗",true)+
        metric("Pending quotes",countPendingQuotes(),"Draft or sent proposals","▤",false)+
        metric("Upcoming bookings",countUpcomingBookings(),"Scheduled from today","▦",false)+
        metric("Tasks to action",countOpenTasks(),"To do or in progress","☑",false)+
      '</div><div class="dashboard-grid">'+
      panel("Latest enquiries","Your newest opportunities","enquiries",recent.length?recent.map(e=>infoRow(e.name,e.service || e.source || "Enquiry",e.status||"New")).join(""):emptyPanel("No enquiries added yet. Start with the New enquiry button."))+
      panel("Upcoming bookings","Calls and sessions on your calendar","bookings",upcoming.length?upcoming.map(b=>infoRow(b.service,labelFor("clients",b.clientId),displayDate(b.date))).join(""):emptyPanel("Your schedule is clear. Add a booking when you are ready."))+
      panel("Priority tasks","What needs your attention","tasks",tasks.length?tasks.map(t=>infoRow(t.title,labelFor("projects",t.projectId),t.due?displayDate(t.due):t.priority||"To do")).join(""):emptyPanel("No outstanding tasks right now."))+
      '<section class="panel"><div class="panel-head"><div><h2>Business snapshot</h2><p>A simple look across your workspace</p></div><button class="text-action" data-action="goto" data-view="finance">Finance ↗</button></div>'+
      '<div class="stats-stack"><div class="mini-stat"><strong>'+projectCount+'</strong><small>Active projects</small></div><div class="mini-stat"><strong>'+db.clients.length+'</strong><small>Clients</small></div><div class="mini-stat"><strong>'+db.quotes.length+'</strong><small>Quotes total</small></div></div>'+
      '<div class="timeline-row"><div class="timeline-info"><strong>Proposals in progress</strong><small>Total value of draft and sent quotes</small></div><div class="timeline-side"><strong>'+escapeHTML(displayMoney(pipeline))+'</strong></div></div>'+
      '<div class="timeline-row"><div class="timeline-info"><strong>Payments recorded</strong><small>Entries marked as paid or recorded</small></div><div class="timeline-side"><strong>'+escapeHTML(displayMoney(collected))+'</strong></div></div>'+
      '</section></div>'+
      '<div class="overview-banner"><div><strong>One place for the work behind your business.</strong><p>From that first enquiry to your final handover, keep the next step clear. Website forms are not linked to this prototype yet.</p></div><button class="btn btn-lime" data-action="new" data-type="projects">+ Start a project</button></div>';
  }
  function cellValue(type,key,record) {
    let value = record[key];
    if (key === "clientId") return escapeHTML(labelFor("clients",value));
    if (key === "projectId") return escapeHTML(labelFor("projects",value));
    if (["status","priority"].includes(key)) return stagePill(value);
    if (["date","followup","validUntil","deadline","due"].includes(key)) return escapeHTML(displayDate(value));
    if (["amount","budget"].includes(key)) return '<strong>'+escapeHTML(displayMoney(value))+'</strong>';
    if (["name","title","service","reference"].includes(key) && key===definitions[type].columns[0][0]) {
      const sub = type==="enquiries"?record.email:type==="clients"?record.business:record.notes;
      return '<span class="record-title">'+escapeHTML(value || "—")+'</span>'+(sub?'<span class="record-sub">'+escapeHTML(excerpt(sub,54))+'</span>':"");
    }
    return escapeHTML(value || "—");
  }
  function recordActions(type,record) {
    const common = '<button class="action-button" data-action="edit" data-type="'+type+'" data-id="'+escapeHTML(record.id)+'">Edit</button>'+
                   '<button class="action-button danger" data-action="delete" data-type="'+type+'" data-id="'+escapeHTML(record.id)+'">Delete</button>';
    const extra = type==="enquiries" ? '<button class="action-button" data-action="convert" data-id="'+escapeHTML(record.id)+'">Add client</button>' :
      type==="quotes" ? '<button class="action-button" data-action="print-quote" data-id="'+escapeHTML(record.id)+'">Print</button>' :
      type==="tasks" ? '<button class="action-button" data-action="toggle-task" data-id="'+escapeHTML(record.id)+'">'+(record.status==="Done"?"Reopen":"Complete")+'</button>' : "";
    return '<div class="record-actions">'+extra+common+'</div>';
  }
  function renderList() {
    const config = definitions[activeView];
    if (!config) return;
    let records = [...db[activeView]];
    records.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    if (searchText) {
      const term=searchText.toLocaleLowerCase();
      records=records.filter(item => (Object.values(item).join(" ")+" "+labelFor("clients",item.clientId)+" "+labelFor("projects",item.projectId)).toLocaleLowerCase().includes(term));
    }
    if (currentFilter!=="all") records=records.filter(item=>String(item.status||"")===currentFilter);
    const statusFields = config.fields.find(f=>f.key==="status");
    const statusSelect = document.getElementById("statusFilter");
    statusSelect.innerHTML = '<option value="all">All statuses</option>'+(statusFields ? statusFields.options.map(s=>'<option value="'+escapeHTML(s)+'" '+(currentFilter===s?"selected":"")+'>'+escapeHTML(s)+'</option>').join(""):"");
    statusSelect.hidden=!statusFields;
    document.getElementById("listToolbar").hidden=false;
    document.getElementById("sectionAdd").textContent="+ Add "+config.single;
    document.getElementById("searchInput").placeholder="Search "+config.title.toLowerCase();
    document.getElementById("searchInput").value=searchText;
    if (!records.length) {
      const filtered=searchText||currentFilter!=="all";
      screen.innerHTML='<section class="table-panel"><div class="table-heading"><div><h2>'+escapeHTML(config.title)+'</h2><p>'+db[activeView].length+' total records</p></div></div>'+
        '<div class="empty-state"><span class="empty-illustration" aria-hidden="true">◇</span><h3>'+(filtered?"No matching records yet":"Nothing here yet")+'</h3><p>'+(filtered?"Try a different search or status filter.":"Create your first "+escapeHTML(config.single)+" to start building your workspace.")+'</p>'+
        (filtered?'<button class="btn btn-outline" data-action="clear-filters">Clear filters</button>':'<button class="btn btn-dark" data-action="new" data-type="'+activeView+'">+ Add '+escapeHTML(config.single)+'</button>')+
      '</div></section>';
      return;
    }
    let table='<table class="record-table"><thead><tr>'+config.columns.map(c=>'<th scope="col">'+escapeHTML(c[1])+'</th>').join("")+'<th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>';
    table += records.map(row=>'<tr>'+config.columns.map(col=>'<td>'+cellValue(activeView,col[0],row)+'</td>').join("")+'<td>'+recordActions(activeView,row)+'</td></tr>').join("");
    table+='</tbody></table>';
    screen.innerHTML='<section class="table-panel"><div class="table-heading"><div><h2>'+escapeHTML(config.title)+'</h2><p>'+records.length+' shown of '+db[activeView].length+' records</p></div></div>'+table+'</section>';
  }
  function renderSettings() {
    document.getElementById("listToolbar").hidden=true;
    const current=db.settings.currency;
    const options=currencies.map(c=>'<option value="'+c+'" '+(c===current?"selected":"")+'>'+c+'</option>').join("");
    screen.innerHTML=
      '<div class="settings-grid">'+
      '<section class="panel"><span class="eyebrow">WORKSPACE</span><h2>Currency &amp; display</h2><p>Choose the currency used to display your figures. This changes the symbol, not the numeric amounts or exchange rates.</p><label for="currencyPref"><strong>Display currency</strong></label><select id="currencyPref">'+options+'</select><p class="small-note">Your public SWAYMARK website is separate from this workspace.</p></section>'+
      '<section class="panel"><span class="eyebrow">DATA</span><h2>Back up your work</h2><p>Export a JSON backup file to your device. There is no cloud backup or cross-device syncing in this prototype.</p><div class="setting-actions"><button class="btn btn-dark" data-action="export">Download backup</button><button class="btn btn-outline" data-action="restore">Restore backup</button><input type="file" id="restoreFile" accept=".json,application/json" hidden></div><p class="small-note">Restoring a backup replaces all local records in this browser. Store backups safely.</p></section>'+
      '<section class="panel"><span class="eyebrow">GET STARTED</span><h2>Explore the demo</h2><p>Fill the workspace with clearly labelled sample records to see the dashboard, quote printing, tasks and client relationships in action.</p><div class="setting-actions"><button class="btn btn-dark" data-action="samples">Load sample records</button><button class="btn btn-danger" data-action="reset">Clear all local data</button></div><p class="small-note">Loading sample records replaces the current workspace after confirmation.</p></section>'+
      '<section class="panel"><span class="eyebrow">NEXT DEVELOPMENT PHASE</span><h2>Connected business app</h2><p>For real use, SWAYMARK needs its own database, private login, server-side form integration, backups and access controls. The existing Clean Carpets &amp; Pest Control Perth system must stay separate.</p><p>Until then, this app is a visual and functional prototype only. Do not enter sensitive personal or financial information.</p><p class="small-note">Release 0.1 · No third-party scripts · No advertising trackers</p></section>'+
      '</div>';
  }
  function closeMobileNav() {
    const sidebar=document.getElementById("sidePanel");
    sidebar.classList.remove("open");
    document.getElementById("sideScrim").classList.remove("open");
    document.getElementById("navToggle").setAttribute("aria-expanded","false");
  }
  function render() {
    activeView = (location.hash||"#dashboard").slice(1);
    if (!titles[activeView]&&!definitions[activeView]) activeView="dashboard";
    const config=definitions[activeView];
    document.getElementById("viewTitle").textContent=config?config.title+" at a glance.":titles[activeView][0];
    document.getElementById("viewDescription").textContent=config?config.intro:titles[activeView][1];
    document.getElementById("breadcrumbCurrent").textContent=config?config.title:activeView==="settings"?"Settings":"Dashboard";
    document.getElementById("enquiryCount").textContent=countOpenEnquiries()?String(countOpenEnquiries()):"";
    document.querySelectorAll(".nav-link[data-view]").forEach(el=>{
      const current=el.dataset.view===activeView;
      el.classList.toggle("active",current);
      if(current) el.setAttribute("aria-current","page");
      else el.removeAttribute("aria-current");
    });
    document.getElementById("listToolbar").hidden=true;
    if(activeView==="dashboard") renderDashboard();
    else if(activeView==="settings") renderSettings();
    else renderList();
    const alert=document.querySelector(".prototype-alert p");
    if(!storageWorks) alert.textContent="Local browser storage is unavailable. New records cannot be saved on this device. Enable storage before using this prototype.";
    closeMobileNav();
  }
  function goto(view) {
    if (!definitions[view] && !titles[view]) return;
    searchText="";
    currentFilter="all";
    if(location.hash==="#"+view) render();
    else location.hash=view;
  }
  function renderField(field,value) {
    const id="field-"+field.key;
    const required=field.required?' required':'';
    const mark=field.required?' <span aria-hidden="true">*</span>':"";
    const val=value == null ? "" : value;
    let input="";
    if(field.type==="textarea") {
      input='<textarea id="'+id+'" name="'+field.key+'" maxlength="2000"'+required+'>'+escapeHTML(val)+'</textarea>';
    } else if(["select","client","project"].includes(field.type)) {
      let options = field.type==="select" ? field.options.map(x=>({id:x,label:x})) :
        field.type==="client" ? db.clients.map(x=>({id:x.id,label:(x.business?x.business+" — ":"")+x.name})) :
        db.projects.map(x=>({id:x.id,label:x.title}));
      input='<select id="'+id+'" name="'+field.key+'"'+required+'><option value="">'+(field.type==="select"?"Select an option":"No link selected")+'</option>'+
        options.map(o=>'<option value="'+escapeHTML(o.id)+'"'+(String(val)===String(o.id)?" selected":"")+'>'+escapeHTML(o.label)+'</option>').join("")+'</select>';
    } else {
      const min=field.type==="number"?' min="0" max="1000000000" step="0.01"':"";
      const max=field.type==="text"||field.type==="email"||field.type==="tel"?' maxlength="180"':"";
      input='<input id="'+id+'" name="'+field.key+'" type="'+field.type+'" value="'+escapeHTML(val)+'"'+required+min+max+'>';
    }
    return '<div class="form-field '+(field.wide?"full":"")+'"><label for="'+id+'">'+escapeHTML(field.label)+mark+'</label>'+input+'</div>';
  }
  function openEditor(type,id) {
    if(!definitions[type]) return;
    const existing=id?db[type].find(x=>x.id===id):null;
    editorType=type;editorId=existing?existing.id:"";
    const config=definitions[type];
    document.getElementById("modalHeading").textContent=(existing?"Edit ":"New ")+config.single;
    document.getElementById("modalDescription").textContent="This will be stored only in this browser, not sent to your website or email.";
    document.getElementById("recordFields").innerHTML=config.fields.map(field=>renderField(field,existing?existing[field.key]:((defaults[type]||{})[field.key]||""))).join("");
    document.getElementById("saveRecord").textContent=existing?"Save changes":"Create "+config.single;
    if(typeof editor.showModal==="function") editor.showModal();
    else editor.setAttribute("open","");
    const first=form.querySelector("input,select,textarea");
    if(first) first.focus();
  }
  function closeEditor() {
    if(typeof editor.close==="function" && editor.open) editor.close();
    else editor.removeAttribute("open");
  }
  function saveEditor(event) {
    event.preventDefault();
    if(!editorType || !definitions[editorType] || !form.reportValidity()) return;
    const next=cloneStore();
    const record={};
    for(const field of definitions[editorType].fields) {
      const input=form.elements.namedItem(field.key);
      if(!input) continue;
      if(field.type==="number") {
        const value=input.value.trim();
        if(value && (!Number.isFinite(Number(value)) || Number(value)<0 || Number(value)>1e9)) {
          toast("Please use an amount between 0 and 1,000,000,000."); return;
        }
        record[field.key]=value?Math.round(Number(value)*100)/100:0;
      } else record[field.key]=String(input.value).trim().slice(0,2000);
    }
    const now=new Date().toISOString();
    if(editorId) {
      const index=next[editorType].findIndex(item=>item.id===editorId);
      if(index<0) return toast("This record no longer exists.");
      next[editorType][index]={...next[editorType][index],...record,updatedAt:now};
    } else {
      next[editorType].unshift({id:uniqueId(),...record,createdAt:now,updatedAt:now});
    }
    if(commit(next,editorId?"Changes saved.":"Record created.")) closeEditor();
  }
  function removeRecord(type,id) {
    if(!definitions[type]) return;
    const existing=db[type].find(v=>v.id===id);
    if(!existing) return;
    const name=recordTitle(type,existing)||"this record";
    if(!window.confirm('Delete "'+name+'"? This cannot be undone unless you have a backup.')) return;
    const next=cloneStore();
    next[type]=next[type].filter(v=>v.id!==id);
    if(type==="clients" && (next.quotes.some(v=>v.clientId===id)||next.bookings.some(v=>v.clientId===id)||next.projects.some(v=>v.clientId===id)||next.finance.some(v=>v.clientId===id))) {
      if(!window.confirm("This client has linked records. Delete the contact anyway? Their other records will remain, but no longer show a linked client.")) return;
    }
    if(type==="projects" && next.tasks.some(v=>v.projectId===id)) {
      if(!window.confirm("This project has linked tasks. Delete it anyway? The tasks will remain unlinked.")) return;
    }
    commit(next,"Record deleted.");
  }
  function convertLead(id) {
    const lead=db.enquiries.find(e=>e.id===id);
    if(!lead) return;
    const existing=db.clients.find(c=>lead.email && c.email.toLowerCase()===lead.email.toLowerCase());
    if(existing){toast("A client with this email already exists.");goto("clients");return;}
    const next=cloneStore();
    const now=new Date().toISOString();
    next.clients.unshift({id:uniqueId(),name:lead.name||"Unnamed",business:"",email:lead.email||"",phone:lead.phone||"",notes:"Created from enquiry: "+String(lead.service||"")+" — "+String(lead.message||"").slice(0,1600),createdAt:now,updatedAt:now});
    const index=next.enquiries.findIndex(x=>x.id===id);
    if(index>=0 && next.enquiries[index].status==="New") next.enquiries[index].status="Contacted";
    if(commit(next,"Enquiry added to clients.")) goto("clients");
  }
  function toggleTask(id) {
    const next=cloneStore();const task=next.tasks.find(t=>t.id===id);
    if(!task)return;task.status=task.status==="Done"?"To do":"Done";task.updatedAt=new Date().toISOString();
    commit(next,task.status==="Done"?"Task completed.":"Task reopened.");
  }
  function downloadBackup() {
    const backup={schemaVersion:VERSION,exportedAt:new Date().toISOString(),store:db};
    const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="swaymark-business-hub-"+localDate()+".json";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
    toast("Backup created. Keep the file in a safe place.");
  }
  async function restoreBackup(file) {
    if(!file) return;
    if(file.size>2*1024*1024) {toast("Please use a backup smaller than 2 MB.");return;}
    try {
      const raw=JSON.parse(await file.text());
      if(raw.schemaVersion!==VERSION || !raw.store) throw new Error("This is not a supported SWAYMARK backup.");
      const imported=cleanStore(raw.store);
      if(!window.confirm("Restore this backup? It will replace all current records stored in this browser."))return;
      if(commit(imported,"Backup restored."))goto("dashboard");
    } catch(error) {toast("Restore failed: "+String(error.message||"Invalid file").slice(0,150));}
  }
  function sampleStore() {
    const next=emptyStore(),now=new Date().toISOString();
    const client=uniqueId(),project=uniqueId();
    const stamp=(r)=>({...r,id:uniqueId(),createdAt:now,updatedAt:now});
    next.clients.push({...stamp({name:"Sample Client",business:"Example Studio",email:"sample@example.com",phone:"",notes:"Demonstration contact — not a real person."}),id:client});
    next.enquiries.push(stamp({name:"Demo Enquiry",email:"demo@example.com",phone:"",service:"New website",source:"Website",status:"New",followup:localDate(1),message:"Sample enquiry to illustrate how the workspace will look."}));
    next.quotes.push(stamp({title:"Sample website package",clientId:client,amount:6500,status:"Draft",validUntil:localDate(14),notes:"Illustrative scope: responsive website, essential SEO setup and handover."}));
    next.bookings.push(stamp({service:"Discovery call — demo",clientId:client,date:localDate(2),time:"10:00",status:"Planned",notes:"Sample booking; not on a real calendar."}));
    next.projects.push({...stamp({title:"Example website project",clientId:client,deadline:localDate(30),status:"Planning",budget:6500,notes:"Sample website design and launch."}),id:project});
    next.tasks.push(stamp({title:"Review example client brief",projectId:project,due:localDate(1),priority:"High",status:"To do",notes:"Use this task to test the Complete/Reopen feature."}));
    next.finance.push(stamp({reference:"DEMO-INV-001",type:"Invoice",clientId:client,amount:2000,status:"Due",due:localDate(14),notes:"Illustrative only; not a real invoice."}));
    next.settings.currency=db.settings.currency;
    return next;
  }
  function printQuote(id) {
    const q=db.quotes.find(v=>v.id===id);
    if(!q)return;
    const client=db.clients.find(c=>c.id===q.clientId);
    const business=client?(client.business||client.name):"Unassigned client";
    const contact=client?client.name:"";
    const body='<div><img width="52" height="52" src="/assets/logo-mark.webp" alt=""><h1>SWAYMARK</h1><p>Website development · SEO · Digital marketing</p></div>'+
      '<div class="print-card"><h2>Project quote</h2>'+
      '<div class="print-row"><strong>Prepared for</strong><span>'+escapeHTML(business)+'</span></div>'+
      (contact?'<div class="print-row"><strong>Contact</strong><span>'+escapeHTML(contact)+'</span></div>':"")+
      '<div class="print-row"><strong>Proposal</strong><span>'+escapeHTML(q.title)+'</span></div>'+
      '<div class="print-row"><strong>Stage</strong><span>'+escapeHTML(q.status)+'</span></div>'+
      '<div class="print-row"><strong>Valid until</strong><span>'+escapeHTML(displayDate(q.validUntil))+'</span></div>'+
      '<h3>Proposed scope</h3><p>'+escapeHTML(q.notes || "Scope to be agreed in writing.").replace(/\n/g,"<br>")+'</p>'+
      '<div class="print-amount">'+escapeHTML(displayMoney(q.amount))+'</div>'+
      '<p class="print-foot">Illustrative quote generated from a prototype. Final work, price, payment schedule, tax treatment, and terms are subject to a separate written agreement. This is not a tax invoice.</p></div>';
    const area=document.getElementById("printArea");area.innerHTML=body;
    area.setAttribute("aria-hidden","false");
    setTimeout(()=>window.print(),80);
  }
  function handleAction(event) {
    const target=event.target.closest("[data-action]");
    if(!target)return;
    const action=target.dataset.action, type=target.dataset.type, id=target.dataset.id;
    if(action==="new")openEditor(type||"enquiries");
    else if(action==="edit")openEditor(type,id);
    else if(action==="delete")removeRecord(type,id);
    else if(action==="convert")convertLead(id);
    else if(action==="toggle-task")toggleTask(id);
    else if(action==="goto")goto(target.dataset.view);
    else if(action==="print-quote")printQuote(id);
    else if(action==="export")downloadBackup();
    else if(action==="restore"){const input=document.getElementById("restoreFile");if(input)input.click();}
    else if(action==="clear-filters"){searchText="";currentFilter="all";render();}
    else if(action==="samples"){
      if(Object.keys(definitions).some(type=>db[type].length>0)&&!window.confirm("Replace all local records with sample data? Export a backup first if you want to keep them."))return;
      if(commit(sampleStore(),"Demo records loaded."))goto("dashboard");
    }
    else if(action==="reset"){
      if(!window.confirm("Delete every local record in this workspace? This cannot be undone without an exported backup."))return;
      const next=emptyStore();next.settings.currency=db.settings.currency;
      if(commit(next,"Local records cleared."))goto("dashboard");
    }
  }
  document.addEventListener("click",handleAction);
  document.querySelectorAll(".nav-link[data-view]").forEach(link=>link.addEventListener("click",()=>{
    searchText="";currentFilter="all";
    if(link.hash===location.hash)render();
  }));
  document.getElementById("topExport").addEventListener("click",downloadBackup);
  document.getElementById("sectionAdd").addEventListener("click",()=>openEditor(activeView));
  document.getElementById("navToggle").addEventListener("click",()=>{
    const sidebar=document.getElementById("sidePanel"),open=!sidebar.classList.contains("open");
    sidebar.classList.toggle("open",open);
    document.getElementById("sideScrim").classList.toggle("open",open);
    document.getElementById("navToggle").setAttribute("aria-expanded",open?"true":"false");
  });
  document.getElementById("closeNav").addEventListener("click",closeMobileNav);
  document.getElementById("sideScrim").addEventListener("click",closeMobileNav);
  document.getElementById("modalClose").addEventListener("click",closeEditor);
  document.getElementById("cancelEditor").addEventListener("click",closeEditor);
  form.addEventListener("submit",saveEditor);
  document.getElementById("searchInput").addEventListener("input",e=>{searchText=e.target.value.trim();renderList();});
  document.getElementById("statusFilter").addEventListener("change",e=>{currentFilter=e.target.value;renderList();});
  document.addEventListener("change",event=>{
    if(event.target.id==="currencyPref" && currencies.includes(event.target.value)){
      const next=cloneStore();next.settings.currency=event.target.value;commit(next,"Currency display updated.");
    }
    if(event.target.id==="restoreFile") {
      const file=event.target.files&&event.target.files[0];
      restoreBackup(file);event.target.value="";
    }
  });
  window.addEventListener("hashchange",()=>{
    searchText="";currentFilter="all";render();
  });
  window.addEventListener("afterprint",()=>{
    const area=document.getElementById("printArea");area.innerHTML="";area.setAttribute("aria-hidden","true");
  });
  document.getElementById("todayDisplay").textContent=new Intl.DateTimeFormat("en-ZA",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
  render();
  if("serviceWorker" in navigator && location.protocol==="https:") {
    window.addEventListener("load",()=>navigator.serviceWorker.register("/hub/sw.js",{scope:"/hub/"}).catch(()=>{}));
  }
})();
