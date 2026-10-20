# Verification — iteration 3 (20/10/2026): anonymous sender + music on load

Run from the project root (Node v24, headless Chrome, `python3 -m http.server 8765`, stopped afterwards).

- Wording: grep over `index.html js README.md` for `MindX gửi|, MindX —|chúng mình|chúng tôi|cả nhà|gia đình|Từ MindX|Với tất cả|gửi tặng|Kèm bài hát|tập thể` returns 0 matches. MindX now appears only as a place ("những bông hoa của MindX", "ở MindX").
- Signatures: letter `— Từ một người luôn trân trọng bạn —`, message `— Một người giấu tên —`, closing `— Một người giấu tên, mãi trân trọng các bạn —`, footer "Gửi trao bằng cả trái tim, không cần ký tên ♥".
- `node --check` passes on all JS and .mjs files. `check-data.mjs` passes.
- `shoot.mjs` reports **220/220 checks passed, 0 console errors**. It covers:
  - `no-user-gesture-required`: the song plays on load with no click (`paused === false`, `loop === true`, fade to 0.6) and keeps playing through Mở quà.
  - Default policy: paused on load, no errors or unhandled rejections. One tap on an empty spot (mobile), a click, or a key press starts the song. The first click on the vinyl starts it and does not toggle it off.
  - Loop: the track wraps to the start and keeps playing. The `ended` safety net also works with `loop` forced off. `http.server` has no Range support, so the end was reached by playing at 16×, not by `currentTime = duration - 1`.
  - Pausing manually keeps the song paused after later taps and after a tab switch.
  - The existing checks still pass: 13 photos, letters with flower and meaning, `?to=tuyet-nhu`, `?to=anh`, `?to=abc` fallback.
- Screenshots were regenerated (plus `desktop-12-autoplay-intro`). There is no gap where the removed control was.
- Not verified: real iOS, Android, Zalo or Messenger devices. Nobody listened to the audio.

# Verification — iteration 2 (20/10/2026): real song + recipient photos

Everything below was actually run from `/Users/orm/Documents/Works/MX/2010` on macOS (Node v24, Google Chrome headless, python3 http.server).

## Changes covered

- `audio/youll-be-in-my-heart.m4a` (moved from `You-ll-Be-in-My-Heart.m4a`, 3,922,198 B) is played by an `<audio loop playsinline preload="metadata">`. Init switches it to `preload="auto"` plus `load()`. `play()` is called synchronously inside the `Mở quà` click, with a 1.5 s fade-in to 0.6. The Web Audio synth was deleted.
- `img/<slug>.jpg`: 13 photos renamed with `mv` (via `fs.renameSync`, NFC-normalized lookup). They show in garden cards and on the intro stamp for `?to=`. Letters still show the SVG flower plus the new "Ý nghĩa loài hoa" line.
- Flower changes: Thu Hương went from oải hương to **hoa sữa** (`milkflower`), Lan Thanh from tulip to **hoa ngọc lan** (`magnolia`), and Lan Anh's flower is now labeled "Hoa lan hồ điệp". The unused `tulip`/`lavender` builders were removed. The bouquet now uses orchid and magnolia in their place.

## Results

| Check | Command | Result |
|---|---|---|
| JS syntax | `for f in js/*.js .agents/scripts/*.mjs; do node --check "$f"; done` | PASS (all 7 files) |
| Data | `node .agents/scripts/check-data.mjs` | All passed. New checks: unique `flowerMeaning`/`photo`, `photo === img/<slug>.jpg` and the file exists, meaning is an NFC sentence, an SVG builder exists for every `flowerType` |
| Renamed files | `ls img` | Exactly 13 `[a-z-]+.jpg`, no originals left. Sizes 120–240 px, all square |
| README | node script | All 13 `` `?to=<slug>` `` present |
| HTTP | `curl` plus `fetch HEAD` in shoot.mjs | `audio/youll-be-in-my-heart.m4a` returns 200 (3,922,198 B). All 13 `img/*.jpg` return 200 `image/jpeg` |
| Browser E2E | `node .agents/scripts/shoot.mjs` (`--autoplay-policy=user-gesture-required`, real CDP mouse input) | **184/184 checks passed, 0 console errors** |
| Cleanup | `pgrep`, `ls /tmp` | Server stopped, Chrome profiles and temp logs removed |

### New browser checks (desktop 1440×900 and mobile 390×844)
- Before the gesture: the song is paused, `preload=auto`, `loop`, `currentSrc` ends with the audio path, and the dock is hidden. The song chip defaults to `aria-pressed=true`.
- After `Mở quà`: `audio.paused === false`, no media error, volume 0.6 ±0.02, toggle `aria-pressed=true`/`"Tắt nhạc nền"`, dock visible. This passed **without** `no-user-gesture-required`.
- Simulated `visibilitychange` (overriding `document.hidden`): hidden pauses, visible resumes. A song the user paused stays paused after a tab switch. Toggle off then on updates `paused`, `aria-pressed` and `aria-label`.
- Garden: 13 `img.flower-card__photo` with `naturalWidth > 0`, `src=img/<slug>.jpg`, `alt="Ảnh của <Tên>"`, `loading=lazy`, width/height attributes, `object-fit: cover`, rendered size 110–150 px, and a flower badge.
- Broken photo (Kim Dung src set to an invalid data URL): the card switches to the flower illustration.
- Letters for `tuyet-nhu` (card and `?to=`), `?to=anh`, `?to=lan-thanh` and file:// `?to=thu-huong` all show the SVG flower, no `<img>` inside the letter, and a visible "Ý nghĩa loài hoa:" line equal to the data.
- `?to=tuyet-nhu` intro: the stamp shows `img/tuyet-nhu.jpg`, loaded.
- Fallbacks (`?to=abc`, unknown slug, `<img onerror>`/`<svg onload>` payloads): generic intro, no stamp, no letter, no extra `<img>` (only the 13 garden photos), no alert.
- file://: the song plays after `Mở quà`.
- Missing song (src switched to a 404): the intro chip and music dock hide, nothing plays. The scenario's only log entry is the expected 404, which is checked explicitly and not counted as an error.

## Visual review (screenshots inspected)
- Garden desktop (5 columns) and mobile (2 columns): circular photos in a conic ring tinted with each person's palette, plus a flower badge. Faces stay in frame with `object-position: 50% 30%`. Nothing overflows.
- Letters: flower, then meaning box, then wish. Diacritics are correct (ữ ế ỹ ọ ờ). The hoa sữa and ngọc lan SVGs read clearly.
- Fixed after the first pass: the flower/tagline line and the garden hint left one orphaned word ("mùa", "bạn"). Added `text-wrap: balance`, plus `pretty` on the meaning box.
- Bottom-right music dock: a spinning vinyl and a "♪ You'll Be In My Heart" pill that shows for 6 s after playback starts (and on hover/focus). The label text was edited in `index.html` outside this step (the "NIKI — " prefix was removed). That edit was kept.

## Screenshots
`/Users/orm/Documents/Works/MX/2010/.agents/screenshots/` contains `{desktop,mobile}-01-intro`, `02-hero`, `03-garden`, `03b-garden-full`, `04-letter`, `04b-letter-copied`, `05-personal-intro`, `06-personal-letter`, `07-personal-anh`, `07b-personal-lan-thanh` (new), `08-unknown-slug-intro` and `09-closing`, plus `mobile-10-reduced-letter` and `mobile-11-file-protocol`. All were regenerated in this run.

## Not verified
- Nobody listened to the audio. Headless checks confirm only that the element plays, its volume and its state.
- Not tested on real devices: iOS Safari, Chrome Android, or the Zalo/Messenger in-app browsers. On iOS the volume fade has no effect because iOS ignores `audio.volume`, so the song starts at device volume.
- Real tab switching was simulated by overriding `document.hidden`, not by actually backgrounding a tab.
- The photos are 120–240 px sources, so on 3× phones the 120 px circles look slightly soft. They are not upscaled beyond about 140 CSS px.
- There is no git repo, so nothing was committed.
