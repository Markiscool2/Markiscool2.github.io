/**
 * vdp.js — Vehicle Detail Page gallery lightbox.
 * Click any .vdp-gallery image to open fullscreen; arrow keys / swipe
 * navigate; Esc or click outside closes.
 */
(function () {
  'use strict';
  var gallery = document.querySelector('.vdp-gallery');
  if (!gallery) return;

  var imgs = Array.prototype.slice.call(gallery.querySelectorAll('img'));
  if (!imgs.length) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  var svgClose = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var svgPrev  = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  var svgNext  = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  overlay.innerHTML =
    '<button class="lightbox-close" aria-label="Close">' + svgClose + '</button>' +
    '<button class="lightbox-nav lightbox-prev" aria-label="Previous image">' + svgPrev + '</button>' +
    '<button class="lightbox-nav lightbox-next" aria-label="Next image">' + svgNext + '</button>' +
    '<img class="lightbox-img" alt="" />' +
    '<div class="lightbox-count" aria-live="polite"></div>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector('.lightbox-img');
  var countEl = overlay.querySelector('.lightbox-count');
  var current = 0;

  function show(i) {
    current = (i + imgs.length) % imgs.length;
    imgEl.src = imgs[current].src;
    imgEl.alt = imgs[current].alt || '';
    countEl.textContent = (current + 1) + ' / ' + imgs.length;
  }
  function open(i) {
    show(i);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  imgs.forEach(function (img, i) {
    img.addEventListener('click', function () { open(i); });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target === imgEl) close();
  });
  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  overlay.querySelector('.lightbox-prev').addEventListener('click', function (e) {
    e.stopPropagation();
    show(current - 1);
  });
  overlay.querySelector('.lightbox-next').addEventListener('click', function (e) {
    e.stopPropagation();
    show(current + 1);
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  // Touch swipe
  var startX = null;
  overlay.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) startX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = (e.changedTouches[0].clientX) - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
