import {test,expect} from "@playwright/test";

test("closed auction hands the winning buyer into closing before sale completion",async({page})=>{
 await page.goto("/auction.html?id=demo-property&view=buyer");
 const controls=page.locator("#test-controls");
 await expect(controls).toBeVisible();
 if(!(await controls.getAttribute("open"))) await controls.locator("summary").click();
 await page.locator("#test-actor").selectOption("test-buyer-c");
 await page.getByRole("button",{name:"Advance to result"}).click();
 await expect(page.locator("#auction-result")).toContainText("Your bid won");
 const workspace=page.getByRole("link",{name:"Begin closing & coordination →"});
 await expect(workspace).toBeVisible();
 const href=new URL(await workspace.getAttribute("href"),page.url());
 expect(href.searchParams.get("auction")).toBe("demo-property");
 expect(href.searchParams.get("role")).toBe("buyer");
 expect(href.searchParams.get("stage")).toBe("won");
 expect(Number(href.searchParams.get("price"))).toBeGreaterThan(0);
 await workspace.click();
 await expect(page).toHaveURL(/coordination\.html\?/);
 await expect(page.locator("#coord-record-title")).toContainText("4218 Maple Ridge Drive");
 await expect(page.locator("#acquisition-heading")).toContainText("Seller acceptance and closing");
 await expect(page.getByRole("link",{name:"Start closing / title transfer →"})).toBeVisible();
 await expect(page.getByRole("button",{name:/Download acquisition package/i})).toHaveCount(0);
});

test("seller can enter the shared closing workspace once the auction closes",async({page})=>{
 await page.goto("/auction.html?id=demo-property&view=seller");
 const controls=page.locator("#test-controls");
 await expect(controls).toBeVisible();
 if(!(await controls.getAttribute("open"))) await controls.locator("summary").click();
 await page.locator("#test-actor").selectOption("test-seller");
 await page.getByRole("button",{name:"Advance to result"}).click();
 const workspace=page.getByRole("link",{name:"Continue seller closing →"});
 await expect(workspace).toBeVisible();
 const href=new URL(await workspace.getAttribute("href"),page.url());
 expect(href.searchParams.get("stage")).toBe("won");
 expect(href.searchParams.get("role")).toBe("seller");
});
