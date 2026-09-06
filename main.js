// ==========================================================================
// COLE.DEV — shared behavior across all pages
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initScrollReveal();
  initProjectFilters();
  initContactForm();
});

/* ---- Mobile nav toggle ---- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.route-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- Scroll reveal for cards/sections ---- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((t) => observer.observe(t));
}

/* ---- Projects page: filter tabs ---- */
function initProjectFilters() {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;

  const buttons = Array.from(filterBar.querySelectorAll('.filter-btn'));
  const cards = Array.from(document.querySelectorAll('[data-category]'));

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const categories = card.dataset.category.split(' ');
        const show = filter === 'all' || categories.includes(filter);
        card.hidden = !show;
      });
    });
  });
}

/* ---- Contact page: client-side validation ---- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: { el: form.querySelector('#name'), validate: (v) => v.trim().length >= 2, message: 'Enter your full name (2+ characters).' },
    email: {
      el: form.querySelector('#email'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Enter a valid email address.',
    },
    subject: { el: form.querySelector('#subject'), validate: (v) => v.trim().length >= 3, message: 'Give this a short subject line.' },
    message: { el: form.querySelector('#message'), validate: (v) => v.trim().length >= 20, message: 'Message needs at least 20 characters.' },
  };

  const status = document.getElementById('form-status');

  function validateField(key) {
    const field = fields[key];
    const errorEl = document.getElementById(`${key}-error`);
    const isValid = field.validate(field.el.value);
    field.el.setAttribute('aria-invalid', String(!isValid));
    if (errorEl) errorEl.textContent = isValid ? '' : field.message;
    return isValid;
  }

  Object.keys(fields).forEach((key) => {
    const el = fields[key].el;
    if (!el) return;
    el.addEventListener('blur', () => validateField(key));
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validateField(key);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const results = Object.keys(fields).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      status.textContent = 'Fix the highlighted fields and try sending again.';
      status.classList.add('is-visible', 'is-error');
      const firstInvalid = Object.keys(fields).find((k) => fields[k].el.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) fields[firstInvalid].el.focus();
      return;
    }

    status.classList.remove('is-error');
    status.textContent = 'Message sent — thanks. Expect a reply within 1–2 business days.';
    status.classList.add('is-visible');
    form.reset();
    Object.keys(fields).forEach((key) => fields[key].el.removeAttribute('aria-invalid'));
  });
}
