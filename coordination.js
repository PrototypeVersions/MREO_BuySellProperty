(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  const $ = (id) => document.getElementById(id);
  const safeImage = (value) => /^(https?:\/\/|assets\/)/i.test(value || "") ? value : "";
  const money = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) && n > 0 ? new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0}).format(n) : "";
  };

  const context = {
    kind: params.get("type") === "portfolio" ? "portfolio" : "property",
    auction: params.get("auction") || "",
    address: params.get("address") || "",
    title: params.get("title") || "",
    price: params.get("price") || "",
    image: safeImage(params.get("image")),
    count: params.get("count") || ""
  };
  context.label = context.title || context.address || "No property selected";
  context.hasSelection = !!(context.title || context.address || context.auction);
  context.key = context.auction || context.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unselected";

  const services = {
    title: {
      eyebrow: "Transfer",
      title: "Title Transfer",
      intro: "Coordinate the title and settlement work needed to move ownership from seller to buyer while keeping the property record and required documents in one workflow.",
      steps: ["Select a title or settlement provider", "Collect and verify transaction documents", "Track title search and review", "Resolve title requirements or exceptions", "Prepare transfer and closing"],
      action: "Start title coordination",
      fields: `
        <label>Preferred title / settlement provider<select name="provider"><option>Match me with a participating provider</option><option>Provider A · demonstration</option><option>Provider B · demonstration</option></select></label>
        <label>Closing target<input name="target" type="date"></label>
        <label>Transfer notes<textarea name="notes" placeholder="Known title issues, entity ownership, closing requirements, or other notes"></textarea></label>`,
      providers: [["Provider A · demonstration","Title search, settlement, document coordination"],["Provider B · demonstration","Title review, escrow, closing coordination"]]
    },
    contractors: {
      eyebrow: "Improve",
      title: "Contractors",
      intro: "Turn the property into a structured work package, invite qualified contractors to quote the job, and keep scope, photos, timing, and bid comparison connected to the property record.",
      steps: ["Choose the work category", "Create a property work package", "Invite contractors to review the scope", "Compare quotes and timelines", "Select a provider and track the work"],
      action: "Create contractor request",
      fields: `
        <label>Work category<select name="category"><option>Construction / rehabilitation</option><option>Plumbing</option><option>Electrical</option><option>Roofing</option><option>Cleaning</option><option>Landscaping</option><option>Inspection</option><option>Photography / videography</option><option>Other</option></select></label>
        <label>Target budget<input name="budget" type="text" inputmode="numeric" placeholder="$25,000"></label>
        <label>Desired timing<select name="timing"><option>As soon as possible</option><option>Within 30 days</option><option>Within 60 days</option><option>Flexible</option></select></label>
        <label>Scope of work<textarea name="notes" placeholder="Describe the work, condition, access requirements, and desired outcome"></textarea></label>`,
      providers: [["Contractor A · demonstration","General construction and rehabilitation"],["Contractor B · demonstration","Repairs, turns, and property-ready work"]]
    },
    realtors: {
      eyebrow: "Represent",
      title: "Realtors",
      intro: "Request licensed local representation or transaction assistance without separating the property packet from the rest of the MREO workflow.",
      steps: ["Choose the representation need", "Share the property packet", "Match with participating local professionals", "Review proposed services", "Coordinate representation and transaction support"],
      action: "Request realtor coordination",
      fields: `
        <label>Service needed<select name="serviceNeed"><option>Seller representation / conventional listing</option><option>Buyer representation</option><option>Local showing assistance</option><option>Valuation / market assistance</option><option>Transaction support</option><option>Leasing assistance</option></select></label>
        <label>Market / area<input name="market" type="text" placeholder="City, state, or market area"></label>
        <label>Notes<textarea name="notes" placeholder="Describe the representation or local assistance you need"></textarea></label>`,
      providers: [["Realtor A · demonstration","Licensed local representation and transaction support"],["Realtor B · demonstration","Listings, showings, leasing, and market assistance"]]
    },
    rentals: {
      eyebrow: "Rent / Manage",
      title: "Property Rentals",
      intro: "Move a property from acquisition or renovation into rental readiness, tenant placement, and eventually ongoing management through the same property record.",
      steps: ["Choose a rental pathway", "Prepare the property for rent", "Coordinate photography and rent positioning", "Collect and review tenant applications", "Coordinate lease, move-in, and ongoing management"],
      action: "Start rental coordination",
      fields: `
        <label>Rental pathway<select name="rentalPath"><option>Prepare for rent</option><option>Find a tenant</option><option>Lease coordination</option><option>Ongoing property management</option></select></label>
        <label>Target monthly rent<input name="rent" type="text" inputmode="numeric" placeholder="$2,500"></label>
        <label>Availability target<input name="available" type="date"></label>
        <label>Rental notes<textarea name="notes" placeholder="Property readiness, tenant criteria, management needs, or other goals"></textarea></label>`,
      providers: [["Rental Provider A · demonstration","Rental readiness and tenant placement"],["Management Provider B · demonstration","Lease coordination, maintenance, and ongoing management"]]
    }
  };

  function query(extra = {}) {
    const out = new URLSearchParams();
    if (context.kind) out.set("type", context.kind);
    if (context.auction) out.set("auction", context.auction);
    if (context.address) out.set("address", context.address);
    if (context.title) out.set("title", context.title);
    if (context.price) out.set("price", context.price);
    if (context.image) out.set("image", context.image);
    if (context.count) out.set("count", context.count);
    Object.entries(extra).forEach(([key, value]) => value && out.set(key, value));
    return out.toString();
  }

  function status(service) {
    try { return JSON.parse(localStorage.getItem(`mreo:coordination:${context.key}:${service}`) || "null"); }
    catch { return null; }
  }

  function fillRecord(prefix) {
    const title = $(prefix + "-title");
    if (!title) return;
    title.textContent = context.label;
    const meta = $(prefix + "-meta");
    if (meta) {
      const parts = [];
      if (context.kind === "portfolio" && context.count) parts.push(context.count + " properties");
      const formatted = money(context.price);
      if (formatted) parts.push(formatted);
      meta.textContent = parts.length ? parts.join(" · ") : (context.hasSelection ? "MREO property record" : "Choose a property to attach this coordination workflow.");
    }
    const img = $(prefix + "-image");
    if (img) {
      if (context.image) { img.src = context.image; img.alt = "Property record image for " + context.label; }
      else img.hidden = true;
    }
    const badge = $(prefix + "-status");
    if (badge) badge.textContent = context.hasSelection ? "Property record connected" : "No property selected";
  }

  function initHub() {
    if (!$('coordination-grid')) return;
    fillRecord("coord-record");
    document.querySelectorAll("[data-service]").forEach((card) => {
      const service = card.dataset.service;
      card.href = "coordination-service.html?" + query({service});
      const saved = status(service);
      const badge = card.querySelector(".service-status");
      if (badge) badge.textContent = saved ? "Request started" : "Not started";
    });
    const choose = $('coord-choose-property');
    if (choose) choose.hidden = context.hasSelection;
  }

  function initService() {
    const serviceKey = params.get("service");
    const config = services[serviceKey];
    if (!config || !$('service-title')) return;

    fillRecord("service-record");
    $('service-eyebrow').textContent = config.eyebrow;
    $('service-title').textContent = config.title;
    $('service-intro').textContent = config.intro;
    document.title = config.title + " | MREO Coordination";
    $('service-back').href = "coordination.html?" + query();
    $('service-workflow').innerHTML = config.steps.map((step) => `<li>${step}</li>`).join("");
    $('service-form-fields').innerHTML = config.fields;
    $('service-submit').textContent = config.action;
    $('provider-preview').innerHTML = `<h3>Example participating providers</h3>` + config.providers.map(([name, desc]) => `<div class="provider-option"><strong>${name}</strong><span>${desc}</span></div>`).join("");

    const form = $('service-request-form');
    const saved = status(serviceKey);
    if (saved) {
      $('service-message').hidden = false;
      $('service-message').textContent = `Coordination request started ${new Date(saved.at).toLocaleString()}. This demonstration stores the request in this browser.`;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!context.hasSelection) {
        $('service-message').hidden = false;
        $('service-message').textContent = "Choose a property before starting this coordination request.";
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem(`mreo:coordination:${context.key}:${serviceKey}`, JSON.stringify({at:Date.now(), data}));
      $('service-message').hidden = false;
      $('service-message').textContent = "Coordination request created for this property. In a connected version, MREO would route the property packet and request to participating providers and track the workflow here.";
      $('service-message').scrollIntoView({behavior:"smooth", block:"nearest"});
    });
  }

  initHub();
  initService();
})();
