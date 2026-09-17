import {test,expect} from "@playwright/test";

test("completed auction hands seller and winning buyer into the same property workspace",async({page})=>{
 await page.goto("/auction.html?id=demo-property&view=seller");
 await expect(page.locator("#test-controls")).toBeVisible();
 await page.locator("#test-controls summary").click();
 await page.locator("#test-actor").selectOption("test-seller");
 await page.getByRole("button",{name:"Advance to result"}).click();
 await expect(page.locator("#auction-result")).toContainText("Highest offer at close");
 await expect(page.getByRole("button",{name:"Simulate completed sale"})).toBeVisible();
 await page.getByRole("button",{name:"Simulate completed sale"}).click();

 await expect(page.getByRole("button",{name:"Download seller closing package"})).toBeVisible();
 const sellerWorkspace=page.getByRole("link",{name:"Open seller closing workspace →"});
 await expect(sellerWorkspace).toBeVisible();
 const sellerHref=new URL(await sellerWorkspace.getAttribute("href"),page.url());
 expect(sellerHref.searchParams.get("auction")).toBe("demo-property");
 expect(sellerHref.searchParams.get("role")).toBe("seller");
 expect(sellerHref.searchParams.get("address")).toContain("4218 Maple Ridge Drive");

 await page.getByRole("button",{name:"Buyer view"}).click();
 await page.locator("#test-actor").selectOption("test-buyer-c");
 await expect(page.locator("#auction-result")).toContainText("Your bid won");
 await expect(page.getByRole("button",{name:"Download acquisition package"})).toBeVisible();
 const buyerWorkspace=page.getByRole("link",{name:"Open acquired-property workspace →"});
 await expect(buyerWorkspace).toBeVisible();
 const buyerHref=new URL(await buyerWorkspace.getAttribute("href"),page.url());
 expect(buyerHref.searchParams.get("auction")).toBe("demo-property");
 expect(buyerHref.searchParams.get("role")).toBe("buyer");
 expect(Number(buyerHref.searchParams.get("price"))).toBeGreaterThan(0);

 await buyerWorkspace.click();
 await expect(page).toHaveURL(/coordination\.html\?/);
 await expect(page.locator("#coord-record-title")).toContainText("4218 Maple Ridge Drive");
 await expect(page.getByRole("button",{name:"Download acquisition package"})).toBeVisible();
});
