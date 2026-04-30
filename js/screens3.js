/* screens3.js - Expenses, Groups, History, Settings */

/* ── Month State ── */
let spendMonth = { year: new Date().getFullYear(), month: new Date().getMonth() };

function prevSpendMonth() {
  spendMonth.month--;
  if (spendMonth.month < 0) { spendMonth.month = 11; spendMonth.year--; }
  App.route();
}
function nextSpendMonth() {
  const now = new Date();
  const isCurrentOrFuture = spendMonth.year > now.getFullYear() ||
    (spendMonth.year === now.getFullYear() && spendMonth.month >= now.getMonth());
  if (isCurrentOrFuture) return;
  spendMonth.month++;
  if (spendMonth.month > 11) { spendMonth.month = 0; spendMonth.year++; }
  App.route();
}

/* ── Trend Chart (last 6 months CSS bars) ── */
function renderTrendChart() {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = now.getMonth() - i;
    let y = now.getFullYear();
    while (m < 0) { m += 12; y--; }
    const total = Store.getMonthTotal(y, m);
    const label = new Date(y, m).toLocaleDateString('en-IN', { month: 'short' });
    const isSelected = y === spendMonth.year && m === spendMonth.month;
    months.push({ y, m, total, label, isSelected });
  }
  const max = Math.max(...months.map(x => x.total), 1);
  const bars = months.map(mo => {
    const pct = Math.max(4, Math.round((mo.total / max) * 100));
    const isNow = mo.y === now.getFullYear() && mo.m === now.getMonth();
    return `
      <div class="trend-col" data-action="go-spend-month" data-year="${mo.y}" data-month="${mo.m}" style="cursor:pointer">
        <div class="trend-val" style="color:${mo.isSelected ? 'var(--accent)' : 'var(--text-muted)'}">
          ${mo.total > 0 ? (mo.total >= 1000 ? Math.round(mo.total/1000)+'k' : Math.round(mo.total)) : ''}
        </div>
        <div class="trend-bar-wrap">
          <div class="trend-bar-fill ${mo.isSelected ? 'selected' : ''}" style="height:${pct}%"></div>
        </div>
        <div class="trend-label ${mo.isSelected ? 'selected' : ''}">${mo.label}${isNow ? ' ●' : ''}</div>
      </div>`;
  }).join('');
  return `
    <div class="section">
      <div class="section-title">6-Month Trend</div>
      <div class="glass" style="padding:18px 16px 12px;border-radius:16px">
        <div class="trend-chart">${bars}</div>
      </div>
    </div>`;
}

/* ── Category Breakdown ── */
function renderCategoryBreakdown(mExps, mTotal) {
  const cats = {};
  mExps.forEach(e => { const c = e.category || 'other'; cats[c] = (cats[c] || 0) + e.amount; });
  if (!Object.keys(cats).length) return '';
  let html = '';
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, amt]) => {
    const pct = mTotal > 0 ? Math.round(amt / mTotal * 100) : 0;
    html += `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div class="li-avatar pink" style="width:38px;height:38px;flex-shrink:0">${catIcon(c)}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
            <span style="font-weight:600">${CAT_LABELS[c] || c}</span>
            <span style="color:var(--red);font-weight:700">${formatCurrency(amt)}</span>
          </div>
          <div class="emi-bar">
            <div class="emi-bar-fill" style="width:${pct}%;background:var(--accent-g)"></div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:3px">${pct}% of total</div>
        </div>
      </div>`;
  });
  return `<div class="section"><div class="section-title">Where It Went</div><div class="form-preview">${html}</div></div>`;
}

/* ── Expenses List for Selected Month ── */
function renderExpensesList(mExps) {
  if (!mExps.length) return '';
  const sorted = [...mExps].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  let h = '';
  sorted.forEach((e, i) => {
    h += `<div class="list-item glass fade-in" style="animation-delay:${i * 0.03}s">
      <div class="li-avatar pink">${catIcon(e.category)}</div>
      <div class="li-info">
        <div class="li-name">${esc(e.name)}</div>
        <div class="li-sub">${CAT_LABELS[e.category] || e.category || 'Other'} · ${formatDateShort(e.date || e.createdAt)}</div>
      </div>
      <div class="li-right">
        <div class="li-amount red">${formatCurrency(e.amount)}</div>
        <button class="modal-close" style="margin-top:4px" data-action="delete-expense" data-id="${e.id}">${ICO.x}</button>
      </div>
    </div>`;
  });
  return `<div class="section"><div class="section-title">All Expenses <span style="color:var(--text-muted);font-weight:400;font-size:12px">${mExps.length} entries</span></div><div class="list-card glass">${h}</div></div>`;
}

/* ── Main Expenses Screen ── */
function renderExpenses() {
  const { year, month } = spendMonth;
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const mExps = Store.getMonthExpenses(year, month);
  const mTotal = mExps.reduce((s, e) => s + e.amount, 0);
  const salary = Store.getSalary();
  const monthLabel = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const canGoNext = !isCurrentMonth;

  const groups = Store.getGroups();
  let grpHtml = '';
  groups.forEach((g, i) => {
    const total = Store.getGroupTotal(g.id), exps = Store.getExpensesByGroup(g.id);
    const ucats = [...new Set(exps.map(e => e.category || 'other'))];
    grpHtml += `<div class="trip-card glass fade-in" style="animation-delay:${i * .05}s" data-action="view-group" data-id="${g.id}">
      <div class="tc-header"><div class="tc-name">${esc(g.name)}</div><div class="tc-amount">${formatCurrency(total)}</div></div>
      <div class="tc-meta">${exps.length} item${exps.length !== 1 ? 's' : ''} · ${formatDateShort(g.createdAt)}</div>
      <div class="tc-tags">${ucats.slice(0, 4).map(c => `<span class="tag">${CAT_LABELS[c] || c}</span>`).join('')}</div>
    </div>`;
  });

  return `
    <div class="page-header fade-in" style="margin-bottom:16px">
      <h1>My Spends</h1>
    </div>

    <!-- Month Picker -->
    <div class="month-picker glass fade-in">
      <button class="month-nav-btn" data-action="prev-spend-month">${ICO.back}</button>
      <div class="month-picker-label">
        <div class="month-name">${monthLabel}</div>
        ${isCurrentMonth ? '<div class="month-tag">Current</div>' : ''}
      </div>
      <button class="month-nav-btn ${canGoNext ? '' : 'disabled'}" data-action="next-spend-month" ${canGoNext ? '' : 'disabled'}>${ICO.chevron}</button>
    </div>

    <!-- Stats -->
    <div class="stats-row" style="margin-top:16px">
      <div class="stat-card red fade-in">
        <div class="stat-label">Spent</div>
        <div class="stat-value">${formatCurrency(mTotal)}</div>
        ${mTotal > 0 ? `<div class="stat-sub">${Object.keys(Object.fromEntries(mExps.map(e => [e.category || 'other', 1]))).length} categories</div>` : '<div class="stat-sub">Nothing yet</div>'}
      </div>
      ${salary > 0 && isCurrentMonth ? `<div class="stat-card green fade-in">
        <div class="stat-label">Budget Left</div>
        <div class="stat-value">${formatCurrency(Math.max(0, salary - mTotal - Store.getMonthlyEMIOutflow()))}</div>
        <div class="stat-sub">${Math.round(Math.max(0, (salary - mTotal - Store.getMonthlyEMIOutflow()) / salary * 100))}% remaining</div>
      </div>` : ''}
    </div>

    <!-- Trend Chart -->
    ${renderTrendChart()}

    <!-- Category Breakdown -->
    ${renderCategoryBreakdown(mExps, mTotal)}

    <!-- Expenses List -->
    ${renderExpensesList(mExps)}

    <!-- Groups -->
    <div class="section">
      <div class="section-title">Groups <button class="btn-inline" data-action="modal-group" style="font-size:12px;padding:7px 14px;cursor:pointer">+ New</button></div>
      ${grpHtml || `<div class="empty-state"><div class="empty-icon">${ICO.wallet}</div><h3>No groups yet</h3><p>Create one to organize expenses.<br>Trips, monthly budgets, anything.</p></div>`}
    </div>

    <!-- Add Expense Button -->
    <button class="btn-submit purple fade-in" style="margin-top:24px" data-action="modal-expense">+ Add Expense</button>
  `;
}

function renderGroupDetail(id){
  const g=Store.getGroup(id);
  if(!g) return `<div class="empty-state"><h3>Group not found</h3><p>It's gone. Just like your financial discipline.</p></div>`;
  const exps=Store.getExpensesByGroup(id).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
  const total=exps.reduce((s,e)=>s+e.amount,0);
  let listH='';
  exps.forEach((e,i)=>{listH+=`<div class="list-item glass fade-in" style="animation-delay:${i*.03}s"><div class="li-avatar pink">${catIcon(e.category)}</div><div class="li-info"><div class="li-name">${esc(e.name)}</div><div class="li-sub">${CAT_LABELS[e.category]||e.category||'Other'} · ${formatDateShort(e.date||e.createdAt)}</div></div><div class="li-right"><div class="li-amount red">${formatCurrency(e.amount)}</div><button class="modal-close" style="margin-top:4px" data-action="delete-expense" data-id="${e.id}" data-group="${id}">${ICO.x}</button></div></div>`});
  if(!listH) listH=`<div class="empty-state"><p>No expenses added yet. Enjoy the silence.</p></div>`;
  return `<button class="back-btn" data-action="go" data-href="#/expenses">${ICO.back} Spends</button>
  <div class="page-header fade-in"><h1>${esc(g.name)}</h1><p class="subtitle">Total: <strong style="color:var(--red)">${formatCurrency(total)}</strong></p></div>
  <button class="btn-submit purple" style="margin-bottom:14px" data-action="modal-expense" data-group="${id}">+ Add Expense</button>
  <div class="list-card glass">${listH}</div>
  <button class="btn-danger" data-action="delete-group" data-id="${id}">Delete Group</button>`;
}

function renderHistory(){
  const all=Store.getRecentActivity(50);
  let h='';
  all.forEach((a,i)=>{
    const d=i*.02, person=Store.getPerson(a.personId), pn=person?esc(person.name):'Unknown';
    if(a.actType==='tx'){
      const ico=a.type==='CARD_PURCHASE'?ICO.card:a.type==='CASH_LENT'?ICO.cashLent:ICO.handshake;
      const c=a.type==='BORROWED'?'blue':'red';
      const lbl=a.type==='CARD_PURCHASE'?esc(a.productName):a.type==='CASH_LENT'?'Cash lent':'Borrowed';
      h+=`<div class="list-item glass fade-in" style="animation-delay:${d}s" data-action="${a.type==='CARD_PURCHASE'?'view-tx':'view-person'}" data-id="${a.type==='CARD_PURCHASE'?a.id:a.personId}"><div class="li-avatar ${c}">${ico}</div><div class="li-info"><div class="li-name">${lbl}</div><div class="li-sub">${pn}${a.cardName?' · '+esc(a.cardName):''}</div></div><div class="li-right"><div class="li-amount ${c}">${formatCurrency(a.amount)}</div><div class="li-time">${timeAgo(a.sortDate)}</div></div></div>`;
    } else {
      h+=`<div class="list-item glass fade-in" style="animation-delay:${d}s"><div class="li-avatar green">${ICO.payment}</div><div class="li-info"><div class="li-name">Payment received</div><div class="li-sub">${pn}</div></div><div class="li-right"><div class="li-amount green">${formatCurrency(a.amount)}</div><div class="li-time">${timeAgo(a.sortDate)}</div></div></div>`;
    }
  });
  if(!h) h=`<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.emptybox}</div><h3>No history</h3><p>Your financial story hasn't started yet. Lucky you.</p></div>`;
  return `<div class="page-header fade-in"><h1>History</h1></div><div class="list-card glass">${h}</div>`;
}

function renderSubscriptions(){
  const subs=Store.getSubscriptions();
  let h='';
  subs.forEach((s,i)=>{
    h+=`<div class="list-item glass fade-in" style="animation-delay:${i*.04}s"><div class="li-avatar purple">${ICO.sync}</div><div class="li-info"><div class="li-name">${esc(s.name)}</div><div class="li-sub">Every ${s.day}${s.day===1||s.day===21||s.day===31?'st':s.day===2||s.day===22?'nd':s.day===3||s.day===23?'rd':'th'}</div></div><div class="li-right"><div class="li-amount red">${formatCurrency(s.amount)}</div><button class="modal-close" style="margin-top:4px" data-action="delete-sub" data-id="${s.id}">${ICO.x}</button></div></div>`;
  });
  if(!h) h=`<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.ghost}</div><h3>No Subscriptions</h3><p>Your wallet is safe. For now.</p></div>`;
  return `<button class="back-btn" data-action="go" data-href="#/settings">${ICO.back} Settings</button>
  <div class="page-header fade-in"><h1>Subscriptions</h1><p class="subtitle">Auto-added to expenses</p></div>
  <button class="btn-submit purple" style="margin-bottom:16px" data-action="modal-sub">+ Add Subscription</button>
  <div class="list-card glass">${h}</div>`;
}

function renderSettings(){
  const sal=Store.getSalary();
  return `<div class="page-header fade-in"><h1>Settings</h1></div>
  <div class="list-card glass fade-in">
    <div class="list-item" data-action="toggle-theme"><div class="li-avatar" style="color:var(--accent)">${ICO.sync}</div><div class="li-info"><div class="li-name">Appearance</div><div class="li-sub">Switch between Light and Dark</div></div><div style="color:var(--text-muted)">${ICO.chevron}</div></div>
    <div class="list-item" data-action="modal-salary"><div class="li-avatar" style="color:var(--green)">${ICO.salary}</div><div class="li-info"><div class="li-name">Monthly Salary</div><div class="li-sub">${sal>0?formatCurrency(sal):'Not configured'}</div></div><div style="color:var(--text-muted)">${ICO.chevron}</div></div>
    <div class="list-item" data-action="go" data-href="#/subscriptions"><div class="li-avatar" style="color:var(--red)">${ICO.sync}</div><div class="li-info"><div class="li-name">Subscriptions</div><div class="li-sub">Manage recurring bills</div></div><div style="color:var(--text-muted)">${ICO.chevron}</div></div>
  </div>
  <div class="list-card glass fade-in" style="margin-top:24px">
    <div class="list-item" data-action="export-data"><div class="li-avatar" style="color:var(--blue)">${ICO.upload}</div><div class="li-info"><div class="li-name">Export Data</div><div class="li-sub">Download backup as JSON</div></div><div style="color:var(--text-muted)">${ICO.chevron}</div></div>
    <label class="list-item" style="cursor:pointer"><div class="li-avatar" style="color:var(--green)">${ICO.download}</div><div class="li-info"><div class="li-name">Import Data</div><div class="li-sub">Restore from backup</div></div><div style="color:var(--text-muted)">${ICO.chevron}</div><input type="file" accept=".json" id="import-file-input" style="display:none"></label>
  </div>
  <div class="list-card glass fade-in" style="margin-top:24px">
    <button class="list-item" data-action="clear-all" style="width:100%;text-align:left;background:none;border:none;font-family:inherit;cursor:pointer;color:inherit"><div class="li-avatar" style="color:var(--red)">${ICO.trash}</div><div class="li-info"><div class="li-name" style="color:var(--red)">Clear All Data</div><div class="li-sub">Permanently delete everything</div></div><div style="color:var(--text-muted)">${ICO.chevron}</div></button>
  </div>
  <div style="text-align:center;margin-top:32px;color:var(--text-muted);font-size:11px;padding-bottom:40px"><p style="font-weight:600">BrokeCore v2.0</p><p style="margin-top:4px">Developed with ❤️ from Naveen</p><p style="margin-top:8px;font-style:italic">"Money can't buy happiness, but tracking where it went is therapeutic."</p></div>`;
}
