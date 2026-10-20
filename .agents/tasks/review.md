# 20/10 gift site for the 13 women of MindX

A static, dependency-free site (HTML, CSS, vanilla JS) for Vietnamese Women's Day. An envelope intro opens into a hero with a gold Dancing Script headline and an SVG bouquet that blooms. Petals fall on a canvas over a shared message, a "Vườn hoa MindX" garden of 13 flower cards and a letter modal that types out each person's wish with a heart/petal burst. `?to=<slug>` (or `#slug`) personalizes the intro and auto-opens that person's letter. The code, the data and the coder's evidence (122/122 headless checks, 24 screenshots at 1440×900 and 390×844) are solid. Visually the result is polished and on-theme. The gap: during the run the user dropped 13 recipient-named photos (`img/*.jpg`) and a song (`You-ll-Be-in-My-Heart.m4a`) into the project. The site ignores both, based on a planner rule ("no image assets") that the user never stated.

Watch for: user-supplied photos and song are unused (confirmed), and the README's Netlify Drop step would publish `.agents/` and those unreferenced files (confirmed).

**Verdict**: NEEDS_CHANGES

## High-level view

The screenshots show the visual layer delivers. The intro envelope with its red seal, the two-line gold script "Ngày Phụ nữ / Việt Nam" over a large rose "20/10", the bouquet and the garden of distinct SVG flowers all look professional at both viewports. Vietnamese diacritics render correctly in all three fonts (ữ, ệ, ỹ, ằ, ướ). On mobile nothing overflows, and the letter fits 390×844.

The content is right. All 13 names and slugs match the request exactly, including `anh` → Ánh as distinct from Lan Anh, Vân Anh and Anh Thư. Every person has a unique flower and a unique wish. The name-meaning wordplay (Vân → mây, Thu Hương → hương mùa thu, Kim → vàng, Mỹ Duyên → duyên, Thanh Nhàn → thanh thản) reads naturally. A few closing formulas repeat across letters, and colleagues will be able to compare them in the shared garden.

The security posture is tight. URL input only resolves through `findRecipient` (type check, trim, lowercase, `^[a-z0-9-]{1,40}$`, then a `Map` lookup), so `__proto__` and markup payloads fall back to the generic page. Every rendered string goes through `textContent` or `setAttribute`. Accessibility is handled with care: native `showModal` plus a Tab wrap, Esc, backdrop and × all close, focus returns to the triggering card, reduced motion is honored in both CSS and JS, and music is off with no autoplay.

What blocks approval is user intent, not code quality. The user added a personal photo for each woman and a specific song mid-run. A site that "gây ấn tượng với người nhận" should most likely show her own photo in her letter and play the song she picked. The coder noticed both files and deliberately left them out on the strength of the plan's self-imposed rule. The README's deploy step would also publish those files and the agent workspace.

<details>
<summary>Issues (6)</summary>

1. **User photos and song unused** (blocking, confirmed). Use `img/*.jpg` as a round portrait in each letter, and optionally on the card, mapped explicitly per slug: `Huong.jpg` → thu-huong, `Thanh.jpg` → lan-thanh, `Nhàn.jpg` → thanh-nhan, `Ánh.jpg` → anh, and so on. Keep the SVG flower as a fallback when an image fails to load. Wire `You-ll-Be-in-My-Heart.m4a` into the music toggle via `<audio preload="none" loop>`: still off by default, started only by user action, with the Web Audio lullaby as fallback if loading or playing fails. Update the README to match.
2. **Netlify Drop publishes the workspace** (blocking, confirmed). The README says "Kéo thả cả thư mục dự án", which uploads `.agents/` (plan, scripts, 24 screenshots) and any unreferenced files. List exactly which files and folders to drag (index.html, css/, js/, img/, the audio file), or tell the user to copy them into a separate folder first. Mention that hosting a commercial song publicly is the user's copyright call.
3. **Repeated closing formulas** (non-blocking, confirmed). "Cảm ơn bạn vì…" closes 4 letters and "Mong mỗi ngày (của bạn / đến với bạn) đều…" closes 3. Vary two or three of these so the letters don't read templated side by side.
4. **Double "Gửi" in Tuyết Như's letter** (non-blocking, confirmed). The letter header already says "Gửi". Her wish opens with "Gửi Tuyết Như, người mang đến…" (a verbless fragment). Start it like the others, e.g. "Tuyết Như thân mến, bạn mang đến…".
5. **Five near-identical pink palettes** (non-blocking, confirmed). Ly, anh đào, sen, đào and the rose are all mid-pink. Push one or two (lily to white/cream, lotus to softer peach) so the garden reads as more varied.
6. **Music toggle label flips while aria-pressed also flips** (non-blocking, confirmed). This announces as "Tắt nhạc nền, pressed". Keep one stable label ("Nhạc nền") with `aria-pressed`, or drop `aria-pressed` and keep the changing label.

</details>

<details>
<summary>Details</summary>

### The user's photos and song sit unused next to a site built without them

`img/` holds 13 small square JPEGs (120–240 px), one per recipient. Some filenames carry full names ("Tuyết Như.jpg", "Lan Anh.jpg"), others only the given name ("Huong.jpg" without a diacritic, "Thanh.jpg", "Nhàn.jpg", "Phát.jpg"). The mapping is still unambiguous: `Thanh.jpg` must be Lan Thanh because Thanh Nhàn has `Nhàn.jpg`, and `Ánh.jpg` is distinct from the two "… Anh.jpg" files. The timestamps (14:08–14:15) fall after the plan was written (13:50) and before the final edits to `index.html`/`main.js` (14:21–14:22). So the files were available while the coder was still working. `verification.md` acknowledges them and says the site "does not reference them" because "the spec forbids copyrighted audio and external assets". That rule comes from the plan (`plan.md` line 15: "we have no image assets"), not from the user. The user's message asks for an impressive site and says nothing against photos or real music. Adding a photo per woman and a specific song mid-run is a clear signal of intent (likely).

The integration should keep the hardening that already exists. Map photos through an explicit field in `data.js`, never derived from URL input. Render them with `createElement('img')`, `alt` set to the name and `decoding="async"`, and fall back to the SVG flower on `error`. Because filenames contain spaces and diacritics, use `encodeURI` on the path or rename the files to the ascii slugs, which is simpler and safer for some static hosts. For the song, `preload="none"` keeps the 3.9 MB file from loading on mobile until the toggle is tapped. Two flows need checking: the existing "Mở quà kèm nhạc nhẹ" chip calls `app.music.start()` inside the click handler, which satisfies autoplay policy, and the `visibilitychange` pause/resume logic in `music.js` needs equivalents for an `<audio>` element. Neither has been verified yet.

### Deploy instructions leak the agent workspace

The GitHub Pages steps correctly list only `index.html`, `css/` and `js/`. The Netlify Drop step says "Kéo thả cả thư mục dự án (chứa `index.html`, `css/`, `js/`) vào trang". A user following that literally uploads the m4a, the photos (today unreferenced but still publicly fetchable) and, likely, `.agents/` with the plan, scripts and screenshots of every letter (confirmed for the visible files; I did not verify whether Netlify Drop skips dot-directories). The README also states "không dùng file nhạc", which will be wrong once the song is wired in.

### Wish copy: strong overall, some repetition

All 13 wishes are grammatical, warm and specific, with correct diacritics. None is copy-paste, and the flower facts are accurate (cúc họa mi in late autumn, cẩm tú cầu as many florets, hướng dương facing the sun). The weak spots are structural. Four letters end on "Cảm ơn bạn vì…" (Lan Anh, Ánh, Lan Thanh, Thanh Nhàn). Three end on "Mong mỗi ngày … đều…" (Tuyết Như, Ngọc Phát, Mỹ Duyên). Two use "Nhân ngày 20/10, … chúc bạn luôn…" and two use "Nhân Ngày Phụ nữ Việt Nam, MindX chúc bạn luôn…". The garden invites opening other people's letters, so the pattern will show. Anh Thư's second sentence is a long three-clause run-on that would read better split in two. Tuyết Như's letter repeats the header "Gửi" in its first words.

### Palette spread in the garden

The flower types are all unique. In the desktop and mobile garden screenshots, though, lily (`#FFD6E0`/`#E86A8E`), sakura, lotus, peach and rose sit in the same mid-pink band, so the middle of the grid reads as one color. Orchid, hydrangea, sunflower, mai vàng and lavender carry the variety. This is polish, not a defect.

### Music toggle semantics

`updateMusicUi` sets `aria-pressed` and also swaps `aria-label` between "Bật nhạc nền" and "Tắt nhạc nền". Screen readers then announce the action label together with a pressed state, which reads as a contradiction. Pick one pattern.

</details>

<details>
<summary>File map</summary>

- `index.html`: intro envelope, hero, message, garden list, closing, footer, `<dialog id="letter">`, music toggle, toast, two canvases; Google Fonts (Be Vietnam Pro, Dancing Script, Playfair Display).
- `css/style.css`: theme tokens, envelope and letter animations, shimmer headline, responsive garden grid (2/3/4/5 columns), reduced-motion overrides.
- `js/data.js`: 13 frozen recipient records (slug, name, flower, palette, tagline, wish) and the allow-list `findRecipient`.
- `js/main.js`: URL personalization, garden render, intro sequence, letter open/close/focus/typing, copy link, reveal, parallax, tap hearts, music UI.
- `js/flowers.js`: parametric SVG flower factory and bouquet (not re-read in full; covered by the coder's grep for unsafe sinks).
- `js/effects.js`: ambient petal and particle burst canvas loop with reduced-motion and mobile scaling.
- `js/music.js`: Web Audio music-box lullaby, lazy context, visibility pause.
- `README.md`: Vietnamese guide with the 13-link table and deploy steps.
- Unreferenced: `img/*.jpg` (13 photos), `You-ll-Be-in-My-Heart.m4a`.

No git repository; the whole workspace was reviewed as the change.

</details>
