(function (app) {
  'use strict';

  const TARGET_VOLUME = 0.6;
  const FADE_IN_MS = 1500;
  const FADE_STEP_MS = 50;
  const AAC_TYPE = 'audio/mp4; codecs="mp4a.40.2"';

  const audio = document.getElementById('bg-music');
  const listeners = [];
  let fadeTimer = 0;
  let prepared = false;
  let resumeWhenVisible = false;

  function isSupported() {
    return Boolean(audio && typeof audio.play === 'function' && audio.canPlayType(AAC_TYPE));
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

  function prepare() {
    if (prepared || !isSupported()) return;
    prepared = true;
    audio.preload = 'auto';
    audio.load();
  }

  // Must be called synchronously from a user gesture (click/tap) for mobile autoplay rules.
  function start() {
    if (!isSupported()) return Promise.resolve(false);
    resumeWhenVisible = false;
    stopFade();
    audio.volume = 0;
    let playAttempt;
    try {
      playAttempt = audio.play();
    } catch (error) {
      playAttempt = Promise.reject(error);
    }
    return Promise.resolve(playAttempt).then(() => {
      fadeIn();
      return true;
    }, () => {
      stopFade();
      if (!audio.paused) audio.pause();
      notify();
      return false;
    });
  }

  function stop() {
    if (!audio) return;
    resumeWhenVisible = false;
    stopFade();
    audio.pause();
  }

  function toggle() {
    if (isPlaying()) stop();
    else start();
  }

  if (audio) {
    ['play', 'pause', 'ended', 'error'].forEach((eventName) => audio.addEventListener(eventName, notify));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!isPlaying()) return;
        stopFade();
        audio.pause();
        resumeWhenVisible = true;
      } else if (resumeWhenVisible) {
        start();
      }
    });
  }

  app.music = Object.freeze({
    isSupported,
    prepare,
    start,
    stop,
    toggle,
    isPlaying,
    onChange: (listener) => listeners.push(listener)
  });
})(window.MindxGift = window.MindxGift || {});
