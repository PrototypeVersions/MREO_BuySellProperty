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

test("newly inserted property listings are routed through the detail page",async({page})=>{
 await page.goto("/properties.html");
 await page.evaluate(()=>{
  const host=document.querySelector(".property-marketplace");
  const row=document.createElement("article");
  row.className="property-row";
  row.innerHTML=`<div class="property-thumbnail"><img src="assets/property-placeholder.svg" alt="Test property"></div><div class="property-main-info"><p class="property-location">Test City</p><h2>1 Dynamic Lane</h2><p class="property-description">Dynamic listing</p></div><div class="property-facts"><div><span class="property-fact-label">Price</span><strong>$100,000</strong></div></div><div class="property-action"><a class="primary-button button-blue" href="buyer.html?auction=dynamic-test&address=1%20Dynamic%20Lane%2C%20Test%20City&price=100000">View / Prepare Interest</a></div>`;
  host.appendChild(row);
 });
 const link=page.locator('.property-row').last().getByRole("link",{name:"View / Prepare Interest"});
 await expect(link).toHaveAttribute("href",/property\.html\?/);
});
