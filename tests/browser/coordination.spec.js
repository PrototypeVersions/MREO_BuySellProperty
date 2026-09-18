import {test,expect} from "@playwright/test";

test("property detail connects buying and coordination",async({page})=>{
 await page.goto("/properties.html");
 const first=page.locator(".property-marketplace > .property-row").first();
 const thumbnail=await first.locator(".property-thumbnail img").getAttribute("src");
 await first.getByRole("link",{name:"View / Prepare Interest",exact:true}).click();
 await expect(page).toHaveURL(/property\.html\?/);
 await expect(page.locator("#property-detail-image")).toHaveAttribute("src",thumbnail);
 await expect(page.getByRole("link",{name:"Prepare Interest"})).toBeVisible();
 await page.getByRole("link",{name:"Coordinate This Property"}).click();
 await expect(page).toHaveURL(/coordination\.html\?/);
 await expect(page.locator("#coord-record-title")).toContainText("4218 Maple Ridge Drive");
 await expect(page.locator(".coordination-card")).toHaveCount(4);
 await expect(page.getByRole("button",{name:"Buyer",exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Seller",exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Service Partner",exact:true})).toBeVisible();
});

test("Turkey property uses the standard hero, gallery, video, and coordination layout",async({page})=>{
 await page.goto("/turkey-property.html");
 await expect(page.locator(".single-property-media img")).toHaveAttribute("src","assets/turkey/photos/videoframe_18959.webp");
 await expect(page.getByRole("heading",{name:"Additional images",exact:true})).toBeVisible();
 await expect(page.locator(".seller-media-grid figure")).toHaveCount(6);
 await expect(page.locator('.seller-media-grid img[src*="videoframe_18959"]')).toHaveCount(0);
 await expect(page.getByRole("heading",{name:"Property videos",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Watch the YouTube video"})).toHaveAttribute("href","https://www.youtube.com/watch?v=MUdBlpLWFEY");
 await page.getByRole("link",{name:"Coordinate This Property"}).click();
 await expect(page).toHaveURL(/coordination\.html\?/);
 await expect(page.locator("#coord-record-title")).toContainText("Address awaiting confirmation");
 await expect(page.locator("#coord-record-meta")).toContainText("$7,500,000");
});

test("coordination request is the same object across buyer and service partner views",async({page})=>{
 const base="/coordination.html?type=property&auction=coord-cross-role&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000";
 await page.goto(base);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-cross-role"));
 await page.reload();
 await page.locator('[data-service="contractors"]').click();
 await expect(page).toHaveURL(/service=contractors/);
 await expect(page.locator("#service-record-title")).toContainText("4218 Maple Ridge Drive");
 await expect(page.locator("#service-submit")).toBeVisible();
 await page.locator("#service-submit").click();
 await expect(page.locator("#client-request-status")).toBeVisible();
 await expect(page.locator("#client-status-pill")).toHaveText("Submitted");
 await expect(page.locator("#client-request-summary")).toContainText("$30,000");

 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.locator("#provider-service-panel")).toBeVisible();
 await expect(page.locator("#provider-request-detail")).toBeVisible();
 await expect(page.locator("#provider-request-summary")).toContainText("$30,000");
 await page.getByRole("button",{name:"Accept request"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Provider reviewing");
 await page.getByRole("link",{name:"Prepare provider response →"}).click();
 await expect(page).toHaveURL(/coordination-response\.html\?/);
 await expect(page.locator('input[name="totalPrice"]')).toHaveValue("$28,400");
 await expect(page.locator('textarea[name="lineItems"]')).toContainText("Flooring");
 await page.getByRole("button",{name:"Send response to client"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Review provider response"})).toBeVisible();
 await expect(page.locator("#client-response-details")).toContainText("$28,400");
 await expect(page.locator("#client-response-details")).toContainText("24 calendar days");
 await page.getByRole("button",{name:"Approve response"}).click();
 await expect(page).toHaveURL(/coordination-service\.html\?/);
 await expect(page.locator("#client-status-pill")).toHaveText("Approved");

 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await page.getByRole("button",{name:"Start work"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("In progress");
 await page.getByRole("button",{name:"Mark complete"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Complete");
 await expect(page.locator("#service-document-library")).toContainText("Construction completion");
});


test("client can request provider-response changes and provider can revise the same response",async({page})=>{
 const base="/coordination.html?type=property&auction=coord-response-revision&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000";
 await page.goto(base);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-response-revision"));
 await page.reload();
 await page.locator('[data-service="rentals"]').click();
 await page.locator("#service-submit").click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await page.getByRole("button",{name:"Accept request"}).click();
 await page.getByRole("link",{name:"Prepare provider response →"}).click();
 await expect(page.locator('input[name="managementFee"]')).toHaveValue(/8%/);
 await page.locator('input[name="managementFee"]').fill("7% of collected monthly rent — revised demonstration term");
 await page.getByRole("button",{name:"Send response to client"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.locator("#client-response-details")).toContainText("7% of collected monthly rent");
 await page.getByRole("button",{name:"Request changes"}).click();
 await page.locator("#revision-request-note").fill("Please reduce the routine maintenance authority threshold.");
 await page.getByRole("button",{name:"Send change request"}).click();
 await expect(page).toHaveURL(/coordination-service\.html\?/);
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.getByRole("link",{name:"Revise provider response →"})).toBeVisible();
 await page.getByRole("link",{name:"Revise provider response →"}).click();
 await expect(page.locator(".response-revision-banner")).toContainText("reduce the routine maintenance authority threshold");
 await page.locator('input[name="maintenanceAuthority"]').fill("Up to $250 per incident without additional owner approval — revised demonstration term");
 await page.getByRole("button",{name:"Send revised response to client"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.locator("#response-version")).toHaveText("Revision 2");
 await expect(page.locator("#client-response-details")).toContainText("$250 per incident");
});

test("all four coordination pathways can be submitted and appear in the provider inbox",async({page})=>{
 const base="/coordination.html?type=property&auction=coord-all-paths&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000";
 await page.goto(base);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-all-paths"));
 await page.reload();
 for(const service of ["title","contractors","realtors","rentals"]){
  await page.locator(`[data-service="${service}"]`).click();
 await expect(page).toHaveURL(/coordination-service\.html\?/);
  await page.locator("#service-submit").click();
  await expect(page.locator("#client-request-status")).toBeVisible();
  await page.goto(base);
  await expect(page.locator(`[data-service="${service}"] .service-status`)).not.toHaveText("Not started");
 }
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.locator("#provider-queue .provider-job")).toHaveCount(4);
 await expect(page.locator("#provider-inbox-count")).toHaveText("4");
});

test("coordination keeps property records connected without unnecessary downloads",async({page})=>{
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
});

test("title workflow requires buyer closing participation",async({page})=>{
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
 await page.getByRole("link",{name:"Prepare provider response →"}).click();
 await expect(page.locator('input[name="totalCharges"]')).toHaveValue("$2,150");
 await expect(page.locator('textarea[name="requirements"]')).toContainText("Confirm legal name and vesting");
 await page.getByRole("button",{name:"Send response to client"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.locator("#client-response-details")).toContainText("Preliminary title findings");
 await page.getByRole("button",{name:"Approve response"}).click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await page.getByRole("button",{name:"Start work"}).click();
 await expect(page.getByRole("button",{name:"Waiting for buyer closing confirmation"})).toBeDisabled();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.getByRole("button",{name:"Confirm closing / signing complete"})).toBeVisible();
 await page.getByRole("button",{name:"Confirm closing / signing complete"}).click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.getByRole("button",{name:"Mark complete"})).toBeVisible();
});

test("seller-created property listings are routed through the detail page",async({page})=>{
 await page.goto("/properties.html");
 await page.evaluate(()=>{
  const host=document.querySelector(".property-marketplace");
  const row=document.createElement("article");
  row.className="property-row";
  row.innerHTML=`<div class="property-thumbnail"><img src="assets/property-placeholder.svg" alt="Property awaiting seller photographs"></div><div class="property-main-info"><p class="property-location">Your test listing</p><h2>1 Seller Lane, Test City, TX 75000</h2><p>As-is property</p></div><div class="property-facts"><div><span class="property-fact-label">Required bid</span><strong>$101,000</strong></div></div><div class="property-action"><a class="primary-button" href="auction.html?id=seller-created-test">View auction</a></div>`;
  host.appendChild(row);
 });
 const row=page.locator('.property-row').last();
 const link=row.getByRole("link",{name:"View / Prepare Interest",exact:true});
 await expect(link).toHaveAttribute("href",/property\.html\?/);
 await link.click();
 await expect(page).toHaveURL(/property\.html\?/);
 const detailUrl=new URL(page.url());
 expect(detailUrl.searchParams.get("auction")).toBe("seller-created-test");
 expect(detailUrl.searchParams.get("address")).toBe("1 Seller Lane, Test City, TX 75000");
 expect(detailUrl.searchParams.get("price")).toBe("101000");
 await expect(page.locator("#property-detail-address")).toHaveText("1 Seller Lane, Test City, TX 75000");
 await expect(page.locator("#property-detail-price")).toHaveText("$101,000");
 const interest=page.getByRole("link",{name:"Prepare Interest"});
 await expect(interest).toHaveAttribute("href",/auction=seller-created-test/);
 await expect(page.getByRole("link",{name:"Coordinate This Property"})).toBeVisible();
});

test("seller-created listing uses one fixed hero, remaining images, and videos",async({page})=>{
 await page.goto("/seller.html");
 const created=await page.evaluate(async()=>{
  const submission={title:"77 Seller Media Way, Dallas, TX 75201",kind:"property",minimum:200000,days:1,portfolio:[],details:{propertyCity:"Dallas",propertyState:"TX",propertySize:"1800",propertyBedrooms:"3",propertyBathrooms:"2",propertyType:"Single-family home"}};
  const account=await MreoService.register("seller",{name:"Media Seller",email:"media-seller@example.com"},submission);
  const png=new File([new Uint8Array([137,80,78,71,13,10,26,10])],"front.png",{type:"image/png"});
  const jpg=new File([new Uint8Array([255,216,255,217])],"back.jpg",{type:"image/jpeg"});
  const mp4=new File([new Uint8Array([0,0,0,24,102,116,121,112])],"walkthrough.mp4",{type:"video/mp4"});
  await MreoService.saveMedia(account.submission.draftId,[png,jpg,mp4]);
  await MreoService.checkout("seller",true);return await MreoService.activate("seller");
 });
 await page.goto("/properties.html");
 const row=page.locator("#new-listings .property-row").filter({hasText:"77 Seller Media Way"});
 await expect(row.getByRole("link",{name:"View / Prepare Interest"})).toBeVisible();
 await expect.poll(async()=>await row.locator(".property-thumbnail img").getAttribute("src")).toMatch(/^blob:/);
 await row.getByRole("link",{name:"View / Prepare Interest"}).click();
 expect(new URL(page.url()).searchParams.get("auction")).toBe(created.auctionId);
 await expect(page.locator("#property-detail-image")).toHaveAttribute("src",/^blob:/);
 await expect(page.locator("#seller-media-section")).toBeVisible();
 await expect(page.locator("#seller-media-gallery img")).toHaveCount(1);
 await expect(page.locator("#seller-media-gallery video")).toHaveCount(0);
 await expect(page.locator("#property-videos-section")).toBeVisible();
 await expect(page.locator("#property-video-gallery video")).toHaveCount(1);
 await expect(page.locator("#property-video-gallery")).toContainText("walkthrough.mp4");
 const galleryText=await page.locator("#seller-media-gallery").innerText();
 expect([galleryText.includes("front.png"),galleryText.includes("back.jpg")].filter(Boolean)).toHaveLength(1);
 const interest=page.getByRole("link",{name:"Prepare Interest"});
 expect(new URL(await interest.getAttribute("href"),page.url()).searchParams.get("auction")).toBe(created.auctionId);
});


test("streamlined coordination hub uses one attention indicator and clearer service names",async({page})=>{
 const base="/coordination.html?type=property&auction=coord-v5-hub&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000";
 await page.goto(base);
 await page.evaluate(()=>{localStorage.removeItem("mreo:coordination:v3:coord-v5-hub");localStorage.removeItem("mreo:coordination:provider-demo:v1");});
 await page.reload();
 await expect(page.locator('[data-service="contractors"] h2')).toHaveText("Contractors");
 await expect(page.locator('[data-service="realtors"] h2')).toHaveText("Realtors");
 await expect(page.locator("#acquisition-primary-action")).toHaveText("What comes next ↓");
 await expect(page.locator("#acquisition-primary-action")).toHaveAttribute("href","#coordination-pathways");
 await expect(page.locator("#coord-attention-v5")).toBeVisible();
 await expect(page.locator("#coord-attention-v5 .attention-state")).toHaveText("Action needed");
 await expect(page.locator(".workspace-stats")).toBeHidden();
 await expect(page.locator("#coordination-timeline").locator("xpath=ancestor::article[1]")).toBeHidden();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.locator(".provider-summary-grid")).toBeHidden();
 await expect(page.locator("#provider-queue [data-v5-provider-row]")).toHaveCount(8);
 await expect(page.locator("#provider-queue")).toContainText("Review closing profile");
 await expect(page.locator("#provider-queue")).toContainText("Prepare rehabilitation estimate");
});

test("coordination reuses buyer information and offers service-specific provider choices",async({page})=>{
 const url="/coordination-service.html?type=property&auction=coord-v5-prefill&address=2605%20Preston%20Meadow%20Court%2C%20Plano%2C%20TX%2075093&price=2000000&service=title&role=buyer&accountName=Acquisition%20Buyer%20LLC&accountEmail=buyer%40example.com&accountPhone=214-555-0199&purchaseMethod=Cash";
 await page.goto(url);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-v5-prefill"));
 await page.reload();
 await expect(page.locator(".carried-forward-panel")).toBeVisible();
 await expect(page.locator('input[name="clientAccountName"]')).toHaveValue("Acquisition Buyer LLC");
 await expect(page.locator('input[name="clientEmail"]')).toHaveValue("buyer@example.com");
 await expect(page.locator('input[name="legalName"]')).toHaveValue("Acquisition Buyer LLC");
 await expect(page.locator('select[name="funding"]')).toHaveValue("Cash purchase");
 const provider=page.locator('select[name="providerPreference"]');
 await expect(provider.locator("option")).toHaveCount(4);
 await expect(provider).toContainText("Match me with a participating provider");
 await expect(provider).toContainText("Meridian Closing Services");
 await expect(provider).toContainText("Lone Oak Title");
});

test("selected provider follows a submitted request into the Service Partner view",async({page})=>{
 const url="/coordination-service.html?type=property&auction=coord-v5-provider&address=940%20Hickory%20Grove%20Road%2C%20Denton%2C%20TX%2076209&price=354000&service=contractors&role=buyer&accountName=Hickory%20Grove%20Properties";
 await page.goto(url);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v3:coord-v5-provider"));
 await page.reload();
 const provider=page.locator('select[name="providerPreference"]');
 await expect(provider).toBeVisible();
 await expect(provider.locator("option")).toHaveCount(4);
 await provider.selectOption({label:"Redstone Restoration · demonstration"});
 await page.locator("#service-submit").click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.locator("#provider-company-name")).toContainText("Redstone Restoration");
});

test("fictional provider queue jobs open into interactive provider detail pages",async({page})=>{
 await page.goto("/coordination.html?role=provider&auction=coord-v5-demo-jobs&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229");
 await page.evaluate(()=>{localStorage.removeItem("mreo:coordination:v3:coord-v5-demo-jobs");localStorage.removeItem("mreo:coordination:provider-demo:v1");});
 await page.reload();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 const row=page.locator("#provider-queue [data-v5-provider-row]").filter({hasText:"940 Hickory Grove Road"});
 await expect(row).toContainText("Action needed");
 await row.getByRole("link",{name:"Open provider job →"}).click();
 await expect(page).toHaveURL(/coordination-provider-job\.html\?job=contractor-hickory/);
 await expect(page.locator("#provider-job-attention .attention-state")).toHaveText("Action needed");
 await expect(page.locator("#provider-job-fields")).toContainText("$42,000");
 await page.getByRole("button",{name:"Mark estimate prepared"}).click();
 await expect(page.locator("#provider-job-attention .attention-state")).toHaveText("Waiting");
 await expect(page.locator("#provider-job-status")).toContainText("Waiting for owner review");
});
