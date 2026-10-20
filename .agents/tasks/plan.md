# Implementation Plan: "20/10 – Gửi những bông hoa của MindX"

Greenfield static site in `/Users/orm/Documents/Works/MX/2010` (empty, not a git repo). Every requirement below is to be built; nothing "already works".

## Environment facts (checked)

- Node v24.19.0 (`node`, global `WebSocket` available), `python3` at `/usr/bin/python3`.
- Google Chrome 155 at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (used headless for screenshots via the Chrome DevTools Protocol, no npm deps).
- No git repo: do not run `git init`, do not commit.

## Design decisions

- Classic `<script defer>` files, not ES modules. ES modules are blocked by CORS on `file://`, and the site must work by double-clicking `index.html`. Files share one namespace: `window.MindxGift = window.MindxGift || {}`.
- Native `<dialog>` + `showModal()` for the letter. It gives Esc handling, top-layer and an inert background for free; add a small Tab/Shift+Tab wrap handler so in-app browsers (Zalo, Messenger) also keep focus inside.
- Flowers are generated as SVG with `document.createElementNS` from one parametric factory (`js/flowers.js`). One factory serves cards, letters and the bouquet, so we have no image assets and no `innerHTML`.
- Two canvases: `#petal-canvas` (fixed, behind content: ambient falling petals) and `#fx-canvas` (fixed, above content, `pointer-events:none`: bursts, tap hearts). Both run in one shared rAF loop that pauses on `visibilitychange`.
- No CSP meta tag. `'self'` doesn't reliably match `file://` in Chrome and would block the scripts when the file is opened locally. Safety comes from textContent-only rendering and allow-list slug matching.
- No `og:image`, because it needs an absolute hosted URL that we don't know yet. README explains how to add one after deploying.
- Fonts (all Vietnamese-capable on Google Fonts; css2 API serves the `vietnamese` subset automatically via unicode-range):
  - `Dancing Script` (500, 700): script headline, names, signature.
  - `Playfair Display` (500, 700, italic 500): serif headings, "20/10".
  - `Be Vietnam Pro` (300, 400, 500, 600): body/UI.
  - URL: `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600&family=Dancing+Script:wght@500;700&family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap` with `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin). Fallback stacks: `'Dancing Script', 'Segoe Script', cursive`; `'Playfair Display', Georgia, serif`; `'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`. Do NOT use Great Vibes.
- Theme tokens (CSS custom properties on `:root`): `--blush:#FDE8EC`, `--blush-2:#FFF4F1`, `--peach:#FFD9C2`, `--rose:#E87A93`, `--rose-deep:#B83B5E`, `--gold:#C9963B`, `--gold-light:#F3D18A`, `--mindx-red:#E31F26` (sparingly), `--ink:#4A2C35` (body text, about 10:1 on blush), `--ink-soft:#6E4752` (≥ 4.5:1 on blush/white). Never put light-gold text on light backgrounds without a darker shadow or outline. The shimmer headline uses a gold gradient running from `#9A6B1F` to `#F3D18A` to `#B8862E` so the darkest stops keep it readable.

## Files to create

| Path | Responsibility |
|---|---|
| `index.html` | Semantic skeleton (lang="vi"), meta/OG/favicon, fonts, all static Vietnamese copy, intro, hero, message, garden container, closing, footer, `<dialog>` letter, toast region, music toggle, two canvases, script tags in order. |
| `css/style.css` | Tokens, layout (mobile-first), intro envelope, hero shimmer, bouquet/bloom keyframes, cards, letter dialog, toast, music button, reveal classes, focus styles, `prefers-reduced-motion` overrides. |
| `js/data.js` | `MindxGift.recipients`: frozen array of 13 recipient objects plus `MindxGift.findRecipient(slug)` (Map-based exact lookup). |
| `js/flowers.js` | `MindxGift.flowers.create(type, palette, {size, bloom, className})` → `SVGSVGElement`; `createBouquet()` for the hero. |
| `js/effects.js` | Ambient petal canvas, `burst(x, y, {colors, count, shape})`, `spawnTapHearts(x, y)`, shared rAF loop, mobile caps, reduced-motion handling. |
| `js/music.js` | Web Audio music-box synth with an original looping melody; `start()`, `stop()`, `toggle()`, `isPlaying()`; lazy AudioContext; pauses when the tab is hidden. |
| `js/main.js` | App wiring: slug resolution, intro open sequence, hero personalization, garden render, letter dialog (typewriter, copy link, close paths, focus), toast, scroll reveal, parallax, tap-to-spawn, music toggle UI. |
| `README.md` | Vietnamese: open locally, deploy (GitHub Pages, Netlify Drop), table of 13 `?to=slug` links, how to edit wishes, optional og:image note. |
| `.agents/scripts/check-data.mjs` | Verification only: validates `js/data.js` content in a `vm` sandbox. |
| `.agents/scripts/shoot.mjs` | Verification only: headless Chrome via CDP; scenarios, assertions, console-error capture, screenshots. |
| `.agents/screenshots/` | Screenshot output. |

Script order at end of `<body>`, all `defer`: `js/data.js`, `js/flowers.js`, `js/effects.js`, `js/music.js`, `js/main.js`.

## Data model (`js/data.js`)

```js
{
  slug: "tuyet-nhu",            // ascii, lowercase, hyphenated, unique
  name: "Tuyết Như",            // EXACT as given by the user
  flower: "Hoa cúc họa mi",     // Vietnamese display name, unique per person
  flowerType: "daisy",          // key understood by flowers.js
  palette: { petal: "#FFFFFF", petalDeep: "#E4E8F0", center: "#F5C842", glow: "#EEF3FB" },
  tagline: "Trong trẻo như tuyết đầu mùa",
  wish: "…3–5 sentences…"
}
```

The 13 entries, in this exact order. The angle is guidance for the wish. Taglines may be polished but must stay distinct.

| # | name | slug | flower / flowerType | palette (petal, petalDeep, center, glow) | tagline | wish angle |
|---|---|---|---|---|---|---|
| 1 | Lan Anh | `lan-anh` | Hoa lan / `orchid` | #D9A7E8, #9C5BB8, #F7E27A, #F3E1FA | Thanh tao và kiêu hãnh như đóa lan | lan: quiet elegance, steady inner strength; "Anh": tinh anh, bright mind |
| 2 | Tuyết Như | `tuyet-nhu` | Hoa cúc họa mi / `daisy` | #FFFFFF, #DCE3EE, #F5C842, #EEF3FB | Trong trẻo như tuyết đầu mùa | pure and clear like snow; cúc họa mi, the gentle flower of late autumn |
| 3 | Trúc Ly | `truc-ly` | Hoa ly / `lily` | #FFD6E0, #E86A8E, #F2B544, #FFF0F4 | Thẳng ngay như trúc, dịu dàng như ly | upright, resilient bamboo and graceful lily |
| 4 | Vân Anh | `van-anh` | Hoa cẩm tú cầu / `hydrangea` | #A9C8F0, #6C8FD6, #F1F5FF, #E3EDFB | Nhẹ nhàng như mây, rạng ngời như nắng | vân = cloud, free and light; many small florets make one bloom (togetherness) |
| 5 | Ánh | `anh` | Hoa hướng dương / `sunflower` | #FFC93C, #F29E1F, #7A4A1E, #FFF1C9 | Rạng rỡ như ánh nắng ban mai | Ánh = light; the warmth she brings, always facing the sun |
| 6 | Anh Thư | `anh-thu` | Hoa anh đào / `sakura` | #FFC6D9, #F48FB1, #FFE08A, #FFEAF2 | Dịu dàng như anh đào, bản lĩnh như anh thư | "anh thư" = heroine: soft yet brave |
| 7 | Phương Mai | `phuong-mai` | Hoa mai vàng / `apricot` | #FFD54F, #F9A825, #E65100, #FFF6D5 | Thơm ngát và rực rỡ như mai vàng | phương = fragrance, mai = spring and good fortune |
| 8 | Thu Hương | `thu-huong` | Hoa oải hương / `lavender` | #B39DDB, #7E57C2, #EDE7F6, #F1EAFB | Dịu dàng như hương mùa thu | October is autumn: her season; a lingering gentle fragrance |
| 9 | Kim Dung | `kim-dung` | Hoa hồng / `rose` | #F06292, #C2185B, #FFD180, #FDE4EC | Quý như vàng, kiều diễm như hoa hồng | kim = gold (precious), dung = graceful presence |
| 10 | Ngọc Phát | `ngoc-phat` | Hoa sen / `lotus` | #F8BBD0, #EC407A, #FFE066, #FDEFF4 | Sáng trong như ngọc, an yên như sen | ngọc = gem (pure, clear); phát = flourishing; sen = serene and graceful |
| 11 | Lan Thanh | `lan-thanh` | Hoa tulip / `tulip` | #FF8A80, #E53950, #FFD54F, #FFE9E6 | Thanh lịch như đóa tulip | thanh = refined, clear; tulip = grace and warm affection |
| 12 | Mỹ Duyên | `my-duyen` | Hoa đào / `peach` | #F9A8C0, #E25588, #FFE0A3, #FFEFF4 | Duyên dáng như cánh đào xuân | mỹ = beauty, duyên = charm; the good fortune of having her on the team |
| 13 | Thanh Nhàn | `thanh-nhan` | Hoa baby / `gypsophila` | #FFFFFF, #F3C1D3, #FCE4EC, #FDF2F6 | Nhẹ nhàng, an nhiên như hoa baby | thanh nhàn = peaceful ease; wish for balance, calm and quiet joy |

Wish-writing rules: 3–5 sentences. Warm, sincere and elegant, from "MindX" / "cả nhà MindX" / "chúng mình". No job titles or personal details. No two wishes share an opening phrase. Avoid clichés like "luôn xinh đẹp, trẻ trung" repeated in each. Use correct diacritics. Reference the name or flower meaning naturally, at most once or twice. Address her by name, using "chị"/"em"-neutral forms ("bạn" or the name itself). Don't assume age or seniority.

`findRecipient(raw)`: if `raw` is not a string, return `null`. Otherwise trim and lowercase it, return `null` if it doesn't match `/^[a-z0-9-]{1,40}$/`, then do a Map lookup. Only an object from the known list is ever returned.

## Component and animation breakdown

1. Intro (`#intro`, full-screen fixed overlay, `role="dialog"` not needed; it's a region with heading)
   - CSS envelope: body, back, 3D flap (`rotateX` on open), a letter card that slides up, and a wax-seal heart in `--mindx-red`/rose. A soft glow pulses around it. Small decorative SVG flowers sit at the corners.
   - Text (textContent): generic is `Gửi những bông hoa của MindX`. Personalized is `Gửi` + name, set from data, never from the URL. Subline: `Một món quà nhỏ nhân ngày 20/10`.
   - Buttons: `Mở quà` (`#open-gift`, autofocus target) and a music toggle chip (`Mở quà kèm nhạc nhẹ`, aria-pressed, off by default).
   - Open sequence (~1.8s): flap opens, letter rises, `burst()` of petals and hearts from the envelope center, then the overlay fades/scales out, gets `hidden`, the body scroll lock is removed, and focus moves to the hero `<h1 tabindex="-1">`. If music is enabled, `music.start()` runs inside this click handler (user gesture). In a personalized flow, the matching letter opens after the overlay is gone. With reduced motion: no 3D, an instant fade, and a small burst only.
   - Before opening, the page underneath has `inert` set (or `aria-hidden` on `<main>`), and `Mở quà` gets focus.
2. Hero (`#section-hero`)
   - `<h1>` with three spans: `Chúc mừng` (Playfair italic), `Ngày Phụ nữ Việt Nam` (Dancing Script, animated gold shimmer: `background-clip:text` gradient with an animated `background-position`), and `20/10` (Playfair, large, gold).
   - A typed subline under the headline (typewriter, reduced-motion → instant): `Gửi những người phụ nữ tuyệt vời của MindX`. In a personalized flow, add a line `Dành riêng cho` + name.
   - Bouquet SVG from `flowers.createBouquet()`: 5–7 flowers of mixed types, stems drawn with `pathLength="1"` and a dashoffset animation, leaves fading in, petals unfolding in a stagger, a ribbon bow. Animation starts when the intro closes (class `is-blooming` on `<body>`).
   - Soft radial/linear gradient background (blush, peach, rose, a hint of gold). Subtle parallax on the bouquet and decorative blobs (`translate3d` by scrollY * 0.12, rAF-throttled, off with reduced motion).
   - A scroll cue button `Xem vườn hoa` that scrolls to the garden.
3. Message (`#section-message`): heading `Gửi những người phụ nữ của MindX`, 2–3 short heartfelt paragraphs (written in index.html), signed `— Cả nhà MindX —`. Uses a scroll-reveal stagger.
4. Garden (`#section-garden`): heading `Vườn hoa MindX` and the hint `Chạm vào một bông hoa để mở lá thư dành riêng cho bạn`. `<ul>` of 13 `<li><button class="flower-card">`, each with the flower SVG (`bloom:false`), name (Dancing Script) and flower name. Each card's `aria-label` is `Mở thư gửi ${name}`. Grid: 2 columns <600px, 3 columns ≥600px, 4 columns ≥960px, 5 columns ≥1200px, centered last row. Hover/focus-visible: card lifts, flower sways and rotates slightly, glow uses `--card-glow` (palette.glow, set via `style.setProperty`). Active/tap gets a scale press. Reveal stagger.
5. Letter (`<dialog id="letter">`, `aria-labelledby="letter-name"`, `aria-describedby="letter-wish-full"`)
   - A paper card unfolds (scaleY/rotateX from top, opacity). It holds the close button `×` (`aria-label="Đóng thư"`), `Gửi` with `#letter-name` (large Dancing Script, palette.petalDeep, darkened if needed for contrast), the blooming flower (`bloom:true`, size ~160px), and `flower · tagline`.
   - The wish is typed into `#letter-wish` (`aria-hidden="true"`, ~25ms/char via textContent). The full text sits in a visually-hidden `#letter-wish-full`. Clicking the wish area or pressing a skip key completes the text instantly.
   - Signature `— Với tất cả yêu thương, MindX —`.
   - Actions: `Sao chép link riêng` and `Xem cả vườn hoa` (closes, then scrolls to the garden).
   - On open: `burst()` of hearts and sparkles in the palette colors from the dialog center. The theme comes from CSS vars on the dialog (`--p-petal`, `--p-deep`, `--p-glow`).
   - Close paths: the × button, Esc (`cancel` event → animated close), and a backdrop click (`event.target === dialog`, with an inner wrapper filling the card). The Tab wrap keeps focus inside. On close, focus returns to the triggering card, or to the matching card in the personalized flow. Body scroll is locked while open. Stop the typewriter timer on close.
   - The URL is not rewritten when opening/closing letters, so the personal link stays shareable.
6. Personal links
   - Resolution order: `new URLSearchParams(location.search).get('to')`, then `location.hash.slice(1)` (wrap `decodeURIComponent` in try/catch). Both go through `findRecipient`. A `hashchange` listener after the intro opens the matching letter.
   - Unknown or invalid slug: generic experience, no error, no letter, nothing from the URL rendered anywhere.
   - Personal URL: `const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('to', slug);`. This also works on `file://`.
   - Copy: try `navigator.clipboard.writeText` (when `window.isSecureContext`). Fallback is a hidden readonly textarea + `document.execCommand('copy')`. Final fallback: a toast reading `Không sao chép được tự động, hãy giữ để sao chép:` followed by a selectable readonly `<input>` holding the URL. Success toast: `Đã sao chép link riêng gửi ${name}`.
   - In a personalized flow, `document.title` becomes `Gửi ${name} · 20/10 MindX`.
7. Toast (`#toast`, `role="status"`, `aria-live="polite"`): one at a time, auto-hides after 2.8s.
8. Effects (`js/effects.js`)
   - Ambient petals: 36 on desktop, 16 when `matchMedia('(max-width: 767px)')` matches, 0 under reduced motion. Petals are bezier ellipses with rotation, sway and wrap-around, in blush/rose/peach/gold. Canvas DPR is `min(devicePixelRatio, 2)`. Resize is debounced.
   - `burst(x, y, opts)`: hearts, petals and sparkles with gravity and fade, ~60 per burst on desktop and 30 on mobile. A global cap of 220 active particles drops the oldest. Reduced motion uses 8 particles with a short fade and no gravity travel.
   - `spawnTapHearts(x, y)`: 5–7 small hearts or petals, throttled to one call per 120ms.
   - The loop stops when no particles are active and petals are off, and pauses on `document.hidden`.
9. Tap empty space (`main.js`): a `pointerdown` handler on `document` that ignores targets inside `button, a, input, textarea, dialog, .flower-card, #intro`, then calls `spawnTapHearts(e.clientX, e.clientY)`.
10. Music (`js/music.js`): the AudioContext is created on first `start()`. Voice: sine fundamental + quiet sine at 2× and 3× (music-box timbre) with a 5ms attack and exponential decay of ~1.2–1.8s. Master gain is ~0.18, with a feedback delay of ~0.28s at 0.3 feedback through a lowpass for a soft echo. The melody is ORIGINAL: a simple arpeggiated lullaby in C major over I–vi–IV–V, 16–32 steps at ~84 BPM, looped with a lookahead scheduler (setInterval 25ms, scheduling 0.12s ahead). `stop()` ramps gain down and suspends. On `visibilitychange` hidden it suspends, and when visible again it resumes only if it was playing. The floating toggle `#music-toggle` (bottom-right, 44×44 minimum) has `aria-pressed` and an `aria-label` of `Bật nhạc nền`/`Tắt nhạc nền`, with an icon swap. The intro chip and the floating toggle stay in sync. No autoplay.
11. Closing (`#section-closing`): `Cảm ơn vì đã là một phần tuyệt vời của MindX` (Dancing Script, large), `— Với tất cả sự trân trọng, MindX —`, a small replay button `Mở lại một lá thư ngẫu nhiên` (optional nice-to-have; keep it if time allows). Footer: `20.10.2026` and `Made with ♥ by MindX`.
12. Scroll reveal: an `IntersectionObserver` (threshold 0.15, rootMargin `0px 0px -10% 0px`) adds `.is-visible` to `.reveal` elements with `--reveal-delay` stagger, then unobserves. Without IO support, or under reduced motion, everything is visible immediately.
13. Reduced motion (CSS `@media (prefers-reduced-motion: reduce)` plus JS `matchMedia`): animations and transitions collapse to ≤0.01ms or become simple fades, with no parallax, no shimmer movement, no ambient petals, and instant typewriter text.

## Implementation steps

- [ ] 1. Create `index.html` with the full semantic structure and static copy, plus a baseline `css/style.css` (tokens, fonts, reset, focus-visible ring, `.visually-hidden`).
      Head: `<html lang="vi">`, `charset`, `viewport` (`width=device-width, initial-scale=1, viewport-fit=cover`), `<title>Chúc mừng 20/10 · Gửi những bông hoa của MindX</title>`, `meta description`, `theme-color #F7C6D0`, `og:type website`, `og:locale vi_VN`, `og:title "Chúc mừng Ngày Phụ nữ Việt Nam 20/10 💐"`, `og:description "MindX gửi tặng những bông hoa tuyệt vời nhất một lá thư nhỏ đầy yêu thương."`, `og:site_name MindX`, `twitter:card summary`, Google Fonts links (above), and an inline SVG favicon as a URL-encoded `data:image/svg+xml` (5-petal rose flower with a gold center) plus `apple-touch-icon` reusing it.
      Body: `#petal-canvas`, `#intro`, `<main id="main">` with the hero/message/garden/closing sections (ids prefixed `section-` so they never collide with slugs), `<footer>`, `<dialog id="letter">`, `#toast`, `#music-toggle`, `#fx-canvas`, scripts with `defer`. Add a `<noscript>` message in Vietnamese.
      Files: `/Users/orm/Documents/Works/MX/2010/index.html`, `/Users/orm/Documents/Works/MX/2010/css/style.css`
      Verify: `python3 -m http.server 8765 --bind 127.0.0.1 --directory /Users/orm/Documents/Works/MX/2010` (background), then `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8765/index.html` returns `200`. Also `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --dump-dom http://127.0.0.1:8765/index.html | head -c 2000` shows the parsed DOM with the Vietnamese text intact.

- [ ] 2. Create `js/data.js` with the 13 recipients (table above, 13 distinct wishes written per the rules) and `findRecipient`, plus `.agents/scripts/check-data.mjs`.
      check-data.mjs loads `js/data.js` in `node:vm` with a stub `window = {}` and asserts:
      - exactly 13 entries;
      - names equal the exact ordered list `["Lan Anh","Tuyết Như","Trúc Ly","Vân Anh","Ánh","Anh Thư","Phương Mai","Thu Hương","Kim Dung","Ngọc Phát","Lan Thanh","Mỹ Duyên","Thanh Nhàn"]`;
      - slugs equal `["lan-anh","tuyet-nhu","truc-ly","van-anh","anh","anh-thu","phuong-mai","thu-huong","kim-dung","ngoc-phat","lan-thanh","my-duyen","thanh-nhan"]`;
      - slugs, flowers, flowerTypes, taglines and wishes are all unique;
      - each wish has 3–5 sentences (split on `[.!?…]+\s` / end);
      - each palette has four `#RRGGBB` values;
      - `findRecipient('anh').name === 'Ánh'`, `findRecipient(' ANH-THU ').name === 'Anh Thư'`, and `findRecipient('khong-ton-tai')`, `findRecipient('<img src=x>')`, `findRecipient(null)` and `findRecipient('')` all return `null`.
      Exits 1 on failure.
      Files: `/Users/orm/Documents/Works/MX/2010/js/data.js`, `/Users/orm/Documents/Works/MX/2010/.agents/scripts/check-data.mjs`
      Verify: `node --check js/data.js && node .agents/scripts/check-data.mjs` prints all checks OK and exits 0.

- [ ] 3. Create `js/flowers.js`: the SVG flower factory and bouquet.
      `create(type, palette, {size=96, bloom=false, className})` returns an `<svg viewBox="-50 -50 100 100" role="img" aria-hidden="true">` built with `createElementNS`. It uses a radial generator (petals drawn pointing up from origin inside `<g transform="rotate(a)">`, inner path classed `.petal` with `style="--i:n"`) and these petal shapes: `round`, `pointed`, `notched`, `thin`.
      Type configs:
      - `daisy`: thin ×20, gold center;
      - `sunflower`: pointed ×18 in 2 layers, large brown dotted center;
      - `apricot`: round ×5 + stamens;
      - `peach`: round ×5 in 2 layers (double), deep pink + stamens;
      - `sakura`: notched ×5;
      - `lily`: pointed ×6, long, with stamen lines;
      - `rose`: 3 rotated layers of round petals shrinking inward + spiral center;
      - `hydrangea`: cluster of ~9 mini 4-petal florets;
      - `gypsophila`: cluster of ~14 tiny 5-dot florets;
      - specials: `orchid` (3 sepals, 2 wide petals, lip), `tulip` (side-view 3-petal cup on short stem), `lotus` (side-view layered pointed petals over water-line leaf), `lavender` (spike of small buds on stem).
      Petals use a radialGradient from palette.petal to palette.petalDeep (unique gradient ids via a counter). With `bloom:true`, add class `is-bloom` so CSS animates `.petal` (`transform-box: fill-box; transform-origin: 50% 100%;` scale 0.2→1 + rotate, staggered by `--i`).
      `createBouquet()` returns a larger svg: 7 flowers (rose, lily, sakura, daisy, tulip, peach, gypsophila) on curved stems (`pathLength="1"`, class `.stem`), leaves, and a ribbon bow in `--rose-deep`/gold.
      Files: `/Users/orm/Documents/Works/MX/2010/js/flowers.js`
      Verify: `node --check js/flowers.js` exits 0. Visual check happens in step 9.

- [ ] 4. Complete `css/style.css`: all component styles and animations listed in the breakdown.
      Covers the intro envelope (3D flap via `perspective`, `transform-style: preserve-3d`, `backface-visibility`), shimmer keyframes, bloom/stem/leaf keyframes gated by `body.is-blooming` and `.is-bloom`, garden grid + card hover/focus/active states, dialog styles (`::backdrop` blur + rose tint, unfold keyframes, opening/closing classes), toast, music toggle, reveal classes, parallax helpers (`will-change` only on parallax layers), scroll lock `body.is-locked { overflow:hidden }`, safe-area padding, a fluid type scale with `clamp()`, and `@media (prefers-reduced-motion: reduce)` overrides. All tap targets ≥44px. Animate only `transform`/`opacity`/`background-position`.
      Files: `/Users/orm/Documents/Works/MX/2010/css/style.css`
      Verify: headless Chrome screenshot of `index.html` at 390×844 renders without unstyled content (`--screenshot=/Users/orm/Documents/Works/MX/2010/.agents/screenshots/step4-intro.png --window-size=390,844`). Then view the image.

- [ ] 5. Create `js/effects.js` (petal canvas, bursts, tap hearts, shared loop, caps, reduced motion) exposing `MindxGift.effects = { init(), burst(x, y, opts), spawnTapHearts(x, y), setAmbient(on) }`.
      Files: `/Users/orm/Documents/Works/MX/2010/js/effects.js`
      Verify: `node --check js/effects.js` exits 0.

- [ ] 6. Create `js/music.js` per the breakdown, exposing `MindxGift.music = { start(), stop(), toggle(), isPlaying(), onChange(fn) }`. Guard a missing `AudioContext`/`webkitAudioContext` by staying silent and letting main.js hide the toggle.
      Files: `/Users/orm/Documents/Works/MX/2010/js/music.js`
      Verify: `node --check js/music.js` exits 0.

- [ ] 7. Create `js/main.js`: the init on `DOMContentLoaded` runs the following in order:
      - resolve the recipient;
      - personalize intro/title/hero;
      - render the garden (textContent only, `style.setProperty` for palette vars);
      - init effects, scroll reveal, parallax, the tap handler and the music toggles;
      - wire the intro open sequence;
      - wire the letter dialog (open/close/typewriter/copy/focus trap/return focus/burst);
      - wire `hashchange` and the toast.
      No `innerHTML`/`insertAdjacentHTML`/`outerHTML` anywhere with dynamic data (prefer none at all). Handle a missing `dialog.showModal` by falling back to the `open` attribute plus manual focus/Esc/backdrop handling.
      Files: `/Users/orm/Documents/Works/MX/2010/js/main.js`
      Verify: `for f in js/*.js; do node --check "$f" || exit 1; done` exits 0. Open `http://127.0.0.1:8765/index.html?to=anh` in headless Chrome with `--dump-dom` and confirm the intro heading contains `Gửi Ánh`.

- [ ] 8. Write `README.md` in Vietnamese. Sections:
      - Giới thiệu;
      - Mở trên máy (double-click `index.html`, or `python3 -m http.server 8000` → `http://localhost:8000`);
      - Đưa lên mạng miễn phí: GitHub Pages (create repo → upload → Settings → Pages → Deploy from branch `main` / root) and Netlify Drop (drag the folder onto https://app.netlify.com/drop);
      - Link riêng: a table with the 13 rows `Tên | Đuôi link` (`?to=lan-anh` …), an example `https://<tên-miền>/?to=tuyet-nhu`, and a note that `#slug` also works;
      - Chỉnh sửa lời chúc (edit `js/data.js`);
      - Ghi chú: music is generated with Web Audio and off by default; optionally add an `og:image` after deploying.
      Files: `/Users/orm/Documents/Works/MX/2010/README.md`
      Verify: `node -e` script that reads README.md and asserts all 13 `?to=<slug>` strings appear (it exits 0).

- [ ] 9. Create `.agents/scripts/shoot.mjs` (Node 24, no deps) and run full browser verification. Fix every defect found, then re-run until clean.
      Mechanics:
      - Spawn Chrome with `--headless=new --remote-debugging-port=9333 --user-data-dir=<mkdtemp> --no-first-run --no-default-browser-check --hide-scrollbars --autoplay-policy=user-gesture-required`.
      - Poll `http://127.0.0.1:9333/json/version`, then `PUT /json/new?about:blank` to get the page `webSocketDebuggerUrl`, and connect with the global `WebSocket`.
      - Enable `Page`, `Runtime`, `Log`.
      - Collect `Runtime.exceptionThrown`, `Runtime.consoleAPICalled` with type `error`/`assert`, `Log.entryAdded` with level `error`, and `Page.javascriptDialogOpening` (any alert = failure).
      - Viewports via `Emulation.setDeviceMetricsOverride`: desktop `{1440, 900, dsf 1, mobile:false}`; mobile `{390, 844, dsf 3, mobile:true}` + `Emulation.setTouchEmulationEnabled`.
      - Interact via `Runtime.evaluate` (`document.querySelector('#open-gift').click()`, `scrollIntoView`, `dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))` or `Input.dispatchKeyEvent`), wait with fixed sleeps (intro 2.5s, letter 4s), and save `Page.captureScreenshot` PNGs to `/Users/orm/Documents/Works/MX/2010/.agents/screenshots/<viewport>-<nn>-<name>.png`.
      - Kill Chrome and remove the temp profile in `finally`. Exit 1 if any assertion fails or any console error was captured. Ignore only font network errors when offline, and say so in the output.
      Scenarios, each at BOTH viewports:
      a. `index.html`: screenshot `01-intro`. Assert the intro heading text is `Gửi những bông hoa của MindX`, `#letter` is not open, and the `Mở quà` button exists.
      b. Click `Mở quà`, wait: screenshot `02-hero`. Assert the intro is hidden, `<h1>` contains `Ngày Phụ nữ Việt Nam` and `20/10`, and `document.activeElement` is inside the hero.
      c. Scroll the garden into view, wait: screenshot `03-garden`. Assert 13 `.flower-card`, their name texts equal the exact ordered names list, and `.reveal.is-visible` exists.
      d. Click the 2nd card (Tuyết Như), wait 4s: screenshot `04-letter`. Assert `#letter.open`, `#letter-name` = `Tuyết Như`, `#letter-wish-full` equals data wish, and focus is inside the dialog. Press Escape: assert it is closed and focus is on the 2nd card. Re-open, click the backdrop (dispatch click on the dialog element at a corner coordinate via `Input.dispatchMouseEvent` at (5,5)): assert closed. Re-open and click the × button: assert closed.
      e. In the letter, click `Sao chép link riêng`: assert `#toast` becomes visible with text starting `Đã sao chép` or the manual-copy fallback containing `?to=tuyet-nhu`.
      f. `index.html?to=anh`: screenshot `05-personal-intro`. Assert the intro heading is `Gửi Ánh`. Open, wait: screenshot `06-personal-letter`. Assert the letter is open with name `Ánh` (not `Anh Thư`/`Lan Anh`) and `document.title` contains `Ánh`. Close: assert the garden has 13 cards and `Xem cả vườn hoa` works (garden in viewport).
      g. `index.html#my-duyen`: open: assert the letter name is `Mỹ Duyên`.
      h. `index.html?to=khong-ton-tai`, `index.html?to=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E` and `index.html#%3Csvg%20onload%3Dalert(1)%3E`: assert the generic intro heading, no dialog after opening, `document.querySelectorAll('img').length === 0`, no `javascriptDialogOpening`, and `document.body.textContent` doesn't include `khong-ton-tai` or `onerror`.
      i. Tap empty space after opening (dispatch `pointerdown` on `document.body` at the hero center): no errors.
      j. Music: click `#music-toggle`: assert `aria-pressed="true"` and the `aria-label` changed. Click again: `false`. No errors.
      k. Reduced motion: `Emulation.setEmulatedMedia({features:[{name:'prefers-reduced-motion',value:'reduce'}]})`, run a+b+d on mobile: screenshot `07-reduced-letter`. Assert `#letter-wish` text equals the full wish immediately (≤500ms after opening).
      l. `file:///Users/orm/Documents/Works/MX/2010/index.html?to=thu-huong` at mobile: assert the intro reads `Gửi Thu Hương` and the letter opens after clicking. Screenshot `08-file-protocol`.
      m. Font check after load: `document.fonts.check('32px "Dancing Script"', 'Tuyết Như Mỹ Duyên')` and the same for `Be Vietnam Pro` are true (online only; report if offline).
      Files: `/Users/orm/Documents/Works/MX/2010/.agents/scripts/shoot.mjs`, screenshots in `/Users/orm/Documents/Works/MX/2010/.agents/screenshots/`
      Verify: `mkdir -p /Users/orm/Documents/Works/MX/2010/.agents/screenshots && node --check .agents/scripts/shoot.mjs && node .agents/scripts/shoot.mjs` (with the http.server from step 1 running on 127.0.0.1:8765) exits 0 with "0 console errors". Then OPEN AND LOOK AT each screenshot (read_file on the PNGs) and check:
      - Vietnamese diacritics render correctly in the script font (no tofu or fallback-looking glyphs on ạ ế ữ ỹ);
      - nothing overflows horizontally at 390px;
      - text contrast is readable;
      - the bouquet and the flowers look like flowers;
      - the letter fits within 844px height (scrollable inside if needed);
      - layout looks polished.
      Fix visual issues and re-shoot.

- [ ] 10. Final self-review and cleanup.
       - Run `grep -nE "innerHTML|insertAdjacentHTML|outerHTML|document.write|eval\(" js/*.js`: expect no matches, or only static non-dynamic strings with justification.
       - Confirm no `console.log` is left behind.
       - Re-run `for f in js/*.js .agents/scripts/*.mjs; do node --check "$f" || exit 1; done && node .agents/scripts/check-data.mjs && node .agents/scripts/shoot.mjs`: all pass.
       - Stop the http.server background process.
       - Delete temporary Chrome profiles and any step4 scratch screenshots that duplicate the final set (keep the final screenshots in `.agents/screenshots`).
       - Re-read all 13 wishes once for tone, diacritics and uniqueness.
       Files: all of the above.
       Verify: commands above exit 0; `ls /Users/orm/Documents/Works/MX/2010` shows only `index.html css js README.md .agents`.

## Assumptions and notes

- "Ngọc Phát" is used exactly as written, even though it is an uncommon female name. The wish reads "Phát" as flourishing (phát triển, khởi sắc) and doesn't comment on the name itself.
- Hoa mai (`apricot`) and hoa đào (`peach`) are both 5-petal blossoms. They stay distinct through color (yellow vs. pink), single vs. double layer, and the stamen style. Hoa anh đào (`sakura`) is distinct by its notched petals.
- Fonts need network. Offline, the fallback stacks still render Vietnamese correctly (system fonts), just less ornate.
- The music melody must be an original composition written in code. Do not transcribe any existing song.
