/**
 * ui.js — Cascadia Collection UI behaviors
 * ----------------------------------------------------------------
 * Responsibilities:
 *   - Render the inventory grid from window.VEHICLES
 *   - Open/close the vehicle detail modal
 *   - Filter bar behavior
 *   - Contact form submission handling
 *
 * No dependencies beyond the DOM and window.VEHICLES.
 */

(function () {
  'use strict';

  // ============== Utilities ==============

  /** Format a price as USD. Returns null for null input. */
  function formatPrice(p) {
    return typeof p === 'number' ? '$' + p.toLocaleString('en-US') : null;
  }

  /** Format mileage. */
  function formatMiles(m) {
    return m.toLocaleString('en-US') + ' mi';
  }

  /** HTML-escape a string — basic XSS safety when writing innerHTML. */
  function escape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Quick short engine spec (e.g. "V8", "W12") for card. */
  function shortEngine(engine) {
    const words = engine.split(' ');
    return words.slice(-2).join(' ');
  }

  // ============== Inventory rendering ==============

  /**
   * Build the HTML for one vehicle card.
   * Note: IntersectionObserver reveal class is added; app.js observes.
   */
  function cardHTML(v) {
    const priceEl = v.price
      ? `<div class="vehicle-price">${escape(formatPrice(v.price))}</div>`
      : `<div class="vehicle-price inquire">
           <span class="inquire-label">Call for Price</span>
           <span class="inquire-phone">(206) 800-7215</span>
         </div>`;

    const imgContent = v.img
      ? `<img src="${escape(v.img)}" alt="${escape(v.year + ' ' + v.make + ' ' + v.model)}" loading="lazy" />`
      : `<div class="vehicle-placeholder">
           <div class="mark">${escape(v.make.charAt(0))}</div>
           <div class="label">Photography in progress</div>
         </div>`;

    const tag = v.tag ? `<div class="vehicle-tag">◆ ${escape(v.tag)}</div>` : '';

    const href = `inventory/${escape(v.id)}.html`;
    const label = `${escape(v.year)} ${escape(v.make)} ${escape(v.model)} ${escape(v.trim)}`;
    return `
      <article class="vehicle-card reveal" data-id="${escape(v.id)}">
        <a class="vehicle-card-link" href="${href}" aria-label="${label}">
          <div class="vehicle-img-wrap">
            ${tag}
            <div class="vehicle-stock">STK · ${escape(v.stock)}</div>
            ${imgContent}
            <button type="button" class="vehicle-card-quick" data-quick="${escape(v.id)}" aria-label="Quick view ${label}">Quick view</button>
          </div>
          <div class="vehicle-meta">
            <div class="vehicle-meta-left">
              <div class="vehicle-year">${escape(v.year)} · ${escape(v.body)}</div>
              <div class="vehicle-name">${escape(v.make)} ${escape(v.model)}</div>
              <div class="vehicle-trim">${escape(v.trim)}</div>
            </div>
            ${priceEl}
          </div>
          <div class="vehicle-specs">
            <span>${escape(formatMiles(v.mileage))}</span>
            <span>${escape(v.drivetrain)}</span>
            <span>${escape(shortEngine(v.engine))}</span>
          </div>
          <div class="vehicle-card-actions">
            <span class="vehicle-card-view">View Details →</span>
          </div>
        </a>
      </article>
    `;
  }

  function sortList(list, mode) {
    const arr = list.slice();
    const priceOrMax = (v) => (typeof v.price === 'number' ? v.price : Number.MAX_SAFE_INTEGER);
    const priceOrMin = (v) => (typeof v.price === 'number' ? v.price : -1);
    switch (mode) {
      case 'price-desc': return arr.sort((a, b) => priceOrMin(b) - priceOrMin(a));
      case 'price-asc':  return arr.sort((a, b) => priceOrMax(a) - priceOrMax(b));
      case 'year-desc':  return arr.sort((a, b) => b.year - a.year);
      case 'miles-asc':  return arr.sort((a, b) => a.mileage - b.mileage);
      default: return arr;
    }
  }

  /**
   * Render the full inventory with optional marque/body filter.
   * @param {string} filter - 'all' or a category slug
   */
  let currentFilter = 'all';
  let currentSort = 'curated';

  function renderInventory(filter, sort) {
    if (filter) currentFilter = filter;
    if (sort) currentSort = sort;
    const container = document.getElementById('inventory');
    if (!container) return;

    const filtered = currentFilter === 'all'
      ? window.VEHICLES
      : window.VEHICLES.filter((v) => v.category.includes(currentFilter));
    const list = sortList(filtered, currentSort);

    // Update visible count badge (e.g. "Showing 3 of 7")
    const count = document.getElementById('inventoryCount');
    if (count) {
      count.textContent = list.length === window.VEHICLES.length
        ? `${list.length} available`
        : `${list.length} of ${window.VEHICLES.length}`;
    }

    // Empty-state messaging
    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: span 12; padding: 80px 0; text-align:center; color: var(--mist); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.2em; text-transform:uppercase;">
          No vehicles match that filter.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(cardHTML).join('');
    container.setAttribute('aria-busy', 'false');

    // Cinematic stagger — each card reveals 80ms after the previous.
    // Capped at ~10 to avoid noticeable lag on large filter resets.
    container.querySelectorAll('.vehicle-card').forEach((el, i) => {
      el.style.transitionDelay = Math.min(i, 10) * 80 + 'ms';
    });

    // Fade each photograph in the moment its bytes arrive — no half-loaded flashes.
    container.querySelectorAll('.vehicle-img-wrap img').forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
      }
    });

    // Quick-view opens modal without leaving the page.
    // The card itself is a real <a> → full VDP — crawlable + right-clickable.
    container.querySelectorAll('[data-quick]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(btn.dataset.quick);
      });
    });

    // Re-trigger the reveal observer (cards are new DOM)
    if (window._cascadia && window._cascadia.observeReveals) {
      window._cascadia.observeReveals();
    }
  }

  // ============== Modal ==============

  function openModal(id) {
    const v = window.VEHICLES.find((x) => x.id === id);
    if (!v) return;

    const backdrop = document.getElementById('modalBackdrop');
    const modal = document.getElementById('modal');
    const imgEl = document.getElementById('modalImg');
    const bodyEl = document.getElementById('modalBody');

    const imgHTML = v.img
      ? `<img src="${escape(v.img)}" alt="${escape(v.year + ' ' + v.make + ' ' + v.model)}" />`
      : `<div class="vehicle-placeholder" style="position:absolute;inset:0;z-index:1;">
           <div class="mark" style="font-size:80px;">${escape(v.make.charAt(0))}</div>
           <div class="label">Photography in progress</div>
         </div>`;

    imgEl.innerHTML = `
      <button class="modal-close" aria-label="Close" data-action="close">✕</button>
      ${imgHTML}
    `;

    const priceHTML = v.price
      ? `<div class="price">${escape(formatPrice(v.price))}</div>`
      : `<div class="price inquire">Price upon request</div>`;

    bodyEl.innerHTML = `
      <div class="modal-head">
        <div>
          <span class="year-trim">${escape(v.year)} · Stock #${escape(v.stock)} · VIN ${escape(v.vin)}</span>
          <h2 id="modalTitle">
            ${escape(v.make)} ${escape(v.model)}<br/>
            <em style="font-style:italic;color:var(--brass);font-variation-settings:'opsz' 144,'SOFT' 80;">${escape(v.trim)}</em>
          </h2>
        </div>
        ${priceHTML}
      </div>

      <div class="modal-specs">
        <div class="spec"><div class="label">Mileage</div><div class="value">${escape(formatMiles(v.mileage))}</div></div>
        <div class="spec"><div class="label">Engine</div><div class="value">${escape(v.engine)}</div></div>
        <div class="spec"><div class="label">Drivetrain</div><div class="value">${escape(v.drivetrain)}</div></div>
        <div class="spec"><div class="label">Transmission</div><div class="value">${escape(v.transmission)}</div></div>
        <div class="spec"><div class="label">Body</div><div class="value">${escape(v.body)}</div></div>
        <div class="spec"><div class="label">Doors</div><div class="value">${escape(v.doors)}</div></div>
        <div class="spec"><div class="label">Fuel</div><div class="value">${escape(v.fuel)}</div></div>
        <div class="spec"><div class="label">Year</div><div class="value">${escape(v.year)}</div></div>
      </div>

      <p class="modal-desc">${escape(v.description)}</p>

      <div class="modal-actions">
        <a href="tel:2068007215" class="btn-primary">
          <span>Call About This Car</span>
          <span class="arrow">→</span>
        </a>
        <a href="inventory/${escape(v.id)}.html" class="btn-ghost">View full details ↗</a>
        <button type="button" class="btn-ghost" data-action="close-and-scroll">Request a viewing</button>
      </div>
    `;

    // Bind close actions
    imgEl.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    bodyEl.querySelector('[data-action="close-and-scroll"]').addEventListener('click', () => {
      closeModal();
      // Pre-fill the contact form's vehicle selector
      const sel = document.getElementById('vehicle');
      if (sel) sel.value = v.id;
      setTimeout(() => {
        document.getElementById('visit').scrollIntoView({ behavior: 'smooth' });
      }, 250);
    });

    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Move focus into modal for accessibility
    modal.focus();
    // Reset scroll position in modal
    modal.scrollTop = 0;
  }

  function closeModal() {
    const backdrop = document.getElementById('modalBackdrop');
    const modal = document.getElementById('modal');
    backdrop.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============== Filters ==============

  function bindFilters() {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        renderInventory(btn.dataset.filter);
      });
    });
    const sortSel = document.getElementById('inventorySort');
    if (sortSel) {
      sortSel.addEventListener('change', () => renderInventory(null, sortSel.value));
    }
  }

  // ============== Form ==============

  /**
   * Handle contact form submission.
   * By default this simulates a send. To wire to a real backend:
   *   1. Set up an endpoint (Formspree, Basin, Resend, your own API)
   *   2. Replace the setTimeout() block with a fetch() POST
   */
  /**
   * Submit to Formspree if an endpoint is configured on the <form> via
   *   <form data-endpoint="https://formspree.io/f/XXXX" ...>
   * Otherwise falls back to a simulated success so the UI is still testable.
   *
   * Honeypot: a hidden <input name="_gotcha"> catches bots that fill every field.
   * If it's non-empty on submit, we silently pretend-success and drop the request.
   */
  function bindForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('formStatus');
      const submit = form.querySelector('.form-submit');
      const endpoint = form.dataset.endpoint;
      const honey = form.querySelector('[name="_gotcha"]');

      status.textContent = 'Sending…';
      submit.disabled = true;

      // Bot — silently drop.
      if (honey && honey.value) {
        setTimeout(() => {
          status.textContent = '✓ Thank you — we will be in touch shortly.';
          form.reset();
          submit.disabled = false;
        }, 700);
        return;
      }

      const finish = (ok) => {
        status.textContent = ok
          ? '✓ Thank you — we will be in touch shortly.'
          : '✗ Something went wrong. Please call (206) 800-7215.';
        if (ok) form.reset();
        submit.disabled = false;
        setTimeout(() => { status.textContent = ''; }, 6000);
      };

      // No endpoint wired yet → simulate so the UI still works locally.
      if (!endpoint || endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        setTimeout(() => finish(true), 700);
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then((res) => finish(res.ok))
        .catch(() => finish(false));
    });
  }

  /**
   * Populate the vehicle <select> from VEHICLES so the dropdown never drifts
   * from the inventory data. Also supports prefill via ?vehicle=<id> on the URL
   * (used by VDP pages linking back to the home contact form).
   */
  function populateVehicleSelect() {
    const sel = document.getElementById('vehicle');
    if (!sel) return;
    const keep = sel.querySelector('option[value=""]');
    sel.innerHTML = '';
    if (keep) sel.appendChild(keep);
    window.VEHICLES.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.year + ' ' + v.make + ' ' + v.model + (v.trim ? ' ' + v.trim : '');
      sel.appendChild(opt);
    });
    const general = document.createElement('option');
    general.value = 'general';
    general.textContent = 'General inquiry / sourcing';
    sel.appendChild(general);

    // Prefill from ?vehicle=<id>
    const params = new URLSearchParams(window.location.search);
    const pref = params.get('vehicle');
    if (pref && [...sel.options].some((o) => o.value === pref)) {
      sel.value = pref;
    }
  }

  // ============== Public API ==============

  window._cascadiaUI = {
    renderInventory: renderInventory,
    openModal: openModal,
    closeModal: closeModal,
    bindFilters: bindFilters,
    bindForm: bindForm,
    populateVehicleSelect: populateVehicleSelect,
  };
})();
