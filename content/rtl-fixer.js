// GeekRTL v2 · RTL fixer for AI chat platforms
// by GeekMani · github.com/mani-imani

(async () => {
  // ── Config ────────────────────────────────────────────────
  const PERSIAN_ARABIC_REGEX = /[؀-ۿݐ-ݿࢠ-ࣿ]/;
  const MIN_RTL_RATIO = 0.3; // 30%+ RTL letters → treat the block as RTL
  const CHILD_TAGS = "p, li, blockquote, h1, h2, h3, h4, h5, h6";

  // Load this site's selectors from sites/sites.json
  let siteSelectors = [];
  let inputSelectors = [];
  try {
    const res = await fetch(chrome.runtime.getURL("sites/sites.json"));
    const data = await res.json();
    const host = location.hostname;
    const site = data.sites.find((s) => host === s.host || host.endsWith("." + s.host));
    if (site) {
      siteSelectors = site.selectors;
      inputSelectors = site.inputSelectors || [];
    }
  } catch (e) {
    console.warn("[GeekRTL] Could not load sites.json", e);
  }
  if (!siteSelectors.length && !inputSelectors.length) return;

  let enabled = false; // single source of truth inside the page

  // ── Helpers ───────────────────────────────────────────────
  function readEnabled() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ geekrtl_enabled: true }, (r) => resolve(r.geekrtl_enabled));
    });
  }

  function getRTLRatio(text) {
    const chars = text.replace(/\s/g, "");
    if (!chars.length) return 0;
    let rtl = 0;
    for (const c of chars) if (PERSIAN_ARABIC_REGEX.test(c)) rtl++;
    return rtl / chars.length;
  }

  function clearElement(el) {
    el.removeAttribute("dir");
    el.classList.remove("geekrtl-rtl", "geekrtl-auto");
  }

  // ── Core: fix one message block ───────────────────────────
  // Uses textContent (no layout cost) so streaming stays smooth.
  function fixElement(el) {
    const text = el.textContent || "";
    el.dataset.geekrtlFixed = "1";
    clearElement(el); // a re-fix during streaming starts clean
    if (!text.trim()) return;

    const ratio = getRTLRatio(text);
    if (ratio >= MIN_RTL_RATIO) {
      el.setAttribute("dir", "rtl");
      el.classList.add("geekrtl-rtl");
    } else if (PERSIAN_ARABIC_REGEX.test(text)) {
      el.setAttribute("dir", "auto");
      el.classList.add("geekrtl-auto");
    }

    el.querySelectorAll(CHILD_TAGS).forEach((child) => {
      const childText = child.textContent || "";
      if (!childText.trim()) return;
      child.dataset.geekrtlFixed = "1";
      child.setAttribute("dir", getRTLRatio(childText) >= MIN_RTL_RATIO ? "rtl" : "auto");
    });
  }

  // Streaming fires many mutations per second: fix each block at most once per frame.
  const pending = new Set();
  let frame = 0;
  function queueFix(el) {
    pending.add(el);
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const list = [...pending];
      pending.clear();
      if (enabled) list.forEach(fixElement);
    });
  }

  // ── Prompt box: direction follows what you type ───────────
  const attachedInputs = new WeakSet();

  function onInput(ev) {
    if (!enabled) return;
    const el = ev.currentTarget;
    const text = el.tagName === "TEXTAREA" || el.tagName === "INPUT" ? el.value || "" : el.textContent || "";
    if (!text.trim()) el.setAttribute("dir", "auto");
    else el.setAttribute("dir", getRTLRatio(text) >= MIN_RTL_RATIO ? "rtl" : "ltr");
  }

  function attachInput(el) {
    el.dataset.geekrtlInput = "1";
    if (!el.hasAttribute("dir")) el.setAttribute("dir", "auto");
    if (attachedInputs.has(el)) return; // never add the listener twice
    attachedInputs.add(el);
    el.addEventListener("input", onInput);
  }

  function attachInputs(root = document) {
    inputSelectors.forEach((sel) => {
      try {
        if (root !== document && root.matches?.(sel)) attachInput(root);
        root.querySelectorAll?.(sel).forEach(attachInput);
      } catch (_) {}
    });
  }

  // ── Scan ──────────────────────────────────────────────────
  function closestBlock(node) {
    for (const s of siteSelectors) {
      try {
        const hit = node.closest(s);
        if (hit) return hit;
      } catch (_) {}
    }
    return null;
  }

  function scanAll() {
    siteSelectors.forEach((sel) => {
      try {
        document.querySelectorAll(sel).forEach(fixElement);
      } catch (_) {}
    });
  }

  // ── MutationObserver: new messages and streaming text ─────
  let observer = null;

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          siteSelectors.forEach((sel) => {
            try {
              if (node.matches(sel)) queueFix(node);
              node.querySelectorAll(sel).forEach(queueFix);
            } catch (_) {}
          });
          attachInputs(node);
        }
        let target = m.target;
        if (target.nodeType === 3) target = target.parentElement;
        if (!target || target.closest?.("[data-geekrtl-input]")) continue; // typing is handled by onInput
        const block = closestBlock(target);
        if (block) queueFix(block);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function stopObserver() {
    if (observer) observer.disconnect();
    observer = null;
    pending.clear();
  }

  // ── Turn on / off ─────────────────────────────────────────
  function turnOn() {
    enabled = true;
    scanAll();
    attachInputs();
    startObserver();
  }

  function turnOff() {
    enabled = false;
    stopObserver();
    document.querySelectorAll("[data-geekrtl-fixed]").forEach((el) => {
      clearElement(el);
      delete el.dataset.geekrtlFixed;
    });
    document.querySelectorAll("[data-geekrtl-input]").forEach((el) => {
      el.removeAttribute("dir");
      delete el.dataset.geekrtlInput;
    });
  }

  // Popup toggle (sent to the active tab) and changes from other tabs/windows
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "GEEKRTL_TOGGLE") (msg.enabled ? turnOn : turnOff)();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && "geekrtl_enabled" in changes) {
      const on = changes.geekrtl_enabled.newValue;
      if (on && !enabled) turnOn();
      else if (!on && enabled) turnOff();
    }
  });

  // ── Init ──────────────────────────────────────────────────
  if (await readEnabled()) {
    // give the page a moment to render the first messages
    setTimeout(() => { if (!enabled) turnOn(); }, 1200);
  }
})();
