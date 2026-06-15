// GeekRTL — Popup Script

const toggleBtn = document.getElementById("toggleBtn");
const statusDot = document.getElementById("dot");
const statusText = document.getElementById("statusText");

function updateUI(enabled) {
  toggleBtn.checked = enabled;
  if (enabled) {
    statusDot.classList.remove("off");
    statusText.textContent = "فعال — متن‌ها تصحیح می‌شوند";
  } else {
    statusDot.classList.add("off");
    statusText.textContent = "غیرفعال";
  }
}

// Load current state
chrome.storage.sync.get({ geekrtl_enabled: true }, (result) => {
  updateUI(result.geekrtl_enabled);
});

// Toggle handler
toggleBtn.addEventListener("change", () => {
  const enabled = toggleBtn.checked;

  chrome.storage.sync.set({ geekrtl_enabled: enabled }, () => {
    updateUI(enabled);

    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "GEEKRTL_TOGGLE",
          enabled,
        }).catch(() => {
          // Tab might not have content script (non-AI site) — ignore
        });
      }
    });
  });
});
