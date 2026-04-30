/* app.js — Main SPA controller for BrokeCore */
const App = {
  init() {
    this.initTheme();
    window.addEventListener('hashchange', () => this.route());

    // Single delegated click handler — bubble phase, attached to body
    document.body.addEventListener('click', e => this.handleClick(e));

    // File import
    document.addEventListener('change', e => {
      if (e.target.id === 'import-file-input') this.handleImport(e.target);
    });

    Store.processSubscriptions();
    this.renderTabs();
    if (!window.location.hash) window.location.hash = '#/';
    else this.route();
  },

  renderTabs() {
    const t = document.getElementById('tab-bar');
    if (!t) return;
    t.innerHTML = `
      <a href="#/" class="tab" data-tab="#/">${ICO.home}<span>Home</span></a>
      <a href="#/people" class="tab" data-tab="#/people">${ICO.users}<span>People</span></a>
      <a href="#/expenses" class="tab" data-tab="#/expenses">${ICO.expense}<span>Spends</span></a>
      <a href="#/history" class="tab" data-tab="#/history">${ICO.history}<span>History</span></a>
      <a href="#/settings" class="tab" data-tab="#/settings">${ICO.settings}<span>More</span></a>
    `;
  },

  // Deferred confirm — avoids browser blocking native dialogs mid-click-event
  _confirm(msg, onYes) {
    setTimeout(() => { if (window.confirm(msg)) onYes(); }, 0);
  },

  _confirm2(msg1, msg2, onYes) {
    setTimeout(() => {
      if (window.confirm(msg1)) {
        setTimeout(() => { if (window.confirm(msg2)) onYes(); }, 0);
      }
    }, 0);
  },

  clearAll() {
    this._confirm2(
      '⚠️ This will permanently delete ALL your BrokeCore data.',
      '🚨 Last chance — this CANNOT be undone. Continue?',
      () => {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        window.location.hash = '#/';
        window.location.reload();
      }
    );
  },

  initTheme() {
    const saved = localStorage.getItem('pocket_ledger_theme');
    const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.body.className = (saved || pref) + '-theme';
  },

  toggleTheme() {
    const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    document.body.className = next + '-theme';
    localStorage.setItem('pocket_ledger_theme', next);
  },

  route() {
    const h = window.location.hash || '#/';
    const m = document.getElementById('main-content');

    // Update active tabs
    document.querySelectorAll('#tab-bar .tab').forEach(t => {
      const hr = t.getAttribute('href');
      t.classList.toggle('active', h === hr || (hr !== '#/' && h.startsWith(hr)));
    });
    if (h.startsWith('#/people/')) document.querySelector('.tab[href="#/people"]')?.classList.add('active');
    if (h.startsWith('#/group/')) document.querySelector('.tab[href="#/expenses"]')?.classList.add('active');
    if (h === '#/cashback') document.querySelector('.tab[href="#/"]')?.classList.add('active');

    // Render screen
    if (h === '#/')                    m.innerHTML = renderDashboard();
    else if (h === '#/people')         m.innerHTML = renderPeople();
    else if (h.startsWith('#/people/'))m.innerHTML = renderPersonDetail(h.split('/')[2]);
    else if (h === '#/cards')          m.innerHTML = renderCards();
    else if (h.startsWith('#/tx/'))    m.innerHTML = renderTxDetail(h.split('/')[2]);
    else if (h === '#/cashback')       m.innerHTML = renderCashback();
    else if (h === '#/expenses')       m.innerHTML = renderExpenses();
    else if (h.startsWith('#/group/')) m.innerHTML = renderGroupDetail(h.split('/')[2]);
    else if (h === '#/history')        m.innerHTML = renderHistory();
    else if (h === '#/subscriptions')  m.innerHTML = renderSubscriptions();
    else if (h === '#/settings')       m.innerHTML = renderSettings();

    m.scrollTop = 0;
  },

  handleClick(e) {
    // Modal backdrop close
    if (e.target.id === 'modal-overlay') { closeModal(); return; }

    // Find the action element
    const el = e.target.closest('[data-action]');
    if (!el) return;

    const a  = el.dataset.action;
    const id = el.dataset.id;

    switch (a) {
      // ── Navigation ─────────────────────────────────────────
      case 'go':          window.location.hash = el.dataset.href; break;
      case 'go-cashback': window.location.hash = '#/cashback'; break;
      case 'view-person': window.location.hash = '#/people/' + id; break;
      case 'view-tx':     window.location.hash = '#/tx/' + id; break;
      case 'view-group':  window.location.hash = '#/group/' + id; break;

      // ── Modals ──────────────────────────────────────────────
      case 'modal-card':    showCardPurchaseModal(el.dataset.person); break;
      case 'modal-lent':    showCashLentModal(el.dataset.person); break;
      case 'modal-borrow':  showBorrowModal(); break;
      case 'modal-pay':     showPaymentModal(el.dataset.person); break;
      case 'modal-pay-tx':  showPaymentModal(el.dataset.person, el.dataset.tx); break;
      case 'modal-add-card':showAddCardModal(); break;
      case 'modal-expense': showExpenseModal(el.dataset.group); break;
      case 'modal-group':   showGroupModal(); break;
      case 'modal-sub':     showSubModal(); break;
      case 'modal-salary':  showSalaryModal(); break;
      case 'close-modal':   closeModal(); break;

      // ── Month Navigation ────────────────────────────────────
      case 'prev-spend-month': prevSpendMonth(); break;
      case 'next-spend-month': nextSpendMonth(); break;
      case 'go-spend-month':
        spendMonth.year  = parseInt(el.dataset.year);
        spendMonth.month = parseInt(el.dataset.month);
        this.route();
        break;

      // ── Actions ─────────────────────────────────────────────
      case 'mark-cb':
        Store.updateTransaction(id, { cashbackReceived: true });
        this.route();
        break;

      // ── Deletions (deferred confirm to avoid browser blocking) ──
      case 'delete-person':
        this._confirm(
          `Delete ${el.dataset.name || 'this contact'} and ALL their transactions? This is permanent.`,
          () => { Store.deletePerson(id); window.location.hash = '#/people'; }
        );
        break;

      case 'delete-tx':
        this._confirm(
          'Delete this transaction? All payment records will also be deleted.',
          () => { Store.deleteTransaction(id); window.history.back(); }
        );
        break;

      case 'delete-payment':
        this._confirm(
          'Delete this payment record?',
          () => { Store.deletePayment(id); this.route(); }
        );
        break;

      case 'delete-card':
        this._confirm(
          'Remove this card? Existing transactions are unaffected.',
          () => { Store.deleteCard(id); this.route(); }
        );
        break;

      case 'delete-expense':
        this._confirm(
          'Delete this expense?',
          () => { Store.deleteExpense(id); this.route(); }
        );
        break;

      case 'delete-group':
        this._confirm(
          'Delete this group and all its expenses? No coming back.',
          () => { Store.deleteGroup(id); window.location.hash = '#/expenses'; }
        );
        break;

      case 'delete-sub':
        this._confirm(
          'Delete this subscription?',
          () => { Store.deleteSubscription(id); this.route(); }
        );
        break;

      case 'export-data':   this.handleExport(); break;
      case 'toggle-theme':  this.toggleTheme(); break;
      case 'clear-all':     this.clearAll(); break;
    }
  },

  handleExport() {
    const d = Store.exportData();
    const b = new Blob([d], { type: 'application/json' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = `brokecore-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  },

  handleImport(input) {
    const f = input.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
      if (Store.importData(e.target.result)) {
        alert('✅ Data restored successfully!');
        this.route();
      } else {
        alert('❌ Import failed. The file may be corrupted.');
      }
    };
    r.readAsText(f);
    // Reset so same file can be re-imported
    input.value = '';
  },
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
document.addEventListener('DOMContentLoaded', () => App.init());
