<p align="center">
  <img src="icons/geekrtl-icon-128.png" width="96" height="96" alt="GeekRTL icon">
</p>

<h1 align="center">GeekRTL</h1>

<p align="center">A Chrome extension that shows Persian and Arabic text right-to-left on AI chat platforms.</p>
<p align="center" dir="rtl">افزونه‌ی کروم برای نمایش درست و راست‌به‌چپ متن فارسی و عربی در چت‌بات‌های هوش مصنوعی.</p>

---

## What it does
AI chat platforms show Persian and Arabic answers left-to-right, so lines start on the wrong side and mixed Persian–English text gets jumbled. GeekRTL detects Persian and Arabic text in each message and gives it the right direction, alignment and font. Code blocks stay left-to-right. The prompt box also switches direction as you type.

**Supported platforms:** Claude · ChatGPT · DeepSeek · Gemini · Microsoft Copilot · Grok

## Install
GeekRTL is not on the Chrome Web Store yet, so install it in developer mode:
1. Download this repository (**Code → Download ZIP**) and extract it.
2. Open `chrome://extensions/` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `GeekRTL` folder.

Step-by-step guide in Persian: [INSTALL.md](INSTALL.md).

## Use
Open one of the supported platforms and write in Persian. The toolbar popup has an on/off switch for all supported sites, shows whether the current page is supported, and has a System / Light / Dark theme switch.

## How it works
- Each message block gets `dir="rtl"` when at least 30% of its letters are Persian or Arabic, and `dir="auto"` when the text is mixed.
- A `MutationObserver` follows new and streaming messages; updates are batched once per frame.
- Fonts (Vazirmatn, JetBrains Mono) are bundled, so nothing loads from the internet.
- Permissions: `storage` (your settings) and `activeTab` (to tell you whether the open page is supported). No data leaves your browser.

## Add a site
Add an entry to `sites/sites.json`:
```json
{ "name": "YourAI", "host": "yourai.com", "selectors": [".message"], "inputSelectors": ["textarea"] }
```
then add `https://yourai.com/*` to both `matches` lists in `manifest.json`.

## Project structure
```
GeekRTL/
├── manifest.json        Manifest V3
├── content/
│   ├── rtl-fixer.js     detection and direction fix
│   └── styles.css       RTL styles and bundled fonts
├── sites/sites.json     selectors per platform
├── popup/               popup.html, popup.js
├── css/geek.css         GeekMani design system (shared by every Geek product)
├── fonts/               Vazirmatn, JetBrains Mono (OFL)
└── icons/               icon and wordmark
```

## Version
`v2.0.0` · see [CHANGELOG.md](CHANGELOG.md).

---

<p align="center"><a href="https://github.com/mani-imani"><b>by GeekMani</b></a> · <a href="https://maniimani.ir">maniimani.ir</a></p>
