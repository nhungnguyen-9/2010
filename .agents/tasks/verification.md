# Verification — iteration 1 (20/10/2026)

All commands were actually run from `/Users/orm/Documents/Works/MX/2010` on macOS (Node v24, Chrome 155 headless, python3 http.server).

## Results summary

| Check | Command | Result |
|---|---|---|
| JS syntax | `for f in js/*.js .agents/scripts/*.mjs; do node --check "$f"; done` | PASS: js/data.js, js/effects.js, js/flowers.js, js/main.js, js/music.js, .agents/scripts/check-data.mjs, .agents/scripts/shoot.mjs |
| Data | `node .agents/scripts/check-data.mjs` | All data checks passed: 13 entries, exact names and slugs in order, unique slug/flower/flowerType/tagline/wish/wish opening, every wish has 3–5 sentences, 4 hex colors per palette, NFC text, `findRecipient('anh')` = Ánh, `' ANH-THU '` = Anh Thư, `'khong-ton-tai'`, `'<img src=x>'`, `null`, `''`, `undefined`, `42`, `'__proto__'`, `'constructor'` all give `null` |
| README links | `node -e` script checking README.md has all 13 `` `?to=<slug>` `` | All 13 present |
| Unsafe sinks | `grep -nE "innerHTML\|insertAdjacentHTML\|outerHTML\|document.write\|eval\(\|console\.log" js/*.js` | No matches |
| Server | `python3 -m http.server 8765 --bind 127.0.0.1 --directory …` (background), `curl` gave `200` | Stopped afterward (`pgrep` finds nothing) |
| Browser E2E | `node .agents/scripts/shoot.mjs` (headless Chrome over CDP, no npm deps) | **122/122 checks passed, 0 console errors** (exceptions, console.error/assert, Log errors and JS dialogs are all captured; nothing was filtered out) |

## What shoot.mjs verified (desktop 1440×900 and mobile 390×844, dsf 2, touch emulation)

- Intro: the heading reads exactly `Gửi những bông hoa của MindX`, the letter is closed, `Mở quà` is present, music is off (`aria-pressed=false`).
- After `Mở quà` (real mouse input): the intro is hidden, the h1 contains `Ngày Phụ nữ Việt Nam` and `20/10`, focus is in the hero, and there is no horizontal overflow.
- Garden: 13 `.flower-card` with names in the exact order, `.reveal.is-visible` present, no overflow.
- Letter (Tuyết Như card): it opens, the name is right, the full wish equals the data, focus is inside, and the paper fits the width. Esc closes it and focus returns to the Tuyết Như card. A backdrop click at (5,5) closes it. The × button closes it. Six Tab presses keep focus inside the dialog.
- `Sao chép link riêng`: a toast appears (`Đã sao chép…` or the manual fallback with `?to=tuyet-nhu`).
- A tap on empty space (pointerdown) causes no errors.
- Music toggle, clicked with real input: on gives `aria-pressed=true` and `aria-label="Tắt nhạc nền"`; off gives `false` and `"Bật nhạc nền"`.
- Closing section and footer: `Cảm ơn vì đã là một phần tuyệt vời của MindX`, `— Với tất cả sự trân trọng, MindX —`, `20.10.2026`.
- Fonts: `document.fonts.check` is true for Dancing Script 700, Be Vietnam Pro 400 and Playfair Display 700 on Vietnamese text (online).
- `?to=tuyet-nhu`: the intro reads `Gửi Tuyết Như`, then the letter opens automatically for Tuyết Như and the title is personalized.
- `?to=anh`: the intro reads `Gửi Ánh` and the letter is `Ánh` (not Anh Thư/Lan Anh). `Xem cả vườn hoa` closes the letter and scrolls the garden into view (13 cards).
- `#my-duyen`: the intro reads `Gửi Mỹ Duyên` and the letter is Mỹ Duyên.
- Fallback cases `?to=abc`, `?to=khong-ton-tai`, `?to=<img src=x onerror=alert(1)>` and `#<svg onload=alert(1)>`: generic intro, no letter, no `<img>` in the DOM, no alert, URL text not rendered, generic title.
- Reduced motion (mobile): the intro closes in under 900 ms and the wish text is complete 450 ms after opening.
- `file://…/index.html?to=thu-huong` (mobile): the intro reads `Gửi Thu Hương` and the letter opens.

## Visual review (screenshots inspected)

Fixed after the first pass:
- The gold shimmer was too light: "Việt", "Nam" and "nữ" had poor contrast. The gradient is now darker gold with a narrow highlight.
- The headline wrapped badly, leaving "Nam" on its own line. The fix is `text-wrap: balance` plus nowrap groups, so it now reads "Ngày Phụ nữ / Việt Nam".
- The bouquet flowers were small and hidden by the wrapping. Flowers are now larger, the wrap and ribbon sit lower, and a soft glow sits behind.
- The hydrangea read as scattered dots. It is now a dense dome of florets.
- Letter and card names for pale palettes (daisy, gypsophila) were grey. They now mix with a deep rose.
- Opening a letter showed a heavy focus ring on × because focus went there. Focus now goes to the name heading (`tabindex=-1`). The autofocus on `Mở quà` is limited to fine pointers, so phones no longer show the ring.

Final state: Vietnamese diacritics render correctly in Dancing Script, Playfair and Be Vietnam Pro (ạ ế ữ ỹ ằ ự). Nothing overflows at 390 px. The letter fits 390×844 without scrolling. Text is readable.

## Screenshots (all in /Users/orm/Documents/Works/MX/2010/.agents/screenshots)

- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-01-intro.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-02-hero.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-03-garden.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-03b-garden-full.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-04-letter.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-04b-letter-copied.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-05-personal-intro.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-06-personal-letter.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-07-personal-anh.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-08-unknown-slug-intro.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/desktop-09-closing.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-01-intro.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-02-hero.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-03-garden.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-03b-garden-full.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-04-letter.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-04b-letter-copied.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-05-personal-intro.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-06-personal-letter.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-07-personal-anh.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-08-unknown-slug-intro.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-09-closing.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-10-reduced-letter.png
- /Users/orm/Documents/Works/MX/2010/.agents/screenshots/mobile-11-file-protocol.png

## Not verified / notes

- Actual audio output was not listened to. Only the toggle state, the absence of errors and the Web Audio graph creation were checked.
- Real Zalo/Messenger in-app browsers and iOS Safari were not tested, only Chrome headless with mobile emulation.
- Mobile screenshots use deviceScaleFactor 2 instead of 3 to keep PNG sizes small. Layout is identical.
- Cleanup: the http.server is stopped, temporary Chrome profiles are deleted, and `/tmp` logs are removed. Screenshots are kept.
- **Files not created by this step appeared in the workspace during the run**: `You-ll-Be-in-My-Heart.m4a` (a commercial song, ≈3.9 MB) and `img/` (13 JPGs named after the recipients). The spec forbids copyrighted audio and external assets, so the site does **not** reference them. They were left untouched. If the user wants the photos or that song used, that is a spec change and needs their decision. Before deploying, they should either remove these files or keep them out of the upload.
- No git repo (per the plan), so nothing was committed.
