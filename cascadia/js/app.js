/**
 * app.js — Cascadia Collection entry point
 * ----------------------------------------------------------------
 * Handles: nav scroll state, mobile menu, scroll reveals,
 *          global keyboard shortcuts, year in footer,
 *          hero video resilience.
 */

(function () {
  'use strict';

  // ============== Scroll reveal (IntersectionObserver) ==============

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // Expose so ui.js can re-observe new cards after re-render
  window._cascadia = { observeReveals: observeReveals };

  // ============== Navigation scroll state ==============

  function bindNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const update = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ============== Mobile menu ==============

  function bindMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    const setOpen = (open) => {
      hamburger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));

    // Close on any link click inside menu
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });
  }

  // ============== Modal focus trap ==============

  function bindModalFocusTrap() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.classList.contains('active')) return;
      const focusable = modal.querySelectorAll(selector);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ============== Keyboard shortcuts ==============

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close modal if open
        if (window._cascadiaUI && document.getElementById('modal').classList.contains('active')) {
          window._cascadiaUI.closeModal();
        }
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          document.getElementById('hamburger').classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  }

  // ============== Modal backdrop click ==============

  function bindModalBackdrop() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return;
    backdrop.addEventListener('click', () => {
      if (window._cascadiaUI) window._cascadiaUI.closeModal();
    });
  }

  // ============== Hero video resilience ==============

  /**
   * Some browsers (particularly Safari on low-power mode, or when data-saver
   * is on) will block autoplay. If the video fails to play after a short
   * delay, hide it so the static gradient underneath looks intentional.
   */
  function bindHeroVideo() {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    const hideVideo = () => {
      video.style.display = 'none';
    };

    // Timeout fallback: if metadata hasn't loaded in 5s, hide
    const timeout = setTimeout(() => {
      if (video.readyState < 2) hideVideo();
    }, 5000);

    video.addEventListener('loadeddata', () => clearTimeout(timeout));
    video.addEventListener('error', hideVideo);

    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hideVideo();
    }

    // Attempt to play (some browsers require explicit call after JS load)
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        // Autoplay denied. The static gradient underneath is fine.
        hideVideo();
      });
    }
  }

  // ============== Footer year ==============

  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /**
   * Flip the nav status dot/label based on business hours (Mon-Sat, 9-6).
   * Gives first-time visitors an at-a-glance signal that the place is live.
   */
  function setOpenStatus() {
    const el = document.getElementById('navStatus');
    if (!el) return;
    const now = new Date();
    const day = now.getDay();                 // 0 = Sun ... 6 = Sat
    const hour = now.getHours() + now.getMinutes() / 60;
    const openToday = day >= 1 && day <= 6 && hour >= 9 && hour < 18;
    const label = el.querySelector('.label');
    if (openToday) {
      el.classList.remove('closed');
      if (label) label.textContent = 'Open now';
    } else {
      el.classList.add('closed');
      if (label) label.textContent = 'By appointment';
    }
  }

  // ============== Init ==============

  function init() {
    // Render inventory first so cards exist before we observe them
    if (window._cascadiaUI) {
      window._cascadiaUI.renderInventory('all');
      window._cascadiaUI.bindFilters();
      window._cascadiaUI.populateVehicleSelect();
      window._cascadiaUI.bindForm();
    }

    bindNav();
    bindMobileMenu();
    bindKeyboard();
    bindModalBackdrop();
    bindModalFocusTrap();
    bindHeroVideo();
    setYear();
    setOpenStatus();

    observeReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
