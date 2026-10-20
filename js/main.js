(function (app) {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const HERO_TYPE_DELAY_MS = 45;
  const WISH_TYPE_DELAY_MS = 22;
  const TOAST_DURATION_MS = 2800;
  const MUSIC_LABEL_MS = 6000;
  const CARD_PHOTO_SIZE = 140;
  const TAP_IGNORE_SELECTOR = 'button, a, input, textarea, select, label, dialog, .flower-card, #intro';
  const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

  const state = {
    recipient: null,
    introOpened: false,
    letterTrigger: null,
    letterRecipient: null,
    closingLetter: false,
    afterLetterClose: null,
    wishTimer: 0,
    heroTimer: 0,
    toastTimer: 0,
    closeTimer: 0,
    musicLabelTimer: 0
  };

  const elements = {};
  const prefersReducedMotion = () => reducedMotionQuery.matches;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function cacheElements() {
    [
      'intro', 'intro-title', 'open-gift', 'main', 'hero-title', 'hero-typed',
      'hero-personal', 'hero-personal-name', 'hero-letter', 'bouquet-slot', 'garden-list',
      'letter', 'letter-close', 'letter-name', 'letter-flower', 'letter-flower-name',
      'letter-tagline', 'letter-flower-meaning', 'letter-wish', 'letter-wish-ghost', 'letter-wish-full', 'copy-link',
      'view-garden', 'random-letter', 'music-dock', 'music-toggle', 'music-label', 'intro-stamp', 'toast', 'petal-canvas', 'fx-canvas'
    ].forEach((id) => {
      elements[id] = document.getElementById(id);
    });
    elements.paper = elements.letter.querySelector('.letter__paper');
    elements.footer = document.querySelector('.footer');
  }

  function readHashSlug() {
    const rawHash = window.location.hash.slice(1);
    if (!rawHash) return null;
    try {
      return decodeURIComponent(rawHash);
    } catch (error) {
      return null;
    }
  }

  function resolveRecipientFromUrl() {
    const querySlug = new URLSearchParams(window.location.search).get('to');
    return app.findRecipient(querySlug) || app.findRecipient(readHashSlug());
  }

  function personalize(recipient) {
    if (!recipient) return;
    elements['intro-title'].textContent = `Gửi ${recipient.name}`;
    elements['hero-personal-name'].textContent = recipient.name;
    elements['hero-personal'].hidden = false;
    elements['hero-letter'].hidden = false;
    document.title = `Gửi ${recipient.name} · Một lá thư nhỏ ngày 20/10`;
    showIntroStamp(recipient);
  }

  function showIntroStamp(recipient) {
    if (!recipient.photo) return;
    const stamp = elements['intro-stamp'];
    const photo = document.createElement('img');
    photo.alt = '';
    photo.width = 64;
    photo.height = 64;
    photo.decoding = 'async';
    photo.addEventListener('load', () => { stamp.hidden = false; }, { once: true });
    photo.addEventListener('error', () => photo.remove(), { once: true });
    photo.src = recipient.photo;
    setPaletteVars(stamp, recipient.palette);
    stamp.replaceChildren(photo);
  }

  function setPaletteVars(target, palette) {
    target.style.setProperty('--p-petal', palette.petal);
    target.style.setProperty('--p-deep', palette.petalDeep);
    target.style.setProperty('--p-center', palette.center);
    target.style.setProperty('--p-glow', palette.glow);
  }

  function renderGarden() {
    const fragment = document.createDocumentFragment();
    app.recipients.forEach((recipient, index) => {
      const item = document.createElement('li');
      item.className = 'garden__item reveal';
      item.style.setProperty('--reveal-delay', `${(index % 5) * 70}ms`);

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'flower-card';
      card.dataset.slug = recipient.slug;
      card.setAttribute('aria-label', `Mở thư gửi ${recipient.name}`);
      setPaletteVars(card, recipient.palette);
      card.style.setProperty('--sway-delay', `${index * -0.45}s`);

      const portrait = createCardPortrait(recipient);

      const name = document.createElement('span');
      name.className = 'flower-card__name';
      name.textContent = recipient.name;

      const flowerName = document.createElement('span');
      flowerName.className = 'flower-card__flower-name';
      flowerName.textContent = recipient.flower;

      card.append(portrait, name, flowerName);
      card.addEventListener('click', () => openLetter(recipient, card));
      item.append(card);
      fragment.append(item);
    });
    elements['garden-list'].replaceChildren(fragment);
  }

  function showCardFlower(portrait, recipient) {
    const flowerHolder = document.createElement('span');
    flowerHolder.className = 'flower-card__flower';
    flowerHolder.append(app.flowers.create(recipient.flowerType, recipient.palette, { size: 92 }));
    portrait.classList.add('is-fallback');
    portrait.replaceChildren(flowerHolder);
  }

  function createCardPortrait(recipient) {
    const portrait = document.createElement('span');
    portrait.className = 'flower-card__portrait';
    if (!recipient.photo) {
      showCardFlower(portrait, recipient);
      return portrait;
    }
    const photo = document.createElement('img');
    photo.className = 'flower-card__photo';
    photo.alt = `Ảnh của ${recipient.name}`;
    photo.width = CARD_PHOTO_SIZE;
    photo.height = CARD_PHOTO_SIZE;
    photo.loading = 'lazy';
    photo.decoding = 'async';
    photo.addEventListener('error', () => showCardFlower(portrait, recipient), { once: true });
    photo.src = recipient.photo;

    const badge = document.createElement('span');
    badge.className = 'flower-card__badge';
    badge.append(app.flowers.create(recipient.flowerType, recipient.palette, { size: 34 }));
    portrait.append(photo, badge);
    return portrait;
  }

  function cardFor(recipient) {
    return elements['garden-list'].querySelector(`[data-slug="${recipient.slug}"]`);
  }

  function centerOf(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function typeHeroLine() {
    const text = 'Gửi những người phụ nữ tuyệt vời của MindX';
    const target = elements['hero-typed'];
    window.clearTimeout(state.heroTimer);
    if (prefersReducedMotion()) {
      target.textContent = text;
      return;
    }
    const characters = Array.from(text);
    let shown = 0;
    const step = () => {
      shown += 1;
      target.textContent = characters.slice(0, shown).join('');
      if (shown < characters.length) state.heroTimer = window.setTimeout(step, HERO_TYPE_DELAY_MS);
    };
    step();
  }

  function setPageInert(isInert) {
    [elements.main, elements.footer].forEach((element) => {
      element.inert = isInert;
      if (isInert) element.setAttribute('aria-hidden', 'true');
      else element.removeAttribute('aria-hidden');
    });
  }

  async function openGift() {
    if (state.introOpened) return;
    state.introOpened = true;
    elements['open-gift'].disabled = true;

    const reduced = prefersReducedMotion();
    const envelope = elements.intro.querySelector('.envelope');
    elements.intro.classList.add('is-opening');

    await wait(reduced ? 0 : 700);
    const origin = centerOf(envelope);
    app.effects.burst(origin.x, origin.y, { count: 80 });

    await wait(reduced ? 50 : 600);
    elements.intro.classList.add('is-leaving');

    await wait(reduced ? 200 : 650);
    elements.intro.hidden = true;
    document.body.classList.remove('is-locked', 'intro-active');
    document.body.classList.add('is-blooming');
    setPageInert(false);
    elements['hero-title'].focus({ preventScroll: true });
    typeHeroLine();

    if (state.recipient) {
      await wait(reduced ? 100 : 700);
      openLetter(state.recipient, cardFor(state.recipient));
    }
  }

  function stopWishTyping() {
    window.clearTimeout(state.wishTimer);
    state.wishTimer = 0;
  }

  function finishWishTyping() {
    if (!state.letterRecipient) return;
    stopWishTyping();
    elements['letter-wish'].textContent = state.letterRecipient.wish;
    elements['letter-wish'].classList.add('is-done');
  }

  function typeWish(text) {
    const target = elements['letter-wish'];
    stopWishTyping();
    target.classList.remove('is-done');
    if (prefersReducedMotion()) {
      finishWishTyping();
      return;
    }
    const characters = Array.from(text);
    let shown = 0;
    target.textContent = '';
    const step = () => {
      shown += 1;
      target.textContent = characters.slice(0, shown).join('');
      if (shown < characters.length) {
        state.wishTimer = window.setTimeout(step, WISH_TYPE_DELAY_MS);
      } else {
        target.classList.add('is-done');
        state.wishTimer = 0;
      }
    };
    state.wishTimer = window.setTimeout(step, 450);
  }

  function fillLetter(recipient) {
    setPaletteVars(elements.letter, recipient.palette);
    elements['letter-name'].textContent = recipient.name;
    elements['letter-flower-name'].textContent = recipient.flower;
    elements['letter-tagline'].textContent = recipient.tagline;
    elements['letter-flower-meaning'].textContent = recipient.flowerMeaning;
    elements['letter-wish-ghost'].textContent = recipient.wish;
    elements['letter-wish-full'].textContent = recipient.wish;
    elements['letter-wish'].textContent = '';
    elements['letter-flower'].replaceChildren(
      app.flowers.create(recipient.flowerType, recipient.palette, { size: 150, bloom: true })
    );
  }

  function moveOverlayLayers(container) {
    container.append(elements.toast, elements['fx-canvas']);
  }

  function restartAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function openLetter(recipient, trigger) {
    if (!recipient) return;
    const dialog = elements.letter;
    state.letterRecipient = recipient;
    state.letterTrigger = trigger || cardFor(recipient);
    state.closingLetter = false;
    window.clearTimeout(state.closeTimer);
    elements.paper.classList.remove('is-closing');
    fillLetter(recipient);

    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
        dialog.classList.add('is-fallback');
        setPageInert(true);
      }
      document.body.classList.add('is-locked');
      moveOverlayLayers(dialog);
    }
    dialog.scrollTop = 0;
    restartAnimation(elements.paper, 'is-opening');
    elements['letter-name'].focus({ preventScroll: true });
    typeWish(recipient.wish);

    window.setTimeout(() => {
      if (!dialog.open || state.letterRecipient !== recipient) return;
      const flowerCenter = centerOf(elements['letter-flower']);
      const palette = recipient.palette;
      app.effects.burst(flowerCenter.x, flowerCenter.y, {
        count: 70,
        colors: [palette.petal, palette.petalDeep, palette.center, '#E87A93', '#F3D18A'],
        shapes: ['heart', 'sparkle', 'petal']
      });
    }, prefersReducedMotion() ? 0 : 380);
  }

  function closeLetter(afterClose) {
    const dialog = elements.letter;
    if (!dialog.open || state.closingLetter) return;
    state.closingLetter = true;
    state.afterLetterClose = typeof afterClose === 'function' ? afterClose : null;
    stopWishTyping();
    elements.paper.classList.add('is-closing');
    state.closeTimer = window.setTimeout(() => {
      if (typeof dialog.close === 'function' && !dialog.classList.contains('is-fallback')) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        dialog.classList.remove('is-fallback');
        setPageInert(false);
        handleLetterClosed();
      }
    }, prefersReducedMotion() ? 0 : 260);
  }

  function handleLetterClosed() {
    stopWishTyping();
    state.closingLetter = false;
    elements.paper.classList.remove('is-opening', 'is-closing');
    document.body.classList.remove('is-locked');
    moveOverlayLayers(document.body);
    const returnTarget = state.letterTrigger && state.letterTrigger.isConnected
      ? state.letterTrigger
      : state.letterRecipient && cardFor(state.letterRecipient);
    if (returnTarget) returnTarget.focus({ preventScroll: true });
    const afterClose = state.afterLetterClose;
    state.afterLetterClose = null;
    if (afterClose) afterClose();
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(elements.letter.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter((element) => element.offsetParent !== null || element === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !elements.letter.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function wireLetter() {
    const dialog = elements.letter;
    elements['letter-close'].addEventListener('click', () => closeLetter());
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeLetter();
    });
    dialog.addEventListener('close', handleLetterClosed);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeLetter();
    });
    dialog.addEventListener('keydown', (event) => {
      trapFocus(event);
      if (event.key === 'Escape' && dialog.classList.contains('is-fallback')) closeLetter();
    });
    elements['letter-wish'].parentElement.addEventListener('click', finishWishTyping);
    elements['copy-link'].addEventListener('click', () => {
      if (state.letterRecipient) copyPersonalLink(state.letterRecipient);
    });
    elements['view-garden'].addEventListener('click', () => {
      closeLetter(() => scrollToSection('section-garden'));
    });
  }

  function buildPersonalUrl(slug) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('to', slug);
    return url.toString();
  }

  function copyWithTextarea(text) {
    const container = elements.letter.open ? elements.letter : document.body;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.className = 'offscreen-copy';
    container.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }
    textarea.remove();
    return copied;
  }

  async function copyPersonalLink(recipient) {
    const url = buildPersonalUrl(recipient.slug);
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }
    if (!copied) copied = copyWithTextarea(url);
    if (copied) {
      showToast(`Đã sao chép link riêng gửi ${recipient.name}`);
    } else {
      showManualCopyToast(url);
    }
  }

  function showToast(message, extraNode) {
    const toast = elements.toast;
    window.clearTimeout(state.toastTimer);
    const text = document.createElement('span');
    text.textContent = message;
    toast.replaceChildren(text);
    if (extraNode) toast.append(extraNode);
    toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), extraNode ? TOAST_DURATION_MS * 3 : TOAST_DURATION_MS);
  }

  function showManualCopyToast(url) {
    const input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.value = url;
    input.className = 'toast__input';
    input.setAttribute('aria-label', 'Link riêng');
    showToast('Không sao chép được tự động, hãy giữ để sao chép:', input);
    input.focus();
    input.select();
  }

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    revealElements.forEach((element) => observer.observe(element));
  }

  function setupParallax() {
    const layers = Array.from(document.querySelectorAll('.parallax'));
    if (!layers.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      if (prefersReducedMotion()) {
        layers.forEach((layer) => { layer.style.transform = ''; });
        return;
      }
      const scrollY = window.scrollY;
      if (scrollY > window.innerHeight * 1.5) return;
      layers.forEach((layer) => {
        const speed = Number(layer.dataset.speed) || 0;
        layer.style.transform = `translate3d(0, ${(scrollY * speed).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  function setupTapHearts() {
    document.addEventListener('pointerdown', (event) => {
      if (!state.introOpened || elements.letter.open) return;
      if (event.target instanceof Element && event.target.closest(TAP_IGNORE_SELECTOR)) return;
      app.effects.spawnTapHearts(event.clientX, event.clientY);
    });
  }

  function updateMusicUi(playing) {
    if (!app.music.isSupported()) {
      elements['music-dock'].hidden = true;
      return;
    }
    // The dock stays hidden until sound really plays, so a browser autoplay block never shows a "muted" icon.
    if (playing) elements['music-dock'].hidden = false;
    const toggle = elements['music-toggle'];
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    const wasPlaying = toggle.classList.contains('is-playing');
    toggle.classList.toggle('is-playing', playing);
    if (playing && !wasPlaying) announceSong();
  }

  function announceSong() {
    const label = elements['music-label'];
    window.clearTimeout(state.musicLabelTimer);
    label.classList.add('is-visible');
    state.musicLabelTimer = window.setTimeout(() => label.classList.remove('is-visible'), MUSIC_LABEL_MS);
  }

  function setupMusic() {
    if (!app.music.isSupported()) return;
    elements['music-toggle'].addEventListener('click', () => app.music.toggle());
    app.music.onChange(updateMusicUi);
    app.music.autoplay();
  }

  function setupButtons() {
    elements['open-gift'].addEventListener('click', openGift);
    document.querySelectorAll('[data-scroll-to]').forEach((button) => {
      button.addEventListener('click', () => scrollToSection(button.dataset.scrollTo));
    });
    elements['hero-letter'].addEventListener('click', () => {
      if (state.recipient) openLetter(state.recipient, elements['hero-letter']);
    });
    elements['random-letter'].addEventListener('click', () => {
      const pool = app.recipients.filter((recipient) => recipient !== state.letterRecipient);
      const recipient = pool[Math.floor(Math.random() * pool.length)];
      openLetter(recipient, elements['random-letter']);
    });
    window.addEventListener('hashchange', () => {
      const recipient = app.findRecipient(readHashSlug());
      if (!recipient) return;
      if (state.introOpened) {
        openLetter(recipient, cardFor(recipient));
      } else if (!state.recipient) {
        state.recipient = recipient;
        personalize(recipient);
      }
    });
  }

  function init() {
    cacheElements();
    state.recipient = resolveRecipientFromUrl();
    personalize(state.recipient);
    renderGarden();
    elements['bouquet-slot'].append(app.flowers.createBouquet());
    setPageInert(true);

    app.effects.init({ ambientCanvas: elements['petal-canvas'], fxCanvas: elements['fx-canvas'] });
    app.effects.setAmbient(true);
    setupScrollReveal();
    setupParallax();
    setupTapHearts();
    setupMusic();
    setupButtons();
    wireLetter();
    if (window.matchMedia('(pointer: fine)').matches) elements['open-gift'].focus({ preventScroll: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.MindxGift = window.MindxGift || {});
