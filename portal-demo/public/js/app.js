// 9KOS — Shared JavaScript Utilities

// ── Reveal on scroll ──────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

// ── Toast ──────────────────────────────────────
function showToast(title, msg, duration = 4000) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<div class="toast-icon">◆</div><div><div class="toast-title"></div><div class="toast-msg"></div></div>`;
    document.body.appendChild(el);
  }
  el.querySelector('.toast-title').textContent = title;
  el.querySelector('.toast-msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}

// ── Modal ──────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}
function initModals() {
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) closeModal(el.closest('.modal-overlay')?.id || el.dataset.close);
    });
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
}

// ── Nav ───────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-mobile-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('menu-open'));
  }
  // Active link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

// ── Form handler ──────────────────────────────
function handleForm(formEl, successTitle, successMsg) {
  if (!formEl) return;
  formEl.addEventListener('submit', e => {
    e.preventDefault();
    const btn = formEl.querySelector('[type=submit]');
    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      formEl.reset();
      showToast(successTitle, successMsg);
    }, 1200);
  });
}

// ── Ticket storage ────────────────────────────
const TicketDB = {
  getAll() {
    try { return JSON.parse(localStorage.getItem('9kos_tickets') || '[]'); } catch { return []; }
  },
  save(tickets) {
    localStorage.setItem('9kos_tickets', JSON.stringify(tickets));
  },
  add(ticket) {
    const all = this.getAll();
    ticket.id = 'TKT-' + String(Date.now()).slice(-6);
    ticket.created = new Date().toISOString();
    ticket.status = 'open';
    ticket.messages = [{ from: 'client', text: ticket.description, ts: ticket.created }];
    all.unshift(ticket);
    this.save(all);
    return ticket;
  },
  update(id, data) {
    const all = this.getAll();
    const idx = all.findIndex(t => t.id === id);
    if (idx > -1) { all[idx] = { ...all[idx], ...data }; this.save(all); return all[idx]; }
    return null;
  },
  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  }
};

// ── Init on DOMContentLoaded ──────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initNav();
  initModals();
});
