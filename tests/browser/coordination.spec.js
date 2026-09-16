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
});

test("Turkey property offers coordination and preserves its property record",async({page})=>{
 await page.goto("/turkey-property.html");
 await page.getByRole("link",{name:"Coordinate This Property"}).click();
 await expect(page).toHaveURL(/coordination\.html\?/);
 await expect(page.locator("#coord-record-title")).toContainText("Address awaiting confirmation");
 await expect(page.locator("#coord-record-meta")).toContainText("$7,500,000");
});

test("each coordination pathway can start a property-linked request",async({page})=>{
 const base="/coordination.html?type=property&auction=demo-property&address=4218%20Maple%20Ridge%20Drive%2C%20Dallas%2C%20TX%2075229&price=385000";
 await page.goto(base);
 for(const service of ["title","contractors","realtors","rentals"]){
  const card=page.locator(`[data-service="${service}"]`);
  await card.click();
  await expect(page).toHaveURL(new RegExp(`coordination-service\\.html\\?.*service=${service}`));
  await expect(page.locator("#service-record-title")).toContainText("4218 Maple Ridge Drive");
  await page.locator("#service-submit").click();
  await expect(page.locator("#service-message")).toContainText("Coordination request created");
  await page.goto(base);
  await expect(page.locator(`[data-service="${service}"] .service-status`)).toHaveText("Request started");
 }
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

test("seller-created listing uses uploaded images and exposes all uploaded media",async({page})=>{
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
 await expect(page.locator("#seller-media-section")).toBeVisible();
 await expect(page.locator("#seller-media-gallery img")).toHaveCount(2);
 await expect(page.locator("#seller-media-gallery video")).toHaveCount(1);
 await expect(page.locator("#seller-media-gallery")).toContainText("front.png");
 await expect(page.locator("#seller-media-gallery")).toContainText("back.jpg");
 await expect(page.locator("#seller-media-gallery")).toContainText("walkthrough.mp4");
 const interest=page.getByRole("link",{name:"Prepare Interest"});
 expect(new URL(await interest.getAttribute("href"),page.url()).searchParams.get("auction")).toBe(created.auctionId);
});
