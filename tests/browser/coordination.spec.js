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
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v2:coord-cross-role"));
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
 await page.getByRole("button",{name:"Send provider response"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Proposal ready");

 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.locator("#client-status-pill")).toHaveText("Proposal ready");
 await expect(page.locator("#client-status-copy")).toContainText("$28,400");
 await page.getByRole("button",{name:"Approve provider response"}).click();
 await expect(page.locator("#client-status-pill")).toHaveText("Approved");

 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await page.getByRole("button",{name:"Start work"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("In progress");
 await page.getByRole("button",{name:"Mark complete"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Complete");
 await expect(page.locator("#service-document-library")).toContainText("Construction completion");
});

test("all four coordination pathways can be submitted and appear in the provider inbox",async({page})=>{
 const base="/coordination.html?type=property&auction=coord-all-paths&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000";
 await page.goto(base);
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v2:coord-all-paths"));
 await page.reload();
 for(const service of ["title","contractors","realtors","rentals"]){
  await page.locator(`[data-service="${service}"]`).click();
  await expect(page).toHaveURL(new RegExp(`coordination-service\\.html\\?.*service=${service}`));
  await page.locator("#service-submit").click();
  await expect(page.locator("#client-request-status")).toBeVisible();
  await page.goto(base);
  await expect(page.locator(`[data-service="${service}"] .service-status`)).not.toHaveText("Not started");
 }
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
 await expect(page.locator("#provider-queue .provider-job")).toHaveCount(4);
 await expect(page.locator("#provider-inbox-count")).toHaveText("4");
});

test("coordination workspace includes downloadable property documents and seller perspective",async({page})=>{
 await page.goto("/coordination.html?auction=coord-docs&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000");
 await page.evaluate(()=>localStorage.removeItem("mreo:coordination:v2:coord-docs"));
 await page.reload();
 await expect(page.locator("#coord-document-library .document-item")).toHaveCount(5);
 await expect(page.getByRole("button",{name:"Download acquisition package"})).toBeVisible();
 await page.getByRole("button",{name:"Seller",exact:true}).click();
 await expect(page.locator("#role-workspace-title")).toContainText("Closing, transfer");
 await expect(page.getByRole("button",{name:"Download seller closing package"})).toBeVisible();
 await expect(page.locator("#acquisition-details")).toContainText("Winning buyer");
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
