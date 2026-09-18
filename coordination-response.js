(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const prettyDate = (value) => value ? new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(value)) : "Not sent yet";
  const money = (value) => { const n = Number(value || 0); return Number.isFinite(n) && n > 0 ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n) : ""; };
  const humanize = (key) => String(key || "").replace(/([A-Z])/g," $1").replace(/[_-]+/g," ").replace(/^./,(c)=>c.toUpperCase());

  const hasIncomingContext = ["auction","address","title","price","image","count"].some((key) => params.get(key));
  const context = {
    kind: params.get("type") === "portfolio" ? "portfolio" : "property",
    auction: params.get("auction") || (hasIncomingContext ? "" : "demo-property"),
    address: params.get("address") || (hasIncomingContext ? "" : "4218 Maple Ridge Drive, Dallas, TX 75229"),
    title: params.get("title") || "",
    price: params.get("price") || (hasIncomingContext ? "" : "385000"),
    image: params.get("image") || "",
    count: params.get("count") || "",
    stage: params.get("stage") || "complete"
  };
  context.label = context.address || context.title || "MREO property record";
  context.key = context.auction || context.label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "unselected";

  const serviceKey = params.get("service") || "title";
  let role = params.get("role") || localStorage.getItem("mreo:coordination:role") || "buyer";
  if (!["buyer","seller","provider"].includes(role)) role = "buyer";
  const stateKey = `mreo:coordination:v3:${context.key}`;

  const configs = {
    title: {
      eyebrow:"01 · Transfer", shortTitle:"Title / Settlement", title:"Preliminary title & settlement requirements", provider:"Northstar Title & Settlement · demonstration", summary:"Preliminary title review, estimated settlement charges, closing requirements, and signing plan.", amount:2150,
      groups:[
        {title:"Estimated charges & closing plan",description:"The provider's preliminary economics and timing for the fictional settlement.",fields:[
          {key:"totalCharges",label:"Estimated title / escrow / settlement / recording charges",type:"text",default:"$2,150"},
          {key:"closingDate",label:"Target closing date",type:"text",default:(request)=>request?.data?.closingTarget || "2026-10-16"},
          {key:"signingPlan",label:"Signing plan",type:"textarea",default:(request)=>request?.data?.signingPreference || "Remote / electronic where permitted, with final instructions coordinated through the settlement provider."}
        ]},
        {title:"Preliminary title requirements",description:"Items the provider expects to resolve before final transfer.",fields:[
          {key:"titleFindings",label:"Preliminary title findings",type:"textarea",default:"No material title exceptions identified in this demonstration review. Standard verification of ownership, payoff status, taxes, and recording information remains part of final closing preparation."},
          {key:"requirements",label:"Buyer / transaction requirements",type:"textarea",default:"Confirm legal name and vesting; verify cash or lender funding instructions; provide government-issued identification at signing; acknowledge final settlement figures; complete required signatures."},
          {key:"closingInstructions",label:"Closing instructions",type:"textarea",default:"Final settlement figures and signing instructions will be issued after client approval of this preliminary response and completion of the remaining title review."}
        ]},
        {title:"Provider notes",fields:[{key:"providerNotes",label:"Provider notes",type:"textarea",default:"This is a fictional title / settlement response for the MREO prototype. Final legal, title, escrow, recording, and settlement requirements would be determined by the participating licensed provider."}]}
      ]
    },
    contractors: {
      eyebrow:"02 · Contractors", shortTitle:"Contractors", title:"Renovation scope & proposal", provider:"Cedar Build & Rehab · demonstration", summary:"Detailed renovation scope, line-item budget, schedule, assumptions, and exclusions.", amount:28400,
      groups:[
        {title:"Price & schedule",description:"The contractor's proposed commercial terms for the fictional project.",fields:[
          {key:"totalPrice",label:"Total project price",type:"text",default:"$28,400"},
          {key:"schedule",label:"Projected construction schedule",type:"text",default:"24 calendar days"},
          {key:"startWindow",label:"Proposed start window",type:"text",default:"Within 10 business days after approval and access confirmation"}
        ]},
        {title:"Scope of work",fields:[
          {key:"scope",label:"Detailed scope",type:"textarea",default:(request)=>request?.data?.scope || "Refresh flooring and interior paint, repair exterior trim, service HVAC, update two bathroom fixtures, complete final cleanup, and provide completion photography."},
          {key:"lineItems",label:"Line-item budget",type:"textarea",default:"Flooring — $7,800\nInterior paint — $6,400\nExterior trim repair — $2,700\nHVAC service — $3,500\nBathroom fixture updates — $4,000\nCleanup & completion photography — $4,000"},
          {key:"assumptions",label:"Assumptions",type:"textarea",default:"Property remains vacant during the work; normal weekday access is available; no concealed structural, mold, hazardous-material, or major systems conditions are discovered."},
          {key:"exclusions",label:"Exclusions",type:"textarea",default:"Permit fees or engineering not specifically required by this scope; concealed damage; owner-requested upgrades beyond the listed scope; utility charges."}
        ]},
        {title:"Contractor notes",fields:[{key:"providerNotes",label:"Contractor notes",type:"textarea",default:"Proposal is fictional and intended to demonstrate the MREO provider-response workflow. Any real project would require provider inspection, contracting, licensing, insurance, and local permitting as applicable."}]}
      ]
    },
    realtors: {
      eyebrow:"03 · Realtors", shortTitle:"Realtors", title:"Representation & market positioning package", provider:"MetroLine Realty Group · demonstration", summary:"Proposed representation services, market positioning, fees, marketing plan, and next actions.", amount:0,
      groups:[
        {title:"Market positioning & terms",fields:[
          {key:"marketPosition",label:"Recommended market positioning",type:"text",default:"Post-improvement rental positioning at $2,850–$3,050 per month"},
          {key:"representationFee",label:"Representation / leasing fee",type:"text",default:"One month's rent leasing fee — demonstration term"},
          {key:"term",label:"Proposed engagement term",type:"text",default:"90-day leasing representation"}
        ]},
        {title:"Representation plan",fields:[
          {key:"services",label:"Services included",type:"textarea",default:"Final rental pricing recommendation; professional photography coordination; listing preparation; marketing syndication; inquiry handling; showing coordination; application handoff; lease coordination support."},
          {key:"marketingPlan",label:"Marketing plan",type:"textarea",default:"Launch after improvement closeout with professional photography, complete property details, rental-market positioning, digital listing distribution, showing availability, and weekly activity reporting."},
          {key:"nextSteps",label:"Next actions after approval",type:"textarea",default:"Confirm final property readiness; schedule photography; approve listing copy and asking rent; activate marketing and showing workflow."}
        ]},
        {title:"Brokerage notes",fields:[{key:"providerNotes",label:"Brokerage notes",type:"textarea",default:"This fictional response demonstrates how a participating brokerage could return its proposed services and terms through MREO. Actual brokerage services and agreements would be provided by the applicable licensed professional."}]}
      ]
    },
    rentals: {
      eyebrow:"04 · Rent / Manage", shortTitle:"Rental / Property Management", title:"Rental positioning & management proposal", provider:"KeyHouse Property Management · demonstration", summary:"Recommended rent, tenant-placement terms, management fee, maintenance authority, and operating plan.", amount:0,
      groups:[
        {title:"Rental economics & management terms",fields:[
          {key:"recommendedRent",label:"Recommended asking rent",type:"text",default:(request)=>request?.data?.targetRent || "$2,950 per month"},
          {key:"managementFee",label:"Ongoing management fee",type:"text",default:"8% of collected monthly rent — demonstration term"},
          {key:"tenantPlacementFee",label:"Tenant-placement / leasing fee",type:"text",default:"One month's rent — demonstration term"},
          {key:"maintenanceAuthority",label:"Routine maintenance authority",type:"text",default:"Up to $500 per incident without additional owner approval — demonstration term"}
        ]},
        {title:"Leasing & operations plan",fields:[
          {key:"screening",label:"Tenant screening plan",type:"textarea",default:"Identity verification, documented income, rental history, credit and background screening where lawful, lease-compliance review, and owner-defined property-care expectations."},
          {key:"leasingTimeline",label:"Leasing timeline",type:"textarea",default:"Prepare listing immediately after property readiness confirmation; begin marketing within 2 business days; coordinate applications, screening, lease execution, and move-in through the property record."},
          {key:"managementServices",label:"Ongoing services",type:"textarea",default:"Electronic rent collection, lease administration, maintenance coordination, emergency service routing, owner reporting, renewal coordination, inspection scheduling, and move-out / turnover coordination."}
        ]},
        {title:"Management notes",fields:[{key:"providerNotes",label:"Property-management notes",type:"textarea",default:"This fictional proposal demonstrates the information a participating property manager could return through MREO. Actual leasing and management terms would depend on the provider, property, local law, and executed management agreement."}]}
      ]
    }
  };

  const config = configs[serviceKey] || configs.title;
  function loadState(){ try{ const parsed=JSON.parse(localStorage.getItem(stateKey)||"null"); if(parsed&&parsed.version===3&&parsed.requests)return parsed; }catch{} return null; }
  let state=loadState(); let request=state?.requests?.[serviceKey]||null;
  function saveState(){ if(state)localStorage.setItem(stateKey,JSON.stringify(state)); }
  function query(extra={}){ const out=new URLSearchParams(); if(context.kind)out.set("type",context.kind); if(context.auction)out.set("auction",context.auction); if(context.address)out.set("address",context.address); if(context.title)out.set("title",context.title); if(context.price)out.set("price",context.price); if(context.image)out.set("image",context.image); if(context.count)out.set("count",context.count); if(context.stage)out.set("stage",context.stage); out.set("service",serviceKey); Object.entries(extra).forEach(([k,v])=>v!==undefined&&v!==null&&v!==""&&out.set(k,String(v))); return out.toString(); }
  const workflowHref=(nextRole=role)=>`coordination-service.html?${query({role:nextRole})}`;
  const responseHref=(nextRole=role)=>`coordination-response.html?${query({role:nextRole})}`;
  function addActivity(text,actor,important=false){ if(!state)return; state.activity=Array.isArray(state.activity)?state.activity:[]; state.activity.unshift({id:`response-${Date.now()}-${Math.random().toString(16).slice(2)}`,at:Date.now(),actor,important,text}); state.activity=state.activity.slice(0,60); }
  function fieldDefault(field){ return typeof field.default==="function"?field.default(request):field.default; }
  function currentFields(){ const existing=request?.proposal?.fields||{}; const values={}; config.groups.forEach(g=>g.fields.forEach(f=>values[f.key]=existing[f.key]??fieldDefault(f)??"")); return values; }
  function proposalBody(fields){ const lines=[config.summary]; config.groups.forEach(g=>{ lines.push("",g.title.toUpperCase()); g.fields.forEach(f=>lines.push(`${f.label}: ${fields[f.key]||""}`)); }); return lines.join("\n"); }
  function upsertResponseDocument(){ if(!state||!request?.proposal)return; state.documents=Array.isArray(state.documents)?state.documents:[]; const id=`${serviceKey}-proposal-${request.id}`; const existing=state.documents.find(d=>d.id===id); const body=`MREO DEMONSTRATION — ${config.title.toUpperCase()}\n\nProperty: ${context.label}\nProvider: ${request.provider||config.provider}\nClient: ${request.ownerRole==="seller"?"Demo Seller":"Demo Buyer"}\nResponse version: ${request.proposal.revision||1}\n\n${proposalBody(request.proposal.fields||{})}\n\nStatus: ${request.status}`; const record={id,name:`${config.title}.txt`,category:config.eyebrow.replace(/^\d+\s·\s/,""),audience:["buyer","seller","provider"],body,service:serviceKey,createdAt:request.proposal.sentAt||Date.now()}; if(existing)Object.assign(existing,record); else state.documents.push(record); }
  function requestSummaryHtml(){ if(!request)return '<div class="document-empty">No request has been submitted yet.</div>'; const rows=[["Submitted by",request.ownerRole==="seller"?"Demo Seller":"Demo Buyer"],["Submitted",prettyDate(request.createdAt)]]; Object.entries(request.data||{}).forEach(([k,v])=>{if(v!=="")rows.push([humanize(k),v]);}); rows.push(["Supporting files",request.attachments?.length?`${request.attachments.length} attached`:"None"]); return rows.map(([l,v])=>`<div class="request-summary-row"><span>${esc(l)}</span><strong>${esc(v)}</strong></div>`).join(""); }
  function renderContext(){ document.title=`${role==="provider"?"Prepare":"Review"} ${config.shortTitle} Response | MREO`; $("response-service-label").textContent=config.eyebrow; $("response-property").textContent=context.label; const meta=[]; if(money(context.price))meta.push(money(context.price)); meta.push(config.shortTitle); $("response-property-meta").textContent=meta.join(" · "); $("response-provider").textContent=request?.provider||config.provider; $("response-client").textContent=request?.ownerRole==="seller"?"Demo Seller":"Demo Buyer"; $("response-version").textContent=request?.proposal?`Revision ${request.proposal.revision||1}`:"Not sent yet"; $("response-date").textContent=request?.proposal?prettyDate(request.proposal.sentAt||request.proposal.at):"Not sent yet"; $("response-status").textContent=request?.status==="proposal"?"Response ready for review":request?.status==="matched"?"Provider reviewing":request?.status==="approved"?"Response approved":request?.status==="in-progress"?"Service in progress":request?.status==="complete"?"Service complete":request?.status==="needs-info"?"Information requested":"Request submitted"; $("response-back").href=workflowHref(); $("provider-cancel-response").href=workflowHref("provider"); $("client-back-workflow").href=workflowHref(role); $("response-empty-back").href=workflowHref(role); document.querySelectorAll("[data-response-role]").forEach(button=>{button.setAttribute("aria-pressed",button.dataset.responseRole===role?"true":"false");button.addEventListener("click",()=>{const next=button.dataset.responseRole;localStorage.setItem("mreo:coordination:role",next);location.href=responseHref(next);});}); }
  function showNotice(title,copy){ const box=$("response-notice"); box.hidden=false; box.innerHTML=`<strong>${esc(title)}</strong><p>${esc(copy)}</p>`; }
  function renderProviderFields(){ const values=currentFields(); $("provider-response-fields").innerHTML=config.groups.map(g=>`<section class="response-form-section"><h3>${esc(g.title)}</h3>${g.description?`<p>${esc(g.description)}</p>`:""}${g.fields.map(f=>`<label>${esc(f.label)}${f.type==="textarea"?`<textarea name="${esc(f.key)}" required>${esc(values[f.key])}</textarea>`:`<input name="${esc(f.key)}" type="text" value="${esc(values[f.key])}" required>`}</label>`).join("")}</section>`).join(""); }
  function renderProvider(){ $("response-eyebrow").textContent="Service Partner · Provider response"; $("response-title").textContent=request?.proposal&&request?.revisionRequest?"Revise provider response":request?.proposal?"Provider response":"Prepare provider response"; $("response-intro").textContent="Prepare the detailed response the client will review. The exact response you send here is the one the buyer or seller sees."; if(!state||!request)return renderEmpty("No client request exists for this pathway yet.","Return to the workflow, switch to Buyer or Seller, and submit the service request first."); if(request.status==="submitted")return renderEmpty("The request has not been accepted yet.","Return to the Service Partner workflow and accept the request before preparing a response."); if(request.status==="needs-info")return renderEmpty("The provider is waiting for client information.","Return to the workflow after the buyer or seller supplies the requested information."); if(["approved","in-progress","complete"].includes(request.status)){showNotice("The client has already acted on this response.",request.status==="approved"?"The response is approved. Return to the workflow to begin the service.":"The response remains available as part of the shared property record.");return renderClient(true);} $("provider-response-editor").hidden=false; $("client-response-review").hidden=true; $("response-empty").hidden=true; $("response-client-request").innerHTML=requestSummaryHtml(); renderProviderFields(); if(request.revisionRequest){ const banner=document.createElement("div"); banner.className="response-revision-banner"; banner.innerHTML=`<strong>Client requested changes</strong><p>${esc(request.revisionRequest.note)}</p>`; $("provider-response-form").prepend(banner); $("provider-editor-title").textContent="Revise and resend the provider response"; $("provider-send-response").textContent="Send revised response to client"; }else if(request.proposal){$("provider-editor-title").textContent="Review or update the sent response";$("provider-send-response").textContent="Update & resend response";}else{$("provider-editor-title").textContent=`Prepare ${config.shortTitle.toLowerCase()} response`;$("provider-send-response").textContent="Send response to client";} }
  function renderDetailGroups(fields){ return config.groups.map(g=>`<section class="response-detail-group"><h3>${esc(g.title)}</h3>${g.fields.map(f=>`<div class="response-detail-row"><span>${esc(f.label)}</span><strong>${esc(fields[f.key]||"")}</strong></div>`).join("")}</section>`).join(""); }
  function renderClient(readOnlyProvider=false){ $("provider-response-editor").hidden=true; $("client-response-review").hidden=false; $("response-empty").hidden=true; if(!request?.proposal)return renderEmpty("No provider response is available yet.","Return to the workflow. The participating company needs to prepare and send its response first."); const fields=currentFields(); $("response-eyebrow").textContent=readOnlyProvider?"Service Partner · Sent response":"Client review"; $("response-title").textContent=readOnlyProvider?"Sent provider response":"Review provider response"; $("response-intro").textContent=readOnlyProvider?"This is the response currently attached to the shared property record.":"Review the full provider response before approving it or asking the participating company to revise it."; $("client-response-heading").textContent=config.title; $("client-response-summary").textContent=request.proposal.summary||config.summary; $("client-response-details").innerHTML=renderDetailGroups(fields); $("client-side-request").innerHTML=requestSummaryHtml(); $("client-side-title").textContent=request.ownerRole==="seller"?"Seller request":"Buyer request"; const actions=$("client-response-actions"); actions.innerHTML=""; const isOwner=role===request.ownerRole; if(!readOnlyProvider&&request.status==="proposal"&&isOwner){actions.innerHTML='<button type="button" class="primary-button button-blue" id="approve-response">Approve response</button><button type="button" class="secondary-button" id="request-response-change">Request changes</button><a class="secondary-button" id="review-back-workflow" href="#">Back to workflow</a>'; $("review-back-workflow").href=workflowHref(role); $("approve-response").addEventListener("click",approveResponse); $("request-response-change").addEventListener("click",()=>{$("revision-request-form").hidden=false;$("revision-request-note").focus();}); }else{ const note=document.createElement("div"); note.className="response-readonly-note"; note.textContent=readOnlyProvider?"This is the response currently visible to the client.":request.status==="proposal"&&!isOwner?`This response is awaiting action from ${request.ownerRole==="seller"?"the seller":"the buyer"} who submitted the request.`:`Response status: ${request.status}.`; actions.appendChild(note); } }
  function renderEmpty(title,copy){ $("provider-response-editor").hidden=true; $("client-response-review").hidden=true; $("response-empty").hidden=false; $("response-empty").querySelector("h2").textContent=title; $("response-empty-copy").textContent=copy; }
  function sendProviderResponse(event){ event.preventDefault(); if(!state||!request)return; const form=new FormData(event.currentTarget); const fields={}; config.groups.forEach(g=>g.fields.forEach(f=>fields[f.key]=String(form.get(f.key)||"").trim())); const previousRevision=request.proposal?.revision||0; const now=Date.now(); request.provider=config.provider; request.proposal={responseVersion:2,revision:previousRevision+1,title:config.title,provider:config.provider,summary:config.summary,amount:config.amount,body:proposalBody(fields),fields,sentAt:now,at:now}; request.status="proposal"; request.updatedAt=now; request.lastTransitionAt=now; request.revisionRequest=null; addActivity(`${config.provider} ${previousRevision?"sent a revised":"sent a"} ${config.shortTitle.toLowerCase()} response to the client.`,`Service Partner`,true); upsertResponseDocument(); saveState(); location.href=responseHref("provider"); }
  function approveResponse(){ if(!state||!request||request.status!=="proposal")return; const now=Date.now(); request.status="approved"; request.updatedAt=now; request.lastTransitionAt=now; request.revisionRequest=null; addActivity(`${request.ownerRole==="seller"?"Demo Seller":"Demo Buyer"} reviewed and approved the ${config.shortTitle.toLowerCase()} response.`,request.ownerRole==="seller"?"Seller":"Buyer",true); upsertResponseDocument(); saveState(); location.href=workflowHref(request.ownerRole); }
  function requestChanges(event){ event.preventDefault(); if(!state||!request||request.status!=="proposal")return; const note=$("revision-request-note").value.trim(); if(!note)return; const now=Date.now(); request.status="matched"; request.updatedAt=now; request.lastTransitionAt=now; request.revisionRequest={note,at:now,by:request.ownerRole}; addActivity(`${request.ownerRole==="seller"?"Demo Seller":"Demo Buyer"} requested changes to the ${config.shortTitle.toLowerCase()} response: ${note}`,request.ownerRole==="seller"?"Seller":"Buyer",true); saveState(); location.href=workflowHref(request.ownerRole); }

  renderContext(); if(role==="provider")renderProvider(); else renderClient(false);
  $("provider-response-form")?.addEventListener("submit",sendProviderResponse);
  $("revision-request-form")?.addEventListener("submit",requestChanges);
  $("cancel-revision-request")?.addEventListener("click",()=>{$("revision-request-form").hidden=true;$("revision-request-note").value="";});
})();
