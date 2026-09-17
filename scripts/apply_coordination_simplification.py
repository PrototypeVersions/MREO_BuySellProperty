from pathlib import Path
import re


def read(path):
    return Path(path).read_text()


def write(path, text):
    Path(path).write_text(text)


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing replacement target: {label}")
    return text.replace(old, new, 1)


# coordination.js
path = "coordination.js"
s = read(path)

s = replace_once(
    s,
    '    count: params.get("count") || (hasIncomingContext ? "" : DEMO.count)\n  };',
    '    count: params.get("count") || (hasIncomingContext ? "" : DEMO.count),\n    stage: params.get("stage") || "complete"\n  };',
    "coordination context stage",
)

s = replace_once(
    s,
    '    if (context.count) out.set("count", context.count);\n    Object.entries(extra)',
    '    if (context.count) out.set("count", context.count);\n    if (context.stage) out.set("stage", context.stage);\n    Object.entries(extra)',
    "query stage",
)

s = s.replace('mreo:coordination:v2:', 'mreo:coordination:v3:')
s = s.replace('parsed.version === 2', 'parsed.version === 3')

pattern = re.compile(r'    title: \{\n.*?\n    \},\n    contractors:', re.S)
replacement = '''    title: {
      eyebrow: "01 · Transfer",
      title: "Title Transfer",
      shortTitle: "Title / Settlement",
      provider: "Northstar Title & Settlement · demonstration",
      specialty: "Title / settlement",
      clientIntro: "Begin the closing process using the transaction information already attached to the property record. Confirm the buyer details a title / settlement company would ordinarily need, then review requirements, approve the provider response, and confirm signing before transfer is completed.",
      steps: ["Confirm closing profile, legal name, vesting, funding, and target date", "Provider accepts the file and reviews the connected transaction record", "Preliminary title / settlement requirements are returned", "Client approves the provider response and completes required closing steps", "Transfer and final closing record are completed"],
      action: "Start title / settlement request",
      fields: `
        <div class="service-form-section"><h3>Buyer closing profile</h3>
          <label>Buyer legal name / entity<input name="legalName" type="text" value="Demo Buyer" required></label>
          <label>Preferred title / settlement provider<select name="providerPreference"><option value="Match me with a participating provider">Match me with a participating provider</option><option value="Northstar Title & Settlement">Northstar Title & Settlement · demonstration</option></select></label>
          <label>Target closing date<input name="closingTarget" type="date" value="2026-10-16" required></label>
          <label>Ownership / vesting<input name="vesting" type="text" value="Individual ownership" required></label>
          <label>Funding method<select name="funding"><option>Cash purchase</option><option>Financing</option><option>Other / to be confirmed</option></select></label>
          <label>Signing preference<select name="signingPreference"><option>Remote / electronic where permitted</option><option>In person</option><option>Coordinate with settlement provider</option></select></label>
        </div>
        <div class="service-form-section"><h3>Buyer notes</h3>
          <label>Closing or title information<textarea name="notes" placeholder="Special closing instructions, entity information, known title questions, or other details">Please coordinate the standard post-auction title and settlement process using the transaction information already attached to this MREO property record.</textarea></label>
        </div>`,
      sellerFields: `
        <div class="service-form-section"><h3>Seller closing profile</h3>
          <label>Seller legal name / entity<input name="sellerLegalName" type="text" value="Demo Seller" required></label>
          <label>Preferred title / settlement provider<select name="providerPreference"><option value="Match me with a participating provider">Match me with a participating provider</option><option value="Northstar Title & Settlement">Northstar Title & Settlement · demonstration</option></select></label>
          <label>Target closing date<input name="closingTarget" type="date" value="2026-10-16" required></label>
          <label>Payoff / lien status<select name="payoffStatus"><option>No known payoff or lien issue</option><option>Mortgage payoff required</option><option>Other lien / payoff information to provide</option></select></label>
          <label>Signing preference<select name="signingPreference"><option>Remote / electronic where permitted</option><option>In person</option><option>Coordinate with settlement provider</option></select></label>
        </div>
        <div class="service-form-section"><h3>Seller notes</h3>
          <label>Known title, payoff, entity, or closing information<textarea name="notes">No known title exceptions. Please coordinate seller-side requirements through the shared MREO transaction record.</textarea></label>
        </div>`,
      proposalTitle: "Preliminary title & settlement requirements",
      proposalAmount: 2150,
      proposalBody: "Demonstration preliminary title / settlement response: estimated title, escrow, settlement, and recording charges of $2,150. The initial review is ready for client approval before final closing preparation.",
      completionTitle: "Recorded transfer & final closing record"
    },
    contractors:'''
s, n = pattern.subn(replacement, s, count=1)
if n != 1:
    raise SystemExit("title service block not replaced")

base_pattern = re.compile(r'  function baseDocuments\(\) \{.*?\n  \}\n\n  function defaultState\(\)', re.S)
base_replacement = '''  function baseDocuments() {
    const price = money(context.price) || "$385,000";
    const stage = context.stage === "won" ? "Winning bid selected — closing required" : "Acquisition complete";
    return [
      documentRecord("property-packet", "Connected property information", "Property record", ["buyer","seller","provider"], `MREO DEMONSTRATION — CONNECTED PROPERTY INFORMATION\\n\\nProperty: ${context.label}\\nReference value: ${price}\\nRecord ID: ${context.key}\\n\\nThis information remains inside MREO and is automatically available to participating workflows. The user does not need to download and re-upload it.`),
      documentRecord("transaction-record", "Connected transaction record", "Transaction", ["buyer","seller","provider"], `MREO DEMONSTRATION — TRANSACTION RECORD\\n\\nProperty: ${context.label}\\nPrice / winning amount: ${price}\\nBuyer: Demo Buyer\\nSeller: Demo Seller\\nAuction: ${context.auction || "demonstration auction"}\\nStatus: ${stage}\\n\\nThis record travels with the property into title and other coordination workflows.`),
      documentRecord("closing-checklist", "Connected closing requirements", "Closing", ["buyer","seller","provider"], `MREO DEMONSTRATION — CLOSING REQUIREMENTS\\n\\nProperty: ${context.label}\\n\\n• Confirm buyer and seller information\\n• Open title / settlement request\\n• Resolve provider requirements\\n• Complete signing / closing steps\\n• Preserve the final closing record in MREO`)
    ];
  }

  function defaultState()'''
s, n = base_pattern.subn(base_replacement, s, count=1)
if n != 1:
    raise SystemExit("baseDocuments block not replaced")

default_pattern = re.compile(r'  function defaultState\(\) \{.*?\n  \}\n\n  function loadState\(\)', re.S)
default_replacement = '''  function defaultState() {
    const now = Date.now();
    const pendingClosing = context.stage === "won";
    return {
      version: 3,
      createdAt: now,
      acquisition: {
        status: pendingClosing ? "pending-closing" : "complete",
        buyer: "Demo Buyer",
        seller: "Demo Seller",
        price: Number(context.price || 385000),
        completedAt: pendingClosing ? null : now - 86400000,
        auctionId: context.auction || "demo-property"
      },
      requests: {title:null, contractors:null, realtors:null, rentals:null},
      documents: baseDocuments(),
      activity: pendingClosing ? [
        {id:"acq-2", at:now - 300000, actor:"Auction", important:true, text:`Demo Buyer recorded the winning result at ${money(context.price) || "$385,000"}. Seller acceptance and closing are still required.`},
        {id:"acq-1", at:now - 360000, actor:"MREO", important:false, text:"The winning transaction entered the property workspace so title / settlement can begin."}
      ] : [
        {id:"acq-3", at:now - 86400000, actor:"MREO", important:true, text:"Acquisition completed and the property entered the coordination workspace."},
        {id:"acq-2", at:now - 90000000, actor:"Auction", important:false, text:`Demo Buyer recorded the winning result at ${money(context.price) || "$385,000"}.`},
        {id:"acq-1", at:now - 93600000, actor:"Seller", important:false, text:"Demo Seller made the connected property record available to the winning buyer."}
      ]
    };
  }

  function loadState()'''
s, n = default_pattern.subn(default_replacement, s, count=1)
if n != 1:
    raise SystemExit("defaultState block not replaced")

role_pattern = re.compile(r'  function roleCopy\(\) \{.*?\n  \}\n\n  const roleDescriptions', re.S)
role_replacement = '''  function roleCopy() {
    const pending = state.acquisition.status !== "complete";
    if (role === "seller") return {
      eyebrow:"Seller workspace",
      title: pending ? "The auction is over. Closing is the next shared workflow." : "Closing, transfer, and seller handoff in one place.",
      copy: pending ? "Follow seller acceptance, title requirements, payoff or signing requests, and closing without moving the transaction packet between systems." : "Follow the final transfer record and any remaining provider activity from the seller side.",
      acquisitionEyebrow: pending ? "Winning transaction" : "Sale & closing handoff",
      acquisitionTitle: pending ? "The winning buyer is selected. Closing still needs to be completed." : "The completed transaction remains attached to this property record.",
      acquisitionCopy: pending ? "Start or follow Title / Settlement below. MREO automatically carries the auction and property information into that workflow; only supply information the provider actually needs from you." : "The final transaction information stays connected to the property record and can feed later coordination workflows."
    };
    return {
      eyebrow:"Buyer workspace",
      title: pending ? "Your winning bid is selected. Complete the acquisition next." : "Your property record is ready for what comes next.",
      copy: pending ? "Begin title / settlement, respond to provider requirements, approve the closing response, and confirm signing. Existing auction and property information is passed automatically." : "Start any coordination pathway, review provider responses, approve work, and keep the resulting records attached to the property.",
      acquisitionEyebrow: pending ? "Next step · Complete the acquisition" : "Acquisition complete",
      acquisitionTitle: pending ? "Seller acceptance and closing are still required." : `${context.title || context.address || "This property"} is now in your MREO workspace.`,
      acquisitionCopy: pending ? "Use the Title / Settlement workflow to confirm your closing profile and move the transaction toward transfer. You do not need to download a packet and upload it again—the connected property record travels with the request." : "The acquisition information stays inside MREO and can automatically feed Transfer, Improve, Represent, and Rent / Manage."
    };
  }

  const roleDescriptions'''
s, n = role_pattern.subn(role_replacement, s, count=1)
if n != 1:
    raise SystemExit("roleCopy block not replaced")

doc_pattern = re.compile(r'  function renderDocumentLibrary\(container, audience, serviceFilter = ""\) \{.*?\n  \}\n\n  function downloadDocument', re.S)
doc_replacement = '''  function renderDocumentLibrary(container, audience, serviceFilter = "") {
    if (!container) return;
    const docs = state.documents.filter((doc) => doc.audience.includes(audience) && (!serviceFilter || doc.service === serviceFilter || doc.id === "property-packet" || doc.id === "transaction-record"));
    if (!docs.length) { container.innerHTML = '<div class="document-empty">No workflow records are available yet.</div>'; return; }
    container.innerHTML = docs.slice().reverse().map((doc) => {
      const downloadable = /-completion-/.test(doc.id);
      return `\n      <div class="document-item">\n        <div class="document-main"><strong>${esc(doc.name)}</strong><span>${esc(doc.category)} · ${shortDate(doc.createdAt)}</span></div>\n        ${downloadable ? `<button type="button" class="document-download" data-document-id="${esc(doc.id)}">Download final record</button>` : '<span class="document-state">Connected</span>'}\n      </div>`;
    }).join("");
    container.querySelectorAll("[data-document-id]").forEach((button) => button.addEventListener("click", () => downloadDocument(button.dataset.documentId)));
  }

  function downloadDocument'''
s, n = doc_pattern.subn(doc_replacement, s, count=1)
if n != 1:
    raise SystemExit("document library block not replaced")

s = replace_once(
    s,
    '      $("download-acquisition-package").textContent = copy.packageLabel;\n',
    '',
    "remove package label",
)

old_details = '''      const details = role === "seller" ? [
        ["Seller", state.acquisition.seller], ["Winning buyer", state.acquisition.buyer], ["Sale amount", money(state.acquisition.price)], ["Auction handoff", "Complete"], ["Transfer status", state.requests.title ? statusLabels[state.requests.title.status] : "Not started"]
      ] : [
        ["Owner", state.acquisition.buyer], ["Purchase price", money(state.acquisition.price)], ["Acquisition status", "Complete"], ["Acquired", shortDate(state.acquisition.completedAt)], ["Property record", context.key]
      ];'''
new_details = '''      const pending = state.acquisition.status !== "complete";
      const details = role === "seller" ? [
        ["Seller", state.acquisition.seller], ["Winning buyer", state.acquisition.buyer], ["Winning amount", money(state.acquisition.price)], ["Transaction status", pending ? "Closing required" : "Complete"], ["Transfer status", state.requests.title ? statusLabels[state.requests.title.status] : "Not started"]
      ] : [
        ["Buyer", state.acquisition.buyer], ["Winning / purchase amount", money(state.acquisition.price)], ["Acquisition status", pending ? "Winning bid selected · closing required" : "Complete"], [pending ? "Next required workflow" : "Acquired", pending ? "Title / Settlement" : shortDate(state.acquisition.completedAt)], ["Property record", context.key]
      ];
      const primaryAction = $("acquisition-primary-action");
      if (primaryAction) {
        primaryAction.href = `coordination-service.html?${query({service:"title", role})}`;
        primaryAction.textContent = pending ? (role === "seller" ? "Open seller closing workflow →" : "Start closing / title transfer →") : "Open title / transfer workflow →";
      }'''
s = replace_once(s, old_details, new_details, "acquisition details")

old_empty = '''    if (!cards.length) {
      container.innerHTML = '<div class="action-card"><strong>No client actions are waiting.</strong><p>Start any pathway above. Once a provider sends a proposal or requests information, it will appear here.</p></div>';
      return;
    }'''
new_empty = '''    if (!cards.length) {
      if (state.acquisition.status !== "complete" && !state.requests.title) {
        container.innerHTML = `<div class="action-card"><strong>Next step: Start Title / Settlement.</strong><p>The winning bid is selected, but closing is still required. Confirm the closing profile and send the connected transaction record to a participating provider.</p><a href="coordination-service.html?${query({service:"title", role})}">Start closing process →</a></div>`;
      } else {
        container.innerHTML = '<div class="action-card"><strong>No client actions are waiting.</strong><p>When a provider sends a response or requests information, it will appear here.</p></div>';
      }
      return;
    }'''
s = replace_once(s, old_empty, new_empty, "action center empty state")

s = replace_once(
    s,
    '      $("service-form-fields").innerHTML = config.fields;',
    '      $("service-form-fields").innerHTML = currentServiceKey === "title" && role === "seller" ? (config.sellerFields || config.fields) : config.fields;',
    "role-specific title fields",
)

s = replace_once(
    s,
    '    const config = services[serviceKey];\n    const messages = {',
    '    if (serviceKey === "title" && request.status === "in-progress" && !request.clientClosingConfirmed) { toast("Switch to the Buyer view and confirm the closing / signing step before completing the title workflow."); return false; }\n    const config = services[serviceKey];\n    const messages = {',
    "advance title confirmation guard",
)

s = replace_once(
    s,
    '      } else if (request.status === "in-progress" && elapsed > 25000) {\n        transition(serviceKey, "complete", "Service Partner", `${services[serviceKey].provider} completed the demonstration service.`); changed = true;',
    '      } else if (request.status === "in-progress" && elapsed > 25000 && (serviceKey !== "title" || request.clientClosingConfirmed)) {\n        transition(serviceKey, "complete", "Service Partner", `${services[serviceKey].provider} completed the demonstration service.`); changed = true;',
    "auto title completion guard",
)

s = replace_once(
    s,
    '    } else if (request.status === "complete") {\n      const completionDoc = state.documents.find((doc) => doc.id === `${currentServiceKey}-completion-${request.id}`);',
    '    } else if (currentServiceKey === "title" && request.status === "in-progress" && role === "buyer" && !request.clientClosingConfirmed) {\n      $("client-status-copy").textContent = "The settlement provider is preparing the closing. Confirm this fictional signing / closing step once the buyer has completed the required signing.";\n      actions.innerHTML = \'<button type="button" class="primary-button button-blue" data-client-action="confirm-closing">Confirm closing / signing complete</button>\';\n    } else if (currentServiceKey === "title" && request.status === "in-progress" && request.clientClosingConfirmed) {\n      $("client-status-copy").textContent = "Buyer closing / signing is confirmed. The settlement provider can now finalize the transfer and publish the final closing record.";\n    } else if (request.status === "complete") {\n      const completionDoc = state.documents.find((doc) => doc.id === `${currentServiceKey}-completion-${request.id}`);',
    "buyer closing confirmation action",
)

s = replace_once(
    s,
    '      if (button.dataset.clientAction === "request-change") transition(currentServiceKey, "matched", role === "seller" ? "Seller" : "Buyer", `${role === "seller" ? "Demo Seller" : "Demo Buyer"} requested a revision to the provider response.`);\n      renderAll();',
    '      if (button.dataset.clientAction === "request-change") transition(currentServiceKey, "matched", role === "seller" ? "Seller" : "Buyer", `${role === "seller" ? "Demo Seller" : "Demo Buyer"} requested a revision to the provider response.`);\n      if (button.dataset.clientAction === "confirm-closing") {\n        const active = state.requests[currentServiceKey];\n        if (active) { active.clientClosingConfirmed = true; active.updatedAt = Date.now(); active.lastTransitionAt = active.updatedAt; addActivity("Demo Buyer confirmed the fictional closing / signing step.", "Buyer", true); saveState(); }\n      }\n      renderAll();',
    "confirm closing handler",
)

s = replace_once(
    s,
    '    } else if (request.status === "in-progress") {\n      guidance.textContent = "Work is in progress. When finished, complete the job and publish the closeout record.";\n      addButton("Mark complete", "complete", true); addButton("Request information", "needs-info");',
    '    } else if (request.status === "in-progress") {\n      if (currentServiceKey === "title" && !request.clientClosingConfirmed) {\n        guidance.textContent = "Closing preparation is in progress. Waiting for the buyer to confirm the fictional signing / closing step before final transfer can be completed.";\n        addButton("Waiting for buyer closing confirmation", "wait", false, true);\n      } else {\n        guidance.textContent = "Work is in progress. When finished, complete the job and publish the final record.";\n        addButton("Mark complete", "complete", true); addButton("Request information", "needs-info");\n      }',
    "provider title wait",
)

s = replace_once(
    s,
    '    const badge = $(`${prefix}-status`);\n    if (badge) badge.textContent = context.hasSelection ? "MREO record connected" : "No property selected";',
    '    const badge = $(`${prefix}-status`);\n    if (badge) badge.textContent = context.hasSelection ? (state?.acquisition?.status === "complete" ? "MREO record connected" : "Winning bid · closing required") : "No property selected";',
    "record badge",
)

write(path, s)

# coordination.html
path = "coordination.html"
s = read(path)
s = s.replace('coordination.css?v=20260917-workspace-v2', 'coordination.css?v=20260917-workspace-v3')
s = s.replace('coordination.js?v=20260917-workspace-v2', 'coordination.js?v=20260917-workspace-v3')
s = s.replace('Download the acquisition package, start any coordination pathway, review provider responses, approve work, and keep every resulting document attached to the property record.', 'Start the next required workflow, review provider responses, approve work, and keep the underlying property information connected automatically.')
s = s.replace('<div><span>Documents</span><strong id="coord-stat-docs">6</strong></div>', '<div><span>Connected records</span><strong id="coord-stat-docs">3</strong></div>')
s = s.replace('''          <p id="acquisition-copy">The fictional auction and purchase handoff are complete. The core acquisition files are available below and the same property record can now feed every coordination request.</p>
          <dl class="workspace-details" id="acquisition-details"></dl>
          <div class="form-actions"><button type="button" class="primary-button button-blue" id="download-acquisition-package">Download acquisition package</button></div>''', '''          <p id="acquisition-copy">The property record carries the transaction information into the next workflow automatically.</p>
          <dl class="workspace-details" id="acquisition-details"></dl>
          <div class="form-actions"><a class="primary-button button-blue" id="acquisition-primary-action" href="coordination-service.html?service=title">Start closing / title transfer →</a></div>''')
s = s.replace('<p class="section-label">Property documents</p>\n          <h2 id="workspace-documents-heading">One growing document library</h2>\n          <p>Acquisition, closing, provider, construction, brokerage, lease, and management documents accumulate here as the property moves through the network.</p>', '<p class="section-label">Connected property information</p>\n          <h2 id="workspace-documents-heading">Information travels with the property</h2>\n          <p>MREO automatically makes the relevant property and transaction records available to each workflow. Downloading and re-uploading the same packet should not be part of the normal process.</p>')
s = s.replace('<p class="section-label">Shared documents</p>\n          <h2>Files available to participating providers</h2>', '<p class="section-label">Connected property information</p>\n          <h2>Records available to participating providers</h2>')
write(path, s)

# coordination-service.html
path = "coordination-service.html"
s = read(path)
s = s.replace('coordination.css?v=20260917-workspace-v2', 'coordination.css?v=20260917-workspace-v3')
s = s.replace('coordination.js?v=20260917-workspace-v2', 'coordination.js?v=20260917-workspace-v3')
s = s.replace('''          <label class="service-upload-field">Supporting files
            <span>Upload photographs, reports, agreements, estimates, or other material that should travel with the property request.</span>''', '''          <label class="service-upload-field">Optional additional files
            <span>The existing MREO property and transaction record is already attached automatically. Add a file only if the provider needs something that is not already in the record.</span>''')
s = s.replace('<p class="section-label">Files produced by this pathway</p>\n        <h2>Service documents</h2>\n        <p>As the fictional workflow progresses, proposals, requirements, approvals, and completion records appear here and are also added to the property-level document library.</p>', '<p class="section-label">Workflow records</p>\n        <h2>Connected service records</h2>\n        <p>Provider responses and final closeout records stay attached to the property automatically. Only final records that are useful outside MREO are presented as downloads.</p>')
write(path, s)

# coordination.css
path = "coordination.css"
s = read(path)
if '.document-state{' not in s:
    s += '\n.document-state{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:4px 0}\n'
write(path, s)

# Tests: coordination v3 and quieter document behavior
path = "tests/browser/coordination.spec.js"
s = read(path)
s = s.replace('mreo:coordination:v2:', 'mreo:coordination:v3:')
s = s.replace('''test("coordination workspace includes downloadable property documents and seller perspective",async({page})=>{
 await page.goto("/coordination.html?auction=coord-docs&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000");
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-docs"));
 await page.reload();
 await expect(page.locator("#coord-document-library .document-item")).toHaveCount(5);
 await expect(page.getByRole("button",{name:"Download acquisition package"})).toBeVisible();
 await page.getByRole("button",{name:"Seller",exact:true}).click();
 await expect(page.locator("#role-workspace-title")).toContainText("Closing, transfer");
 await expect(page.getByRole("button",{name:"Download seller closing package"})).toBeVisible();
 await expect(page.locator("#acquisition-details")).toContainText("Winning buyer");
});''', '''test("coordination keeps property records connected without unnecessary downloads",async({page})=>{
 await page.goto("/coordination.html?auction=coord-docs&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000");
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-docs"));
 await page.reload();
 await expect(page.locator("#coord-document-library .document-item")).toHaveCount(3);
 await expect(page.locator("#coord-document-library")).toContainText("Connected");
 await expect(page.getByRole("button",{name:/Download acquisition package/i})).toHaveCount(0);
 await expect(page.getByRole("link",{name:/title \/ transfer workflow/i})).toBeVisible();
 await page.getByRole("button",{name:"Seller",exact:true}).click();
 await expect(page.locator("#role-workspace-title")).toContainText("Closing, transfer");
 await expect(page.locator("#acquisition-details")).toContainText("Winning buyer");
});''')

# Add a title workflow test with real buyer interaction.
marker = 'test("seller-created property listings are routed through the detail page"'
if 'title workflow requires buyer closing participation' not in s:
    insert = '''test("title workflow requires buyer closing participation",async({page})=>{
 const base="/coordination.html?type=property&auction=coord-title-buyer&address=2605%20Preston%20Meadow%20Court%2C%20Plano%2C%20TX%2075093&price=2000000&stage=won";
 await page.goto(base);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-title-buyer"));
 await page.reload();
 await expect(page.locator("#acquisition-heading")).toContainText("Seller acceptance and closing");
 await page.getByRole("link",{name:"Start closing / title transfer →"}).click();
 await expect(page.locator('input[name="legalName"]')).toBeVisible();
 await expect(page.locator('select[name="funding"]')).toBeVisible();
 await page.locator("#service-submit").click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await page.getByRole("button",{name:"Accept request"}).click();
 await page.getByRole("button",{name:"Send provider response"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await page.getByRole("button",{name:"Approve provider response"}).click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await page.getByRole("button",{name:"Start work"}).click();
 await expect(page.getByRole("button",{name:"Waiting for buyer closing confirmation"})).toBeDisabled();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.getByRole("button",{name:"Confirm closing / signing complete"})).toBeVisible();
 await page.getByRole("button",{name:"Confirm closing / signing complete"}).click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.getByRole("button",{name:"Mark complete"})).toBeVisible();
});

'''
    s = s.replace(marker, insert + marker, 1)
write(path, s)

# Auction handoff test: winner should not need to wait for simulated sale completion.
path = "tests/browser/auction-handoff.spec.js"
s = read(path)
s = '''import {test,expect} from "@playwright/test";\n\ntest("closed auction hands the winning buyer into closing before sale completion",async({page})=>{\n await page.goto("/auction.html?id=demo-property&view=buyer");\n const controls=page.locator("#test-controls");\n await expect(controls).toBeVisible();\n if(!(await controls.getAttribute("open"))) await controls.locator("summary").click();\n await page.locator("#test-actor").selectOption("test-buyer-c");\n await page.getByRole("button",{name:"Advance to result"}).click();\n await expect(page.locator("#auction-result")).toContainText("Your bid won");\n const workspace=page.getByRole("link",{name:"Begin closing & coordination →"});\n await expect(workspace).toBeVisible();\n const href=new URL(await workspace.getAttribute("href"),page.url());\n expect(href.searchParams.get("auction")).toBe("demo-property");\n expect(href.searchParams.get("role")).toBe("buyer");\n expect(href.searchParams.get("stage")).toBe("won");\n expect(Number(href.searchParams.get("price"))).toBeGreaterThan(0);\n await workspace.click();\n await expect(page).toHaveURL(/coordination\\.html\\?/);\n await expect(page.locator("#coord-record-title")).toContainText("4218 Maple Ridge Drive");\n await expect(page.locator("#acquisition-heading")).toContainText("Seller acceptance and closing");\n await expect(page.getByRole("link",{name:"Start closing / title transfer →"})).toBeVisible();\n await expect(page.getByRole("button",{name:/Download acquisition package/i})).toHaveCount(0);\n});\n\ntest("seller can enter the shared closing workspace once the auction closes",async({page})=>{\n await page.goto("/auction.html?id=demo-property&view=seller");\n const controls=page.locator("#test-controls");\n await expect(controls).toBeVisible();\n if(!(await controls.getAttribute("open"))) await controls.locator("summary").click();\n await page.locator("#test-actor").selectOption("test-seller");\n await page.getByRole("button",{name:"Advance to result"}).click();\n const workspace=page.getByRole("link",{name:"Continue seller closing →"});\n await expect(workspace).toBeVisible();\n const href=new URL(await workspace.getAttribute("href"),page.url());\n expect(href.searchParams.get("stage")).toBe("won");\n expect(href.searchParams.get("role")).toBe("seller");\n});\n'''
write(path, s)

print("coordination simplification patch applied")
