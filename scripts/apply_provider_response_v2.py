from pathlib import Path

def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Expected text not found in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))

for path in ("coordination.html", "coordination-service.html"):
    replace_once(
        path,
        '<script src="coordination.js?v=20260917-workspace-v3"></script>',
        '<script src="coordination.js?v=20260917-workspace-v4"></script><script src="coordination-response-enhancements.js?v=20260917-provider-response-v1"></script>'
    )
    replace_once(
        path,
        'coordination.css?v=20260917-workspace-v3',
        'coordination.css?v=20260917-workspace-v4'
    )

replace_once(
    "coordination.js",
    '''      } else if (request.status === "matched" && elapsed > 18000) {
        transition(serviceKey, "proposal", "Service Partner", `${services[serviceKey].provider} automatically returned a demonstration proposal / engagement package.`); changed = true;
''',
    '''      } else if (request.status === "matched" && elapsed > 18000) {
        // Wait for the Service Partner to prepare and send the provider response.
'''
)

replace_once(
    "tests/browser/coordination.spec.js",
    ''' await page.getByRole("button",{name:"Accept request"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Provider reviewing");
 await page.getByRole("button",{name:"Send provider response"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Proposal ready");

 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.locator("#client-status-pill")).toHaveText("Proposal ready");
 await expect(page.locator("#client-status-copy")).toContainText("$28,400");
 await page.getByRole("button",{name:"Approve provider response"}).click();
 await expect(page.locator("#client-status-pill")).toHaveText("Approved");
''',
    ''' await page.getByRole("button",{name:"Accept request"}).click();
 await expect(page.locator("#provider-status-pill")).toHaveText("Provider reviewing");
 await page.getByRole("link",{name:"Prepare provider response →"}).click();
 await expect(page).toHaveURL(/coordination-response\\.html\\?/);
 await expect(page.locator('input[name="totalPrice"]')).toHaveValue("$28,400");
 await expect(page.locator('textarea[name="lineItems"]')).toContainText("Flooring");
 await page.getByRole("button",{name:"Send response to client"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Review provider response"})).toBeVisible();
 await expect(page.locator("#client-response-details")).toContainText("$28,400");
 await expect(page.locator("#client-response-details")).toContainText("24 calendar days");
 await page.getByRole("button",{name:"Approve response"}).click();
 await expect(page).toHaveURL(/coordination-service\\.html\\?/);
 await expect(page.locator("#client-status-pill")).toHaveText("Approved");
'''
)

replace_once(
    "tests/browser/coordination.spec.js",
    ''' await page.getByRole("button",{name:"Accept request"}).click();
 await page.getByRole("button",{name:"Send provider response"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await page.getByRole("button",{name:"Approve provider response"}).click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
''',
    ''' await page.getByRole("button",{name:"Accept request"}).click();
 await page.getByRole("link",{name:"Prepare provider response →"}).click();
 await expect(page.locator('input[name="totalCharges"]')).toHaveValue("$2,150");
 await expect(page.locator('textarea[name="requirements"]')).toContainText("Confirm legal name and vesting");
 await page.getByRole("button",{name:"Send response to client"}).click();
 await page.getByRole("button",{name:"Buyer",exact:true}).click();
 await expect(page.locator("#client-response-details")).toContainText("Preliminary title findings");
 await page.getByRole("button",{name:"Approve response"}).click();
 await page.getByRole("button",{name:"Service Partner",exact:true}).click();
'''
)

spec = Path("tests/browser/coordination.spec.js")
text = spec.read_text()
marker = '\ntest("all four coordination pathways can be submitted and appear in the provider inbox"'
if marker not in text:
    raise SystemExit("Coordination test insertion marker not found")
new_test = r'''
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
 await expect(page).toHaveURL(/coordination-service\\.html\\?/);
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

'''
spec.write_text(text.replace(marker, "\n"+new_test+marker.lstrip("\n"), 1))
