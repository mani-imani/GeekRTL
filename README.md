<p align="center">
  <img src="icons/geekrtl-icon-128.png" width="96" height="96" alt="GeekRTL icon">
</p>

<h1 align="center">GeekRTL</h1>

<p align="center">A Chrome extension that shows Persian and Arabic text right-to-left on AI chat platforms.</p>
<p align="center" dir="rtl">افزونه‌ی کروم برای نمایش درست و راست‌به‌چپ متن فارسی و عربی در چت‌بات‌های هوش مصنوعی.</p>

<p align="center"><a href="https://mani-imani.github.io/GeekRTL/"><b>mani-imani.github.io/GeekRTL</b></a></p>
<p align="center"><a href="#english">English</a> · <a href="#فارسی">فارسی</a> · <code>v2.0.0</code></p>

---

## English

### What it does
AI chat platforms show Persian and Arabic answers left-to-right, so lines start on the wrong side and mixed Persian–English text gets jumbled. GeekRTL detects Persian and Arabic text in each message and gives it the right direction, alignment and font. Code blocks stay left-to-right. The prompt box also switches direction as you type.

**Supported platforms:** Claude · ChatGPT · DeepSeek · Gemini · Microsoft Copilot · Grok

### Install
GeekRTL is not on the Chrome Web Store yet, so install it in developer mode:
1. Download the latest version from [Releases](https://github.com/mani-imani/GeekRTL/releases) (or **Code → Download ZIP**) and extract it.
2. Open `chrome://extensions/` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `GeekRTL` folder.

### Use
Open one of the supported platforms and write in Persian. The toolbar popup has an on/off switch for all supported sites, shows whether the current page is supported, and has a System / Light / Dark theme switch.

### How it works
- Each message block gets `dir="rtl"` when at least 30% of its letters are Persian or Arabic, and `dir="auto"` when the text is mixed.
- A `MutationObserver` follows new and streaming messages; updates are batched once per frame.
- Fonts (Vazirmatn, JetBrains Mono) are bundled, so nothing loads from the internet.
- Permissions: `storage` (your settings) and `activeTab` (to tell you whether the open page is supported). No data leaves your browser.

### Add a site
Add an entry to `sites/sites.json`:
```json
{ "name": "YourAI", "host": "yourai.com", "selectors": [".message"], "inputSelectors": ["textarea"] }
```
then add `https://yourai.com/*` to both `matches` lists in `manifest.json`.

### Project structure
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
├── icons/               icon and wordmark
└── docs/                product page (GitHub Pages)
```

### Version
`v2.0.0` · see [CHANGELOG.md](CHANGELOG.md).

### License
MIT, see [LICENSE](LICENSE). Fonts under the SIL OFL; product-page icons from Bootstrap Icons (MIT).

---

<div dir="rtl">

## فارسی

### چه کاری می‌کند
چت‌بات‌های هوش مصنوعی پاسخ‌های فارسی و عربی را چپ‌به‌راست نشان می‌دهند. خط‌ها از سمت اشتباه شروع می‌شوند و متن‌های مخلوط فارسی و انگلیسی به هم می‌ریزند. GeekRTL متن فارسی و عربی هر پیام را تشخیص می‌دهد و جهت، چینش و فونت درست را به آن می‌دهد. بلوک‌های کد چپ‌به‌راست می‌مانند. جهت کادر نوشتن پرامپت هم هم‌زمان با تایپ کردن عوض می‌شود.

**سایت‌های پشتیبانی‌شده:** <bdi>Claude · ChatGPT · DeepSeek · Gemini · Microsoft Copilot · Grok</bdi>

### نصب
GeekRTL هنوز در Chrome Web Store منتشر نشده است؛ پس آن را در حالت توسعه‌دهنده نصب کنید:
1. تازه‌ترین نسخه را از بخش [Releases](https://github.com/mani-imani/GeekRTL/releases) (یا از <bdi>Code → Download ZIP</bdi>) دریافت کنید و از حالت فشرده خارج کنید.
2. صفحه‌ی <code dir="ltr">chrome&#58;//extensions/</code> را باز کنید و <bdi>Developer mode</bdi> را روشن کنید.
3. روی <bdi>Load unpacked</bdi> بزنید و پوشه‌ی <bdi>GeekRTL</bdi> را انتخاب کنید.

راهنمای گام‌به‌گام با جزئیات بیشتر: [INSTALL.md](INSTALL.md)

### استفاده
یکی از سایت‌های پشتیبانی‌شده را باز کنید و فارسی بنویسید. پنجره‌ی افزونه یک کلید روشن و خاموش برای همه‌ی سایت‌های پشتیبانی‌شده دارد، نشان می‌دهد که صفحه‌ی فعلی پشتیبانی می‌شود یا نه، و پوسته‌ی سیستم، روشن یا تیره را انتخاب می‌کند.

### چطور کار می‌کند
- هر پیامی که دست‌کم ۳۰ درصد حروفش فارسی یا عربی باشد <code dir="ltr">dir="rtl"</code> می‌گیرد و متن مخلوط <code dir="ltr">dir="auto"</code>.
- یک <code dir="ltr">MutationObserver</code> پیام‌های تازه و پاسخ‌های در حال نوشته شدن را دنبال می‌کند و تغییرها در هر فریم یک بار اعمال می‌شوند.
- فونت‌ها (<bdi>Vazirmatn</bdi> و <bdi>JetBrains Mono</bdi>) همراه افزونه‌اند و چیزی از اینترنت بارگذاری نمی‌شود.
- دسترسی‌ها: <code dir="ltr">storage</code> برای ذخیره‌ی تنظیمات و <code dir="ltr">activeTab</code> برای این‌که بگوید صفحه‌ی باز پشتیبانی می‌شود یا نه. هیچ داده‌ای از مرورگر شما بیرون نمی‌رود.

### افزودن یک سایت
یک مورد به <code dir="ltr">sites/sites.json</code> اضافه کنید (نمونه در بخش انگلیسی)، سپس <code dir="ltr">https&#58;//yourai.com/*</code> را به هر دو فهرست <code dir="ltr">matches</code> در <code dir="ltr">manifest.json</code> بیفزایید.

### ساختار پروژه
<div dir="ltr">

```
GeekRTL/
├── manifest.json        Manifest V3
├── content/
│   ├── rtl-fixer.js     تشخیص و اصلاح جهت متن
│   └── styles.css       استایل راست‌به‌چپ و فونت‌ها
├── sites/sites.json     انتخاب‌گرهای هر سایت
├── popup/               پنجره‌ی افزونه
├── css/geek.css         سیستم طراحی GeekMani
├── fonts/               Vazirmatn و JetBrains Mono (مجوز OFL)
├── icons/               آیکون و wordmark
└── docs/                صفحه‌ی محصول (GitHub Pages)
```

</div>

### نسخه
<code dir="ltr">v2.0.0</code> · تاریخچه در [CHANGELOG.md](CHANGELOG.md).

### مجوز
<bdi>MIT</bdi>؛ فایل [LICENSE](LICENSE) را ببینید. فونت‌ها مجوز <bdi>SIL OFL</bdi> و آیکون‌های صفحه‌ی محصول مجوز <bdi>MIT</bdi> دارند.

</div>

---

<p align="center"><a href="https://github.com/mani-imani"><b>by GeekMani</b></a> · <a href="https://github.com/mani-imani">از گیک‌مانی</a> · <a href="https://maniimani.ir">maniimani.ir</a></p>
