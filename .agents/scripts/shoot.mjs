// Verification only: drives headless Chrome over the DevTools Protocol (no npm deps).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS_DIR = path.join(ROOT, '.agents', 'screenshots');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765/index.html';
const FILE_URL = `file://${path.join(ROOT, 'index.html')}`;
const DEBUG_PORT = 9333;
const AUDIO_PATH = 'audio/youll-be-in-my-heart.m4a';

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8'), sandbox);
const RECIPIENTS = Array.from(sandbox.window.MindxGift.recipients);
const NAMES = RECIPIENTS.map((recipient) => recipient.name);

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const consoleErrors = [];
const screenshots = [];
let scenarioLabel = 'setup';

function check(label, condition, detail) {
  results.push({ label: `[${scenarioLabel}] ${label}`, ok: Boolean(condition), detail });
  console.log(`${condition ? 'OK  ' : 'FAIL'} [${scenarioLabel}] ${label}${!condition && detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`);
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else if (message.method) {
        (this.handlers.get(message.method) || []).forEach((handler) => handler(message.params));
      }
    });
  }

  send(method, params = {}) {
    if (process.env.TRACE) console.log(`  -> ${method}`);
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(method, handler) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(handler);
  }

  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        const list = this.handlers.get(method);
        list.splice(list.indexOf(handler), 1);
        resolve(params);
      };
      this.on(method, handler);
    });
  }
}

let cdp;

async function evaluate(expression) {
  const response = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: false });
  if (response.exceptionDetails) throw new Error(`Evaluate failed: ${expression}\n${JSON.stringify(response.exceptionDetails)}`);
  return response.result.value;
}

async function navigate(url) {
  await cdp.send('Page.navigate', { url: 'about:blank' });
  await sleep(150);
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url });
  await loaded;
  await evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
  await sleep(700);
}

async function screenshot(viewportName, name, clip) {
  const params = { format: 'png' };
  if (clip) {
    params.clip = { ...clip, scale: 1 };
    params.captureBeyondViewport = true;
  }
  const { data } = await cdp.send('Page.captureScreenshot', params);
  const filePath = path.join(SHOTS_DIR, `${viewportName}-${name}.png`);
  writeFileSync(filePath, Buffer.from(data, 'base64'));
  screenshots.push(filePath);
}

async function mouseClick(x, y) {
  const base = { x, y, button: 'left', clickCount: 1 };
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base });
}

async function clickSelector(selector) {
  const box = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  if (!box) throw new Error(`Missing element ${selector}`);
  await sleep(120);
  await mouseClick(box.x, box.y);
}

async function pressEscape() {
  const key = { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 };
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...key });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
}

async function setViewport(name) {
  const viewport = VIEWPORTS[name];
  await cdp.send('Emulation.setDeviceMetricsOverride', viewport);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: viewport.mobile, maxTouchPoints: viewport.mobile ? 5 : 1 });
}

async function openGift() {
  await clickSelector('#open-gift');
  await sleep(2600);
}

const audioState = `(() => {
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  return {
    paused: audio.paused,
    volume: audio.volume,
    loop: audio.loop,
    src: audio.currentSrc || audio.src,
    preload: audio.preload,
    error: audio.error ? audio.error.code : null,
    pressed: toggle.getAttribute('aria-pressed'),
    label: toggle.getAttribute('aria-label'),
    dockHidden: document.getElementById('music-dock').hidden
  };
})()`;

const letterExtras = `(() => ({
  meaning: document.getElementById('letter-flower-meaning').textContent,
  meaningLabel: document.querySelector('.letter__meaning-label').textContent,
  meaningVisible: document.querySelector('.letter__meaning').getBoundingClientRect().height > 20,
  hasFlowerSvg: Boolean(document.querySelector('#letter-flower svg.flower')),
  imgsInLetter: document.querySelectorAll('#letter img').length
}))()`;

async function checkLetterContent(recipient) {
  const extras = await evaluate(letterExtras);
  check(`letter shows ${recipient.flower} SVG, no photo`, extras.hasFlowerSvg && extras.imgsInLetter === 0, extras);
  check('letter shows flower meaning', extras.meaningVisible && extras.meaningLabel === 'Ý nghĩa loài hoa:' && extras.meaning === recipient.flowerMeaning, extras);
}

const letterState = `(() => ({
  open: document.getElementById('letter').open,
  name: document.getElementById('letter-name').textContent,
  wishFull: document.getElementById('letter-wish-full').textContent,
  typed: document.getElementById('letter-wish').textContent,
  focusInside: document.getElementById('letter').contains(document.activeElement),
  activeSlug: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.slug || null : null,
  activeId: document.activeElement ? document.activeElement.id : null
}))()`;

async function noHorizontalOverflow() {
  return evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1');
}

async function runMainFlow(viewportName) {
  scenarioLabel = `${viewportName} a-intro`;
  await navigate(BASE);
  await screenshot(viewportName, '01-intro');
  check('intro heading is generic', (await evaluate("document.getElementById('intro-title').textContent")) === 'Gửi những bông hoa của MindX');
  check('letter not open', !(await evaluate("document.getElementById('letter').open")));
  check('Mở quà button exists', (await evaluate("document.getElementById('open-gift').textContent.trim()")).includes('Mở quà'));
  check('song chip on by default', (await evaluate("document.getElementById('intro-music').getAttribute('aria-pressed')")) === 'true');
  let audio = await evaluate(audioState);
  check('audio paused before gesture, buffering requested', audio.paused && audio.preload === 'auto' && audio.loop && audio.src.endsWith(AUDIO_PATH) && audio.dockHidden, audio);

  scenarioLabel = `${viewportName} b-hero`;
  await openGift();
  await sleep(1800);
  await screenshot(viewportName, '02-hero');
  check('intro hidden', await evaluate("document.getElementById('intro').hidden"));
  const heroText = await evaluate("document.querySelector('h1').textContent");
  check('h1 contains title and 20/10', heroText.includes('Ngày Phụ nữ Việt Nam') && heroText.includes('20/10'), heroText);
  check('focus inside hero', await evaluate("document.getElementById('section-hero').contains(document.activeElement)"));
  check('no horizontal overflow', await noHorizontalOverflow());
  audio = await evaluate(audioState);
  check('song playing after Mở quà, faded to 0.6', !audio.paused && audio.error === null && Math.abs(audio.volume - 0.6) < 0.02 && audio.pressed === 'true' && audio.label === 'Tắt nhạc nền' && !audio.dockHidden, audio);

  scenarioLabel = `${viewportName} c-garden`;
  await evaluate("document.getElementById('section-garden').scrollIntoView({ behavior: 'instant' })");
  await sleep(1400);
  await screenshot(viewportName, '03-garden');
  check('13 flower cards', (await evaluate("document.querySelectorAll('.flower-card').length")) === 13);
  const cardNames = await evaluate("Array.from(document.querySelectorAll('.flower-card__name')).map((el) => el.textContent)");
  check('card names exact order', JSON.stringify(cardNames) === JSON.stringify(NAMES), cardNames);
  check('reveal elements visible', (await evaluate("document.querySelectorAll('.reveal.is-visible').length")) > 0);
  const gardenHeight = await evaluate("document.getElementById('section-garden').offsetHeight");
  for (let offset = 0; offset < gardenHeight; offset += 300) {
    await evaluate(`window.scrollBy(0, 300)`);
    await sleep(120);
  }
  await sleep(1000);
  const gardenRect = await evaluate("(() => { const r = document.getElementById('section-garden').getBoundingClientRect(); return { x: 0, y: r.top + window.scrollY, width: document.documentElement.clientWidth, height: r.height }; })()");
  await screenshot(viewportName, '03b-garden-full', gardenRect);
  check('no horizontal overflow', await noHorizontalOverflow());
  const photos = await evaluate(`Array.from(document.querySelectorAll('.flower-card')).map((card) => {
    const img = card.querySelector('img.flower-card__photo');
    const rect = img ? img.getBoundingClientRect() : null;
    return img ? { slug: card.dataset.slug, src: img.getAttribute('src'), alt: img.alt, loading: img.loading, w: img.getAttribute('width'), h: img.getAttribute('height'), natural: img.naturalWidth, shown: Math.round(rect.width), fit: getComputedStyle(img).objectFit, badge: Boolean(card.querySelector('.flower-card__badge svg')) } : { slug: card.dataset.slug, missing: true };
  })`);
  const badPhotos = photos.filter((photo, index) => {
    const recipient = RECIPIENTS[index];
    return photo.missing || photo.src !== `img/${recipient.slug}.jpg` || photo.alt !== `Ảnh của ${recipient.name}` || photo.loading !== 'lazy' || !photo.w || !photo.h || !(photo.natural > 0) || photo.fit !== 'cover' || !photo.badge || photo.shown < 110 || photo.shown > 150;
  });
  check('13 photos loaded (naturalWidth > 0, alt, lazy, cover, badge)', photos.length === 13 && badPhotos.length === 0, badPhotos.length ? badPhotos : photos[0]);

  scenarioLabel = `${viewportName} d-letter`;
  await clickSelector('.flower-card[data-slug="tuyet-nhu"]');
  await sleep(4000);
  await screenshot(viewportName, '04-letter');
  let letter = await evaluate(letterState);
  check('letter open', letter.open);
  check('letter name Tuyết Như', letter.name === 'Tuyết Như', letter.name);
  check('full wish matches data', letter.wishFull === RECIPIENTS[1].wish);
  await checkLetterContent(RECIPIENTS[1]);
  check('focus inside dialog', letter.focusInside);
  const paperFits = await evaluate("(() => { const r = document.querySelector('.letter__paper').getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth + 1; })()");
  check('letter paper fits width', paperFits);

  await pressEscape();
  await sleep(700);
  letter = await evaluate(letterState);
  check('Escape closes letter', !letter.open);
  check('focus returns to Tuyết Như card', letter.activeSlug === 'tuyet-nhu', letter.activeSlug);

  await clickSelector('.flower-card[data-slug="tuyet-nhu"]');
  await sleep(1200);
  await mouseClick(5, 5);
  await sleep(700);
  check('backdrop click closes letter', !(await evaluate("document.getElementById('letter').open")));

  await clickSelector('.flower-card[data-slug="tuyet-nhu"]');
  await sleep(1200);
  await clickSelector('#letter-close');
  await sleep(700);
  check('× button closes letter', !(await evaluate("document.getElementById('letter').open")));

  scenarioLabel = `${viewportName} d2-focus-trap`;
  await clickSelector('.flower-card[data-slug="tuyet-nhu"]');
  await sleep(1200);
  for (let index = 0; index < 6; index += 1) {
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  }
  check('Tab keeps focus inside dialog', (await evaluate(letterState)).focusInside);

  scenarioLabel = `${viewportName} e-copy`;
  await clickSelector('#copy-link');
  await sleep(500);
  const toast = await evaluate("(() => { const t = document.getElementById('toast'); const input = t.querySelector('input'); return { visible: t.classList.contains('is-visible'), text: t.textContent, input: input ? input.value : '' }; })()");
  check('copy toast shown', toast.visible && (toast.text.startsWith('Đã sao chép') || toast.input.includes('?to=tuyet-nhu')), toast);
  await screenshot(viewportName, '04b-letter-copied');
  await clickSelector('#letter-close');
  await sleep(700);

  scenarioLabel = `${viewportName} i-tap`;
  await evaluate("window.scrollTo(0, 0)");
  await sleep(300);
  await evaluate("document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 30, clientY: 420 }))");
  await sleep(400);
  check('tap hearts ran without error', true);

  scenarioLabel = `${viewportName} j-music`;
  const hideTab = (hidden) => evaluate(`(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => ${hidden} }); document.dispatchEvent(new Event('visibilitychange')); return true; })()`);
  await hideTab(true);
  await sleep(300);
  check('tab hidden pauses song', (await evaluate(audioState)).paused);
  await hideTab(false);
  await sleep(600);
  check('tab visible resumes song', !(await evaluate(audioState)).paused);
  await clickSelector('#music-toggle');
  await sleep(500);
  let music = await evaluate(audioState);
  check('music toggle off', music.paused && music.pressed === 'false' && music.label === 'Bật nhạc nền', music);
  await hideTab(true);
  await hideTab(false);
  await sleep(400);
  check('user-paused song stays paused after tab switch', (await evaluate(audioState)).paused);
  await clickSelector('#music-toggle');
  await sleep(2000);
  music = await evaluate(audioState);
  check('music toggle on', !music.paused && music.pressed === 'true' && music.label === 'Tắt nhạc nền' && music.volume > 0.55, music);
  await evaluate("delete document.hidden");

  scenarioLabel = `${viewportName} j2-photo-fallback`;
  await evaluate("(() => { const img = document.querySelector('.flower-card[data-slug=\"kim-dung\"] img'); img.src = 'data:image/jpeg;base64,AAAA'; return true; })()");
  await sleep(500);
  const fallback = await evaluate("(() => { const portrait = document.querySelector('.flower-card[data-slug=\"kim-dung\"] .flower-card__portrait'); return { fallback: portrait.classList.contains('is-fallback'), svg: Boolean(portrait.querySelector('.flower-card__flower svg.flower')), img: Boolean(portrait.querySelector('img')) }; })()");
  check('broken photo falls back to flower', fallback.fallback && fallback.svg && !fallback.img, fallback);

  scenarioLabel = `${viewportName} closing`;
  await evaluate("document.getElementById('section-closing').scrollIntoView({ behavior: 'instant' })");
  await sleep(1200);
  await screenshot(viewportName, '09-closing');
  const closingText = await evaluate("document.getElementById('section-closing').textContent + document.querySelector('.footer').textContent");
  check('closing lines present', closingText.includes('Cảm ơn vì đã là một phần tuyệt vời của MindX') && closingText.includes('— Với tất cả sự trân trọng, MindX —') && closingText.includes('20.10.2026'));

  scenarioLabel = `${viewportName} m-fonts`;
  const fonts = await evaluate(`({
    script: document.fonts.check('700 32px "Dancing Script"', 'Tuyết Như Mỹ Duyên'),
    sans: document.fonts.check('400 16px "Be Vietnam Pro"', 'Tuyết Như Mỹ Duyên'),
    serif: document.fonts.check('700 16px "Playfair Display"', 'Ngày Phụ nữ')
  })`);
  check('Vietnamese fonts loaded', fonts.script && fonts.sans && fonts.serif, fonts);
}

async function runPersonalFlows(viewportName) {
  scenarioLabel = `${viewportName} f-personal-tuyet-nhu`;
  await navigate(`${BASE}?to=tuyet-nhu`);
  await screenshot(viewportName, '05-personal-intro');
  check('intro says Gửi Tuyết Như', (await evaluate("document.getElementById('intro-title').textContent")) === 'Gửi Tuyết Như');
  const stamp = await evaluate("(() => { const s = document.getElementById('intro-stamp'); const img = s.querySelector('img'); return { hidden: s.hidden, src: img && img.getAttribute('src'), natural: img ? img.naturalWidth : 0 }; })()");
  check('intro stamp shows her photo', !stamp.hidden && stamp.src === 'img/tuyet-nhu.jpg' && stamp.natural > 0, stamp);
  await openGift();
  await sleep(4500);
  await screenshot(viewportName, '06-personal-letter');
  let letter = await evaluate(letterState);
  check('personal letter open for Tuyết Như', letter.open && letter.name === 'Tuyết Như', letter);
  await checkLetterContent(RECIPIENTS[1]);
  check('title personalized', (await evaluate('document.title')).includes('Tuyết Như'));

  scenarioLabel = `${viewportName} f-personal-anh`;
  await navigate(`${BASE}?to=anh`);
  check('intro says Gửi Ánh', (await evaluate("document.getElementById('intro-title').textContent")) === 'Gửi Ánh');
  await openGift();
  await sleep(2500);
  letter = await evaluate(letterState);
  check('letter is Ánh (not Anh Thư / Lan Anh)', letter.open && letter.name === 'Ánh', letter.name);
  await checkLetterContent(RECIPIENTS[4]);
  check('title contains Ánh', (await evaluate('document.title')).includes('Ánh'));
  await screenshot(viewportName, '07-personal-anh');
  await clickSelector('#view-garden');
  await sleep(1800);
  check('Xem cả vườn hoa closes letter', !(await evaluate("document.getElementById('letter').open")));
  check('garden has 13 cards', (await evaluate("document.querySelectorAll('.flower-card').length")) === 13);
  const gardenTop = await evaluate("document.getElementById('section-garden').getBoundingClientRect().top");
  check('garden scrolled into view', Math.abs(gardenTop) < 120, gardenTop);

  scenarioLabel = `${viewportName} g-hash`;
  await navigate(`${BASE}#my-duyen`);
  check('intro says Gửi Mỹ Duyên', (await evaluate("document.getElementById('intro-title').textContent")) === 'Gửi Mỹ Duyên');
  await openGift();
  await sleep(1500);
  letter = await evaluate(letterState);
  check('hash letter is Mỹ Duyên', letter.open && letter.name === 'Mỹ Duyên', letter.name);

  const fallbacks = [
    ['?to=abc', 'abc'],
    ['?to=khong-ton-tai', 'khong-ton-tai'],
    ['?to=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', 'onerror'],
    ['#%3Csvg%20onload%3Dalert(1)%3E', 'onload']
  ];
  for (const [suffix, marker] of fallbacks) {
    scenarioLabel = `${viewportName} h-fallback ${suffix}`;
    await navigate(`${BASE}${suffix}`);
    if (suffix === '?to=abc') await screenshot(viewportName, '08-unknown-slug-intro');
    check('generic intro heading', (await evaluate("document.getElementById('intro-title').textContent")) === 'Gửi những bông hoa của MindX');
    await openGift();
    await sleep(1600);
    check('no letter opened', !(await evaluate("document.getElementById('letter').open")));
    check('no <img> injected', (await evaluate("document.querySelectorAll('img:not(.flower-card__photo)').length")) === 0 && (await evaluate("document.querySelectorAll('img.flower-card__photo').length")) === 13);
    check('no intro stamp', await evaluate("document.getElementById('intro-stamp').hidden"));
    check('URL text not rendered', !(await evaluate(`document.body.textContent.includes(${JSON.stringify(marker)})`)));
    check('title generic', (await evaluate('document.title')) === 'Chúc mừng 20/10 · Gửi những bông hoa của MindX');
  }
}

async function runReducedMotion() {
  scenarioLabel = 'mobile k-reduced-motion';
  await setViewport('mobile');
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await navigate(BASE);
  await clickSelector('#open-gift');
  await sleep(900);
  check('intro hidden quickly', await evaluate("document.getElementById('intro').hidden"));
  await evaluate("document.getElementById('section-garden').scrollIntoView({ behavior: 'instant' })");
  await sleep(300);
  await clickSelector('.flower-card[data-slug="tuyet-nhu"]');
  await sleep(450);
  const letter = await evaluate(letterState);
  check('wish typed instantly', letter.open && letter.typed === RECIPIENTS[1].wish);
  await screenshot('mobile', '10-reduced-letter');
  await cdp.send('Emulation.setEmulatedMedia', { features: [] });
}

async function runFileProtocol() {
  scenarioLabel = 'mobile l-file-protocol';
  await setViewport('mobile');
  await navigate(`${FILE_URL}?to=thu-huong`);
  check('file:// intro says Gửi Thu Hương', (await evaluate("document.getElementById('intro-title').textContent")) === 'Gửi Thu Hương');
  await openGift();
  await sleep(4500);
  const letter = await evaluate(letterState);
  check('file:// letter open for Thu Hương', letter.open && letter.name === 'Thu Hương', letter.name);
  await checkLetterContent(RECIPIENTS[7]);
  check('file:// song playing', !(await evaluate(audioState)).paused);
  await screenshot('mobile', '11-file-protocol');
}

async function checkHttpAssets() {
  scenarioLabel = 'http assets';
  const origin = new URL(BASE);
  const assets = [AUDIO_PATH, ...RECIPIENTS.map((recipient) => recipient.photo)];
  for (const asset of assets) {
    const response = await fetch(new URL(asset, origin), { method: 'HEAD' });
    check(`HTTP 200 ${asset} (${response.headers.get('content-type')}, ${response.headers.get('content-length')} B)`, response.status === 200, response.status);
  }
}

async function main() {
  mkdirSync(SHOTS_DIR, { recursive: true });
  await checkHttpAssets();
  const profileDir = mkdtempSync(path.join(tmpdir(), 'mindx-chrome-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--autoplay-policy=user-gesture-required',
    '--allow-file-access-from-files',
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    let version = null;
    for (let attempt = 0; attempt < 50 && !version; attempt += 1) {
      try {
        version = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).json();
      } catch (error) {
        await sleep(200);
      }
    }
    if (!version) throw new Error('Chrome did not start');
    const target = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    cdp = new Cdp(socket);
    cdp.on('Runtime.exceptionThrown', (params) => consoleErrors.push({ scenario: scenarioLabel, type: 'exception', text: params.exceptionDetails.exception?.description || params.exceptionDetails.text }));
    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error' || params.type === 'assert') {
        consoleErrors.push({ scenario: scenarioLabel, type: params.type, text: params.args.map((arg) => arg.value ?? arg.description).join(' ') });
      }
    });
    cdp.on('Log.entryAdded', (params) => {
      if (params.entry.level === 'error') consoleErrors.push({ scenario: scenarioLabel, type: 'log', text: `${params.entry.text} ${params.entry.url || ''}` });
    });
    cdp.on('Page.javascriptDialogOpening', (params) => {
      consoleErrors.push({ scenario: scenarioLabel, type: 'alert', text: params.message });
      cdp.send('Page.handleJavaScriptDialog', { accept: true });
    });
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.bringToFront');
    await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });

    for (const viewportName of ['desktop', 'mobile']) {
      await setViewport(viewportName);
      await runMainFlow(viewportName);
      await runPersonalFlows(viewportName);
    }
    await runReducedMotion();
    await runFileProtocol();
    socket.close();
  } finally {
    chrome.kill('SIGTERM');
    await sleep(500);
    rmSync(profileDir, { recursive: true, force: true });
  }

  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  console.log(`${consoleErrors.length} console errors`);
  consoleErrors.forEach((entry) => console.log(`  [${entry.scenario}] ${entry.type}: ${entry.text}`));
  console.log('\nScreenshots:');
  screenshots.forEach((filePath) => console.log(`  ${filePath}`));
  if (failed.length || consoleErrors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
