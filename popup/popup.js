// GeekRTL v2 · popup

const toggleInput = document.getElementById("toggleInput");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

// Version always comes from manifest.json, so it never goes stale here.
document.getElementById("version").textContent = "v" + chrome.runtime.getManifest().version;

/* ── Which site is the active tab? ─────────────────────────────── */
// activeTab lets the popup read the URL of the tab it was opened on.
let currentSite = null; // name from sites.json, or null when the page is not supported

async function detectSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const host = new URL(tab?.url || "").hostname;
    const res = await fetch(chrome.runtime.getURL("sites/sites.json"));
    const { sites } = await res.json();
    const site = sites.find((s) => host === s.host || host.endsWith("." + s.host));
    currentSite = site ? site.name : null;
  } catch (_) {
    currentSite = null;
  }
}

/* ── UI ────────────────────────────────────────────────────────── */
function updateUI(enabled) {
  toggleInput.checked = enabled;
  const active = enabled && currentSite;
  statusDot.classList.toggle("active", Boolean(active));
  if (!enabled) statusText.textContent = "خاموش است";
  else if (currentSite) statusText.textContent = `روی ${currentSite} فعال است`;
  else statusText.textContent = "این صفحه جزو سایت‌های پشتیبانی‌شده نیست";
}

(async () => {
  await detectSite();
  chrome.storage.sync.get({ geekrtl_enabled: true }, (r) => updateUI(r.geekrtl_enabled));
})();

/* ── Toggle ────────────────────────────────────────────────────── */
// Saving to storage is enough: every open supported tab listens to storage changes.
toggleInput.addEventListener("change", () => {
  const enabled = toggleInput.checked;
  chrome.storage.sync.set({ geekrtl_enabled: enabled }, () => updateUI(enabled));
});

/* ── Theme switch ──────────────────────────────────────────────── */
const themeSeg = document.getElementById("themeSeg");
const themeKey = "geekrtl_theme";

function applyTheme(value) {
  const root = document.documentElement;
  if (value === "light" || value === "dark") root.setAttribute("data-theme", value);
  else root.removeAttribute("data-theme");
  themeSeg.querySelectorAll("button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === value));
  });
}

chrome.storage.sync.get({ [themeKey]: "" }, (r) => applyTheme(r[themeKey]));

themeSeg.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-theme]");
  if (!btn) return;
  applyTheme(btn.dataset.theme); // "" | "light" | "dark"
  chrome.storage.sync.set({ [themeKey]: btn.dataset.theme });
});
