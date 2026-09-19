(() => {
  "use strict";
  const params=new URLSearchParams(location.search);
  const id=params.get("job")||"";
  const jobs=globalThis.MREO_PROVIDER_DEMO_JOBS||[];
  const job=jobs.find(item=>item.id===id);
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const storeKey="mreo:coordination:provider-demo:v1";
  const labels={title:"01 · TITLE / SETTLEMENT",contractors:"02 · CONTRACTORS",realtors:"03 · REALTORS",rentals:"04 · RENT / MANAGE"};
  function read(){try{return JSON.parse(localStorage.getItem(storeKey)||"{}");}catch{return {};}}
  function write(value){localStorage.setItem(storeKey,JSON.stringify(value));}
  function current(){
    if(!job)return null;
    const saved=read()[job.id];
    return saved?{...job,actionNeeded:saved.actionNeeded,status:saved.status||job.status,summary:saved.summary||job.summary}:job;
  }
  function setAttention(data){
    const card=$("provider-job-attention");
    card.classList.toggle("is-on",!!data.actionNeeded);
    card.classList.toggle("is-off",!data.actionNeeded);
    card.querySelector(".attention-state").textContent=data.actionNeeded?"Action needed":"Waiting";
    card.querySelector(".attention-title").textContent=data.status;
    card.querySelector(".attention-copy").textContent=data.summary;
  }
  function render(){
    const data=current();
    if(!data){
      document.querySelector("main").innerHTML='<a class="back-link" href="coordination.html?role=provider">← Provider work queue</a><section class="workspace-panel"><p class="section-label">Provider work item</p><h1>Request not found</h1><p>Choose a fictional provider job from the Service Partner work queue.</p></section>';
      return;
    }
    document.title=`${data.property} | Provider Work Item | MREO`;
    $("provider-job-service").textContent=labels[data.service]||"Service Partner";
    $("provider-job-property").textContent=data.property;
    $("provider-job-summary").textContent=data.summary;
    $("provider-job-company").textContent=data.provider;
    globalThis.MREO_PROVIDER_BRANDING?.apply($("provider-job-logo"),data.provider);
    $("provider-job-client").textContent=data.client;
    $("provider-job-status").textContent=data.status;
    $("provider-job-fields").innerHTML=(data.details||[]).map(([label,value])=>`<div class="provider-job-field"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
    $("provider-job-task-title").textContent=data.actionNeeded?"Provider action":"Waiting";
    $("provider-job-task").textContent=data.actionNeeded?data.task:data.status+". "+data.task;
    setAttention(data);
    const actions=$("provider-job-actions");
    actions.innerHTML="";
    if(data.actionNeeded&&data.button){
      const button=document.createElement("button");
      button.type="button";
      button.className="primary-button button-blue";
      button.textContent=data.button;
      button.addEventListener("click",()=>{
        const store=read();
        store[data.id]={actionNeeded:false,status:data.after||"Waiting for client",summary:data.after||"The provider completed its current step and is waiting for the next party."};
        write(store);
        render();
      });
      actions.appendChild(button);
    }
    const back=document.createElement("a");
    back.className="secondary-button";
    back.href="coordination.html?role=provider#provider-queue-title";
    back.textContent="Back to work queue";
    actions.appendChild(back);
  }
  render();
})();