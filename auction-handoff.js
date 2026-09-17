(() => {
  "use strict";

  const S = globalThis.MreoService;
  const C = globalThis.MreoCore;
  const $ = (id) => document.getElementById(id);
  if (!S || !C || !$("auction-handoff")) return;

  let refreshToken = 0;

  const cashNumber = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  };

  function currentView() {
    return $("view-seller")?.getAttribute("aria-pressed") === "true" ? "seller" : "buyer";
  }

  function buildWorkspaceUrl(auction, view, amount) {
    const query = new URLSearchParams();
    query.set("type", auction.kind === "portfolio" ? "portfolio" : "property");
    query.set("auction", auction.id);
    query.set(auction.kind === "portfolio" ? "title" : "address", auction.title);
    if (amount) query.set("price", String(amount));
    if (auction.kind === "portfolio") query.set("count", String(auction.portfolioCount || auction.portfolio?.length || 0));
    query.set("role", view);
    return `coordination.html?${query.toString()}`;
  }

  async function refreshHandoff() {
    const token = ++refreshToken;
    const container = $("auction-handoff");
    const select = $("auction-select");
    if (!container || !select?.value || $("auction-content")?.hidden) {
      if (container) container.hidden = true;
      return;
    }

    const view = currentView();
    const actor = $("test-actor")?.value || undefined;
    try {
      const result = await S.auction(select.value, view, actor);
      if (token !== refreshToken) return;
      const auction = result.auction;
      const eligible = auction.status === "closed" && auction.saleCompleted && (
        view === "seller" ? result.isSeller : auction.viewerOutcome === "won"
      );
      if (!eligible) {
        container.hidden = true;
        container.replaceChildren();
        return;
      }

      const top = C.highest(auction);
      const amount = cashNumber(top?.amount);
      const link = buildWorkspaceUrl(auction, view, amount);
      const heading = view === "seller" ? "Sale complete. Continue to closing and handoff." : "Purchase complete. Your property workspace is ready.";
      const copy = view === "seller"
        ? "Open the seller workspace to download the closing handoff package, follow title and transfer activity, and see the same provider requests from the seller side."
        : "Open the property workspace to download the acquisition package and continue through Transfer, Improve, Represent, and Rent / Manage.";
      const label = view === "seller" ? "Open seller closing workspace →" : "Open acquired-property workspace →";

      container.innerHTML = `<section class="form-panel" aria-label="Continue to property workspace"><p class="section-label">Next stage · MREO property workspace</p><h2>${heading}</h2><p>${copy}</p><div class="form-actions"><a class="primary-button button-blue" href="${link}">${label}</a></div></section>`;
      container.hidden = false;
    } catch {
      if (token === refreshToken) container.hidden = true;
    }
  }

  const observer = new MutationObserver(() => refreshHandoff());
  [$("auction-result"), $("auction-content"), $("seller-private")].filter(Boolean).forEach((element) => observer.observe(element, {subtree:true, childList:true, attributes:true, characterData:true}));
  [$("auction-select"), $("test-actor")].filter(Boolean).forEach((element) => element.addEventListener("change", refreshHandoff));
  [$("view-buyer"), $("view-seller"), $("finish-auction"), $("complete-sale")].filter(Boolean).forEach((element) => element.addEventListener("click", () => setTimeout(refreshHandoff, 80)));
  setInterval(refreshHandoff, 2000);
  refreshHandoff();
})();
