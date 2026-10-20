(function (app) {
  'use strict';

  const TARGET_VOLUME = 0.6;
  const FADE_IN_MS = 1500;
  const FADE_STEP_MS = 50;
  const AAC_TYPE = 'audio/mp4; codecs="mp4a.40.2"';
  // touchend is included because iOS only counts it (not touchstart) as a gesture that may start sound.
  const GESTURE_EVENTS = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
  const GESTURE_OPTIONS = { capture: true, passive: true };
  const OWN_TOGGLE_SELECTOR = '#music-toggle';

  const audio = document.getElementById('bg-music');
  const listeners = [];
  let fadeTimer = 0;
  let userPaused = false;
  let resumeWhenVisible = false;
  let waitingForGesture = false;

  function isSupported() {
    return Boolean(audio && typeof audio.play === 'function' && audio.canPlayType(AAC_TYPE)) && !audio.error;
  }

  function isPlaying() {
    return Boolean(audio) && !audio.paused;
  }

  function notify() {
    const playing = isPlaying();
    listeners.forEach((listener) => listener(playing));
  }

  function stopFade() {
    window.clearInterval(fadeTimer);
    fadeTimer = 0;
  }

  // iOS Safari ignores volume changes, so there the song simply starts at device volume.
  function fadeIn() {
    stopFade();
    const startedAt = performance.now();
    audio.volume = 0;
    fadeTimer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / FADE_IN_MS);
      audio.volume = TARGET_VOLUME * progress;
      if (progress >= 1) stopFade();
    }, FADE_STEP_MS);
  }

  function onGesture(event) {
    if (userPaused) {
      stopWaitingForGesture();
      return;
    }
    // The vinyl toggle starts the song from its own click handler; starting it here too would make that click pause it again.
    if (event.target instanceof Element && event.target.closest(OWN_TOGGLE_SELECTOR)) return;
    play();
  }

  function waitForGesture() {
    if (waitingForGesture) return;
    waitingForGesture = true;
    GESTURE_EVENTS.forEach((eventName) => document.addEventListener(eventName, onGesture, GESTURE_OPTIONS));
  }

  function stopWaitingForGesture() {
    if (!waitingForGesture) return;
    waitingForGesture = false;
    GESTURE_EVENTS.forEach((eventName) => document.removeEventListener(eventName, onGesture, GESTURE_OPTIONS));
  }

  // Browsers usually reject unmuted playback until the first user gesture; a rejection just waits for that gesture.
  function play() {
    if (!isSupported()) return Promise.resolve(false);
    if (!audio.paused) return Promise.resolve(true);
    stopFade();
    audio.volume = 0;
    let playAttempt;
    try {
      playAttempt = audio.play();
    } catch (error) {
      playAttempt = Promise.reject(error);
    }
    return Promise.resolve(playAttempt).then(() => {
      stopWaitingForGesture();
      fadeIn();
      return true;
    }, () => {
      // An earlier rejected attempt can settle after a later one already started, so only re-arm while still paused.
      if (audio.paused && !userPaused && isSupported()) waitForGesture();
      return false;
    });
  }

  function autoplay() {
    if (userPaused) return Promise.resolve(false);
    return play();
  }

  function start() {
    userPaused = false;
    resumeWhenVisible = false;
    return play();
  }

  function stop() {
    if (!audio) return;
    userPaused = true;
    resumeWhenVisible = false;
    stopWaitingForGesture();
    stopFade();
    audio.pause();
  }

  function toggle() {
    if (isPlaying()) stop();
    else start();
  }

  if (audio) {
    audio.loop = true;
    ['play', 'pause', 'ended', 'error'].forEach((eventName) => audio.addEventListener(eventName, notify));
    audio.addEventListener('error', stopWaitingForGesture);
    // Safety net in case a browser ignores `loop`.
    audio.addEventListener('ended', () => {
      if (userPaused) return;
      audio.currentTime = 0;
      play();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!isPlaying()) return;
        stopFade();
        audio.pause();
        resumeWhenVisible = true;
      } else if (resumeWhenVisible) {
        resumeWhenVisible = false;
        play();
      }
    });
  }

  app.music = Object.freeze({
    isSupported,
    autoplay,
    start,
    stop,
    toggle,
    isPlaying,
    onChange: (listener) => listeners.push(listener)
  });
})(window.MindxGift = window.MindxGift || {});
