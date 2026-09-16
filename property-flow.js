(() => {
  "use strict";

  const qs = (sel, root = document) => root.querySelector(sel);
  const text = (sel, root = document) => (qs(sel, root)?.textContent || "").replace(/\s+/g, " ").trim();
  const params = new URLSearchParams(location.search);

  function parseMoney(value) {
    const numeric = String(value || "").replace(/[^0-9.-]/g, "");
    const amount = Number(numeric);
    return Number.isFinite(amount) && amount > 0 ? String(Math.round(amount)) : "";
  }

  function buildDetailLink(row) {
    const link = row.querySelector('.property-action a[href^="buyer.html?"], .property-action a[href^="auction.html?id="]');
    if (!link) return;

    const source = new URL(link.href, location.href);
    const detail = new URL("property.html", location.href);
    const originalHref = link.getAttribute("href") || "";

    if (originalHref.startsWith("buyer.html?")) {
      ["auction", "address", "price"].forEach((key) => {
        const value = source.searchParams.get(key);
        if (value) detail.searchParams.set(key, value);
      });
    } else {
      const auctionId = source.searchParams.get("id");
      const address = text("h2", row);
      if (auctionId) detail.searchParams.set("auction", auctionId);
      if (address) detail.searchParams.set("address", address);
    }

    const image = row.querySelector(".property-thumbnail img")?.getAttribute("src") || "";
    const locationLabel = text(".property-location", row);
    let description = text(".property-description", row);
    if (!description) {
      description = [...row.querySelectorAll(".property-main-info p")]
        .map((p) => (p.textContent || "").replace(/\s+/g, " ").trim())
        .find((value) => value && value !== locationLabel) || "";
    }
    if (image) detail.searchParams.set("image", image);
    if (description) detail.searchParams.set("description", description);
    if (locationLabel) detail.searchParams.set("location", locationLabel);

    row.querySelectorAll(".property-facts > div").forEach((fact) => {
      const label = text(".property-fact-label", fact).toLowerCase();
      const value = text("strong", fact);
      if (!value) return;
      if (label.includes("size")) detail.searchParams.set("size", value);
      else if (label.includes("beds")) detail.searchParams.set("bedsBaths", value);
      else if (label.includes("condition")) detail.searchParams.set("condition", value);
      else if (label.includes("type")) detail.searchParams.set("type", value);
      else if ((label.includes("price") || label.includes("required bid")) && !detail.searchParams.has("price")) {
        const amount = parseMoney(value);
        if (amount) detail.searchParams.set("price", amount);
      }
    });

    link.href = detail.pathname.split("/").pop() + detail.search;
    link.textContent = "View / Prepare Interest";
    link.classList.add("button-blue");
  }

  function buildDetailLinks(root = document) {
    if (root.matches?.(".property-row")) buildDetailLink(root);
    root.querySelectorAll?.(".property-row").forEach(buildDetailLink);
  }

  function watchForNewListings() {
    const marketplace = document.querySelector(".property-marketplace");
    if (!marketplace) return;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) buildDetailLinks(node);
        }
      }
    });
    observer.observe(marketplace, {childList:true, subtree:true});
  }

  function safeImage(value) {
    if (!value) return "";
    if (/^(https?:\/\/|assets\/)/i.test(value)) return value;
    return "";
  }

  function contextQuery() {
    const out = new URLSearchParams();
    ["auction", "address", "price", "image", "description", "location", "size", "bedsBaths", "condition", "type"].forEach((key) => {
      const value = params.get(key);
      if (value) out.set(key, value);
    });
    out.set("type", "property");
    return out;
  }

  function populateDetailPage() {
    const title = document.getElementById("property-detail-address");
    if (!title) return;

    const address = params.get("address") || "Property details";
    const price = Number(params.get("price") || 0);
    const image = safeImage(params.get("image"));
    const locationLabel = params.get("location") || "Available property";
    const description = params.get("description") || "Review this property, then prepare interest or coordinate the services needed around the property.";

    title.textContent = address;
    document.getElementById("property-detail-location").textContent = locationLabel;
    document.getElementById("property-detail-description").textContent = description;
    document.title = address + " | MREO";

    const priceEl = document.getElementById("property-detail-price");
    priceEl.textContent = price ? new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0}).format(price) : "Price awaiting confirmation";

    const imageEl = document.getElementById("property-detail-image");
    if (image) {
      imageEl.src = image;
      imageEl.alt = "Property image for " + address;
    } else {
      imageEl.closest(".single-property-media").hidden = true;
    }

    const setFact = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || "NA";
    };
    setFact("property-detail-size", params.get("size"));
    setFact("property-detail-beds", params.get("bedsBaths"));
    setFact("property-detail-condition", params.get("condition") || params.get("type"));

    const buyer = new URLSearchParams();
    ["auction", "address", "price"].forEach((key) => {
      const value = params.get(key);
      if (value) buyer.set(key, value);
    });
    document.getElementById("property-prepare-interest").href = "buyer.html?" + buyer.toString();
    document.getElementById("property-coordinate").href = "coordination.html?" + contextQuery().toString();
  }

  if (document.body.classList.contains("properties-page")) {
    buildDetailLinks();
    watchForNewListings();
  }
  populateDetailPage();
})();
