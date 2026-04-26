/* screens3.js - Expenses, Groups, History, Settings */
function renderExpenses(){
  const groups=Store.getGroups(), now=new Date();
  const mTotal=Store.getMonthTotal(now.getFullYear(),now.getMonth());
  const mExps=Store.getMonthExpenses(now.getFullYear(),now.getMonth());
  const salary=Store.getSalary();
  const cats={};
  mExps.forEach(e=>{const c=e.category||'other';cats[c]=(cats[c]||0)+e.amount});
  let catHtml='';
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([c,amt])=>{
    const pct=mTotal>0?Math.round(amt/mTotal*100):0;
    catHtml+=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div class="li-avatar pink" style="width:36px;height:36px">${catIcon(c)}</div><div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="font-weight:600">${CAT_LABELS[c]||c}</span><span style="color:var(--red);font-weight:700">${formatCurrency(amt)}</span></div><div class="emi-bar"><div class="emi-bar-fill" style="width:${pct}%;background:var(--accent-g)"></div></div></div></div>`;
  });
  let grpHtml='';
  groups.forEach((g,i)=>{
    const total=Store.getGroupTotal(g.id), exps=Store.getExpensesByGroup(g.id);
    const ucats=[...new Set(exps.map(e=>e.category||'other'))];
    grpHtml+=`<div class="trip-card glass fade-in" style="animation-delay:${i*.05}s" data-action="view-group" data-id="${g.id}"><div class="tc-header"><div class="tc-name">${esc(g.name)}</div><div class="tc-amount">${formatCurrency(total)}</div></div><div class="tc-meta">${exps.length} item${exps.length!==1?'s':''} · ${formatDateShort(g.createdAt)}</div><div class="tc-tags">${ucats.slice(0,4).map(c=>`<span class="tag">${CAT_LABELS[c]||c}</span>`).join('')}</div></div>`;
  });
  return `<div class="page-header fade-in"><h1>My Spends</h1><p class="subtitle">${new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</p></div>
  <div class="stats-row"><div class="stat-card red fade-in"><div class="stat-label">This Month</div><div class="stat-value">${formatCurrency(mTotal)}</div>${mTotal>0?`<div class="stat-sub">${Object.keys(cats).length} categories</div>`:''}</div>
  ${salary>0?`<div class="stat-card green fade-in"><div class="stat-label">Budget Left</div><div class="stat-value">${formatCurrency(Math.max(0,salary-mTotal-Store.getMonthlyEMIOutflow()))}</div></div>`:''}</div>
  ${catHtml?`<div class="section"><div class="section-title">Where it went</div><div class="form-preview">${catHtml}</div></div>`:''}
  <div class="section"><div class="section-title">Groups<button class="btn-inline" data-action="modal-group" style="font-size:12px;padding:7px 14px;cursor:pointer">+ New Group</button></div>
  ${grpHtml||`<div class="empty-state"><div class="empty-icon">${ICO.wallet}</div><h3>No groups yet</h3><p>Create one to organize expenses.<br>Trips, monthly budgets, anything.</p></div>`}</div>`;
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
