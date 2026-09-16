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
