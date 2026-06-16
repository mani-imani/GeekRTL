// GeekRTL — RTL Fixer for AI Platforms
// by GeekMani | github.com/mani-imani

(async () => {
  // ── Config ────────────────────────────────────────────────
  const PERSIAN_ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const MIN_RTL_RATIO = 0.3; // if 30%+ of chars are RTL → treat as RTL

  // Load sites config
  let siteSelectors = [];
  let inputSelectors = [];
  try {
    const url = chrome.runtime.getURL("sites/sites.json");
    const res = await fetch(url);
    const data = await res.json();
    const host = location.hostname;
    const site = data.sites.find((s) => host.includes(s.host));
    if (site) {
      siteSelectors = site.selectors;
      inputSelectors = site.inputSelectors || [];
    }
  } catch (e) {
    console.warn("[GeekRTL] Could not load sites.json", e);
  }

  // ── Helpers ───────────────────────────────────────────────
  function isEnabled() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ geekrtl_enabled: true }, (r) =>
        resolve(r.geekrtl_enabled)
      );
    });
  }

  function getRTLRatio(text) {
    const chars = text.replace(/\s/g, "");
    if (!chars.length) return 0;
    const rtlCount = [...chars].filter((c) => PERSIAN_ARABIC_REGEX.test(c)).length;
    return rtlCount / chars.length;
  }

  function hasPersianArabic(text) {
    return PERSIAN_ARABIC_REGEX.test(text);
  }

  // ── Core: fix a single element ────────────────────────────
  function fixElement(el) {
    if (el.dataset.geekrtlFixed) return;
    el.dataset.geekrtlFixed = "1";

    const text = el.innerText || el.textContent || "";
    if (!text.trim()) return;

    const ratio = getRTLRatio(text);

    if (ratio >= MIN_RTL_RATIO) {
      // Mostly RTL content
      el.setAttribute("dir", "rtl");
      el.classList.add("geekrtl-rtl");
    } else if (hasPersianArabic(text)) {
      // Mixed content — bidi auto
      el.setAttribute("dir", "auto");
      el.classList.add("geekrtl-auto");
    }

    // Fix inline children (e.g. <p>, <li>, <span> inside markdown)
    el.querySelectorAll("p, li, blockquote, h1, h2, h3, h4, h5, h6").forEach((child) => {
      const childText = child.innerText || child.textContent || "";
      if (!childText.trim()) return;
      const childRatio = getRTLRatio(childText);
      if (childRatio >= MIN_RTL_RATIO) {
        child.setAttribute("dir", "rtl");
        child.classList.add("geekrtl-rtl");
      } else {
        child.setAttribute("dir", "auto");
      }
    });
  }

  // ── Input/Textarea RTL fixer ──────────────────────────────
  function fixInput(el) {
    el.addEventListener("input", () => {
      const text = el.value || el.innerText || el.textContent || "";
      if (!text.trim()) {
        el.setAttribute("dir", "auto");
        return;
      }
      const ratio = getRTLRatio(text);
      if (ratio >= MIN_RTL_RATIO) {
        el.setAttribute("dir", "rtl");
      } else {
        el.setAttribute("dir", "ltr");
      }
    });
    // Set initial dir on attach
    el.setAttribute("dir", "auto");
  }

  function attachInputFixers() {
    if (!inputSelectors.length) return;
    inputSelectors.forEach((sel) => {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          if (!el.dataset.geekrtlInput) {
            el.dataset.geekrtlInput = "1";
            fixInput(el);
          }
        });
      } catch (_) {}
    });
  }

  function removeInputFixes() {
    document.querySelectorAll("[data-geekrtl-input]").forEach((el) => {
      el.removeAttribute("dir");
      delete el.dataset.geekrtlInput;
    });
  }

  // ── Scan all matched elements ─────────────────────────────
  function scanAll() {
    if (!siteSelectors.length) return;
    siteSelectors.forEach((sel) => {
      try {
        document.querySelectorAll(sel).forEach(fixElement);
      } catch (_) {}
    });
  }

  // ── MutationObserver — watch for new messages ─────────────
  let observer = null;

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          // Check the node itself
          if (siteSelectors.some((s) => node.matches?.(s))) fixElement(node);
          // Check children
          siteSelectors.forEach((sel) => {
            try {
              node.querySelectorAll?.(sel).forEach(fixElement);
            } catch (_) {}
          });
          // Check for new input elements
          inputSelectors.forEach((sel) => {
            try {
              const inputs = node.matches?.(sel) ? [node] : [];
              const childInputs = node.querySelectorAll?.(sel) || [];
              [...inputs, ...childInputs].forEach((el) => {
                if (!el.dataset.geekrtlInput) {
                  el.dataset.geekrtlInput = "1";
                  fixInput(el);
                }
              });
            } catch (_) {}
          });
        }
        // Also re-check changed nodes (streaming text updates)
        if (mutation.type === "characterData" || mutation.type === "childList") {
          let target = mutation.target;
          if (target.nodeType === 3) target = target.parentElement;
          if (!target) continue;
          const closest = siteSelectors
            .map((s) => { try { return target.closest(s); } catch { return null; } })
            .find(Boolean);
          if (closest) {
            delete closest.dataset.geekrtlFixed; // allow re-fix on stream update
            fixElement(closest);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ── Remove all fixes ──────────────────────────────────────
  function removeAllFixes() {
    document.querySelectorAll("[data-geekrtl-fixed]").forEach((el) => {
      el.removeAttribute("dir");
      el.classList.remove("geekrtl-rtl", "geekrtl-auto");
      delete el.dataset.geekrtlFixed;
    });
    document.querySelectorAll(".geekrtl-rtl, .geekrtl-auto").forEach((el) => {
      el.removeAttribute("dir");
      el.classList.remove("geekrtl-rtl", "geekrtl-auto");
    });
  }

  // ── Listen for toggle from popup ──────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "GEEKRTL_TOGGLE") {
      if (msg.enabled) {
        scanAll();
        attachInputFixers();
        startObserver();
      } else {
        stopObserver();
        removeAllFixes();
        removeInputFixes();
      }
    }
  });

  // ── Init ──────────────────────────────────────────────────
  const enabled = await isEnabled();
  if (enabled) {
    // Wait a moment for the page to render initial messages
    setTimeout(() => {
      scanAll();
      attachInputFixers();
      startObserver();
    }, 1200);
  }
})();
