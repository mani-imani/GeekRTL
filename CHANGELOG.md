# Changelog

## v2.0.0 · Nov 2026
- New look in the GeekMani product family: navy icon with the green cursor, popup built on `geek.css`, light and dark themes with a System / Light / Dark switch, and the "by GeekMani" signature.
- The popup shows whether the open page is supported and names the platform.
- The on/off switch applies to every open supported tab at once.
- Bundled Vazirmatn and JetBrains Mono fonts are now actually loaded on chat pages (no internet needed).
- Smoother streaming: direction fixes are batched once per frame and use `textContent` instead of `innerText`.
- Fixed: the prompt box kept changing direction after the extension was turned off.
- Fixed: a message that started in Persian and continued in English kept its old direction.
- Toolbar icons are PNG, as Chrome requires.
- Product page in `docs/` (Persian and English) and an MIT `LICENSE` file.

## v1.1.0 · Jun 2026
- Real-time direction for the prompt box (Persian → right-to-left, English → left-to-right).

## v1.0.0 · Jun 2026
- First release: automatic RTL fix for AI answers on Claude, ChatGPT, DeepSeek, Gemini, Copilot and Grok.
