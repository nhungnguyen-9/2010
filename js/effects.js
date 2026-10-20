(function (app) {
  'use strict';

  const MAX_PARTICLES = 220;
  const TAP_THROTTLE_MS = 120;
  const AMBIENT_COLORS = ['#F8BBD0', '#F48FB1', '#FFD9C2', '#F3D18A', '#FFC6D9', '#E87A93'];
  const BURST_COLORS = ['#E87A93', '#B83B5E', '#F3D18A', '#C9963B', '#FFC6D9', '#E31F26'];
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let ambientCanvas = null;
  let ambientContext = null;
  let fxCanvas = null;
  let fxContext = null;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let ambientEnabled = false;
  let ambientPetals = [];
  let particles = [];
  let frameId = 0;
  let lastFrameTime = 0;
  let lastTapTime = 0;
  let resizeTimer = 0;

  const random = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function setupCanvas(canvas) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    const context = canvas.getContext('2d');
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return context;
  }

  function resize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    if (ambientCanvas) ambientContext = setupCanvas(ambientCanvas);
    if (fxCanvas) fxContext = setupCanvas(fxCanvas);
    if (ambientEnabled) syncAmbientCount();
  }

  function ambientTarget() {
    if (reducedMotionQuery.matches) return 0;
    return mobileQuery.matches ? 16 : 36;
  }

  function createAmbientPetal(spreadVertically) {
    return {
      x: random(0, viewportWidth),
      y: spreadVertically ? random(-viewportHeight, viewportHeight) : random(-60, -20),
      size: random(6, 13),
      fallSpeed: random(0.35, 0.9),
      swayAmount: random(0.3, 0.9),
      phase: random(0, Math.PI * 2),
      rotation: random(0, Math.PI * 2),
      spin: random(-0.02, 0.02),
      color: pick(AMBIENT_COLORS),
      alpha: random(0.45, 0.85)
    };
  }

  function syncAmbientCount() {
    const target = ambientTarget();
    while (ambientPetals.length < target) ambientPetals.push(createAmbientPetal(true));
    if (ambientPetals.length > target) ambientPetals.length = target;
  }

  function drawPetal(context, x, y, size, rotation, color, alpha) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(0, -size);
    context.bezierCurveTo(size * 0.9, -size * 0.6, size * 0.7, size * 0.7, 0, size);
    context.bezierCurveTo(-size * 0.7, size * 0.7, -size * 0.9, -size * 0.6, 0, -size);
    context.fill();
    context.restore();
  }

  function drawHeart(context, x, y, size, rotation, color, alpha) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(0, size * 0.35);
    context.bezierCurveTo(-size * 1.1, -size * 0.35, -size * 0.45, -size * 1.05, 0, -size * 0.45);
    context.bezierCurveTo(size * 0.45, -size * 1.05, size * 1.1, -size * 0.35, 0, size * 0.35);
    context.fill();
    context.restore();
  }

  function drawSparkle(context, x, y, size, rotation, color, alpha) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    for (let point = 0; point < 4; point += 1) {
      context.rotate(Math.PI / 2);
      context.moveTo(0, 0);
      context.quadraticCurveTo(size * 0.18, -size * 0.18, 0, -size);
      context.quadraticCurveTo(-size * 0.18, -size * 0.18, 0, 0);
    }
    context.fill();
    context.restore();
  }

  const DRAWERS = { petal: drawPetal, heart: drawHeart, sparkle: drawSparkle };

  function addParticle(particle) {
    particles.push(particle);
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
  }

  function burst(x, y, options) {
    const settings = options || {};
    const colors = settings.colors && settings.colors.length ? settings.colors : BURST_COLORS;
    const shapes = settings.shapes || ['heart', 'petal', 'sparkle'];
    const reduced = reducedMotionQuery.matches;
    const baseCount = settings.count || 60;
    const count = reduced ? 8 : mobileQuery.matches ? Math.round(baseCount / 2) : baseCount;
    for (let index = 0; index < count; index += 1) {
      const angle = random(0, Math.PI * 2);
      const speed = reduced ? random(0.3, 1) : random(2.5, 8.5);
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (reduced ? 0 : 2),
        gravity: reduced ? 0 : 0.12,
        size: random(5, 12),
        rotation: random(0, Math.PI * 2),
        spin: random(-0.12, 0.12),
        shape: pick(shapes),
        color: pick(colors),
        life: 1,
        decay: reduced ? 0.04 : random(0.011, 0.02)
      });
    }
    ensureLoop();
  }

  function spawnTapHearts(x, y) {
    const now = performance.now();
    if (now - lastTapTime < TAP_THROTTLE_MS) return;
    lastTapTime = now;
    const count = reducedMotionQuery.matches ? 2 : 5 + Math.floor(Math.random() * 3);
    for (let index = 0; index < count; index += 1) {
      addParticle({
        x: x + random(-8, 8),
        y: y + random(-8, 8),
        vx: random(-1.4, 1.4),
        vy: random(-2.8, -1),
        gravity: -0.015,
        size: random(5, 9),
        rotation: random(-0.4, 0.4),
        spin: random(-0.03, 0.03),
        shape: Math.random() < 0.7 ? 'heart' : 'petal',
        color: pick(BURST_COLORS),
        life: 1,
        decay: random(0.016, 0.026)
      });
    }
    ensureLoop();
  }

  function shouldRun() {
    return !document.hidden && (ambientPetals.length > 0 || particles.length > 0);
  }

  function ensureLoop() {
    if (frameId || !shouldRun()) return;
    lastFrameTime = performance.now();
    frameId = window.requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function tick(now) {
    const delta = Math.min((now - lastFrameTime) / 16.67, 3);
    lastFrameTime = now;

    if (ambientContext) {
      ambientContext.clearRect(0, 0, viewportWidth, viewportHeight);
      ambientPetals.forEach((petal) => {
        petal.phase += 0.015 * delta;
        petal.y += petal.fallSpeed * delta;
        petal.x += Math.sin(petal.phase) * petal.swayAmount * delta;
        petal.rotation += petal.spin * delta;
        if (petal.y > viewportHeight + 30) Object.assign(petal, createAmbientPetal(false));
        if (petal.x < -30) petal.x = viewportWidth + 20;
        if (petal.x > viewportWidth + 30) petal.x = -20;
        drawPetal(ambientContext, petal.x, petal.y, petal.size, petal.rotation, petal.color, petal.alpha);
      });
    }

    if (fxContext) {
      fxContext.clearRect(0, 0, viewportWidth, viewportHeight);
      particles = particles.filter((particle) => particle.life > 0);
      particles.forEach((particle) => {
        particle.vx *= 0.985;
        particle.vy += particle.gravity * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.spin * delta;
        particle.life -= particle.decay * delta;
        if (particle.life > 0) {
          DRAWERS[particle.shape](fxContext, particle.x, particle.y, particle.size, particle.rotation, particle.color, Math.min(1, particle.life * 1.4));
        }
      });
    }

    frameId = 0;
    if (shouldRun()) {
      frameId = window.requestAnimationFrame(tick);
    } else if (ambientContext) {
      ambientContext.clearRect(0, 0, viewportWidth, viewportHeight);
    }
  }

  function setAmbient(enabled) {
    ambientEnabled = Boolean(enabled);
    if (ambientEnabled) {
      syncAmbientCount();
    } else {
      ambientPetals = [];
    }
    ensureLoop();
  }

  function handleMotionPreferenceChange() {
    if (ambientEnabled) syncAmbientCount();
    ensureLoop();
  }

  function init(options) {
    ambientCanvas = options.ambientCanvas;
    fxCanvas = options.fxCanvas;
    resize();
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopLoop();
      else ensureLoop();
    });
    const listen = (query) => {
      if (query.addEventListener) query.addEventListener('change', handleMotionPreferenceChange);
      else if (query.addListener) query.addListener(handleMotionPreferenceChange);
    };
    listen(reducedMotionQuery);
    listen(mobileQuery);
  }

  app.effects = Object.freeze({ init, burst, spawnTapHearts, setAmbient });
})(window.MindxGift = window.MindxGift || {});
