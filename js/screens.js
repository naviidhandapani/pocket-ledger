/* screens.js - Dashboard + People */
const EMPTY_MSGS = [
  "Nothing here. Just like your savings.",
  "Empty. Much like your wallet after EMI day.",
  "No records yet. Ignorance is bliss.",
  "Zero transactions. The calm before the storm."
];
const CAT_LABELS = {food:'Food',stay:'Stay',travel:'Travel',fuel:'Fuel',shopping:'Shopping',fun:'Fun',bills:'Bills',drinks:'Drinks',other:'Other'};
function catIcon(c){return ICO.cat[c]||ICO.cat.other;}
function rndEmpty(){return EMPTY_MSGS[Math.floor(Math.random()*EMPTY_MSGS.length)];}

function renderDashboard(){
  const t=Store.getTotals(), pendCB=Store.getTotalPendingCB(), pendN=Store.getPendingCashback().length;
  const now=new Date(), salary=Store.getSalary();
  const mExps=Store.getMonthExpenses(now.getFullYear(),now.getMonth());
  const mExp=mExps.reduce((s,e)=>s+e.amount,0);
  const emiOut=Store.getMonthlyEMIOutflow();
  const funSpends=mExps.filter(e=>['food','fun','drinks','shopping'].includes(e.category)).reduce((s,e)=>s+e.amount,0);
  const recent=Store.getRecentActivity(6);

  let salaryHtml='';
  if(salary>0){
    const left=salary-mExp-emiOut;
    const pct=Math.round((1-left/salary)*100);
    const mood=pct>90?'You\'re speedrunning poverty.':pct>70?'At this rate, maggi for dinner.':pct>50?'Half gone. Half the month left. Classic.':pct>30?'Still breathing. Financially.':'Surprisingly responsible. Suspicious.';
    salaryHtml=`<div class="salary-banner fade-in"><div class="sal-row"><span>Monthly Salary</span><strong>${formatCurrency(salary)}</strong></div>
    <div class="sal-row"><span>Personal spends</span><strong style="color:rgba(255,255,255,0.7)">${formatCurrency(mExp)}</strong></div>
    <div class="sal-row"><span>Others' EMIs</span><strong style="color:rgba(255,255,255,0.7)">${formatCurrency(emiOut)}</strong></div>
    <div class="sal-row" style="margin-top:12px;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px"><span>Remaining</span><span class="sal-left">${formatCurrency(left)}</span></div>
    <div class="mood">${mood}</div></div>`;
  }

  let roastHtml='';
  if(salary>0 && funSpends>salary*0.2){
    const roasts = [
      `You spent ${formatCurrency(funSpends)} on food & fun this month. Are you allergic to saving money?`,
      `Another Swiggy order? Guess we are eating air next week. (${formatCurrency(funSpends)} gone)`,
      `Your 'treat yo self' budget is getting out of hand. ${formatCurrency(funSpends)} down the drain.`
    ];
    const r=roasts[Math.floor(Math.random()*roasts.length)];
    roastHtml=`<div class="glass fade-in" style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);margin-bottom:24px"><div style="color:var(--red)">${ICO.alert}</div><div><strong style="color:var(--red);display:block;margin-bottom:2px;font-size:14px">Roast Mode</strong><span style="font-size:12px;color:var(--text-sec);line-height:1.4;display:block">${r}</span></div></div>`;
  }

  const cbHtml=pendCB>0?`<div class="glass fade-in" style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.2);margin-bottom:24px;cursor:pointer" data-action="go-cashback"><div style="color:var(--amber)">${ICO.coin}</div><div style="flex:1"><strong>${formatCurrency(pendCB)} cashback incoming</strong><span style="display:block;font-size:11px;color:var(--text-sec);margin-top:4px">${pendN} pending · Your money is on vacation</span></div><div style="color:var(--text-muted)">${ICO.chevron}</div></div>`:'';

  let actHtml='';
  recent.forEach((a,i)=>{
    const d=i*0.04, person=Store.getPerson(a.personId), pn=person?esc(person.name):'Ghost';
    if(a.actType==='tx'){
      const ico=a.type==='CARD_PURCHASE'?ICO.card:a.type==='CASH_LENT'?ICO.cashLent:ICO.handshake;
      const c=a.type==='BORROWED'?'blue':'red';
      const sub=a.type==='CARD_PURCHASE'?esc(a.productName):a.type==='CASH_LENT'?'Cash lent':'Borrowed';
      actHtml+=`<div class="list-item fade-in" style="animation-delay:${d}s" data-action="${a.type==='CARD_PURCHASE'?'view-tx':'view-person'}" data-id="${a.type==='CARD_PURCHASE'?a.id:a.personId}"><div class="li-avatar ${c}">${ico}</div><div class="li-info"><div class="li-name">${pn}</div><div class="li-sub">${sub}</div></div><div class="li-right"><div class="li-amount ${c}">${formatCurrency(a.amount)}</div><div class="li-time">${timeAgo(a.sortDate)}</div></div></div>`;
    } else {
      actHtml+=`<div class="list-item glass fade-in" style="animation-delay:${d}s"><div class="li-avatar green">${ICO.payment}</div><div class="li-info"><div class="li-name">${pn} paid</div><div class="li-sub">A rare event</div></div><div class="li-right"><div class="li-amount green">${formatCurrency(a.amount)}</div><div class="li-time">${timeAgo(a.sortDate)}</div></div></div>`;
    }
  });
  if(!actHtml) actHtml=`<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.emptybox}</div><h3>${rndEmpty()}</h3><p>Tap a button above to begin tracking.</p></div>`;

  return `<div class="page-header fade-in"><h1>BrokeCore</h1><p class="subtitle">${formatDate(now.toISOString())}</p></div>
  <div class="stats-row"><div class="stat-card green fade-in"><div class="stat-label">They owe you</div><div class="stat-value">${formatCurrency(t.owed)}</div><div class="stat-sub">${t.owed>0?t.owed>10000?'Recovery pending':'Collect soon':'All clear'}</div></div>
  <div class="stat-card red fade-in" style="animation-delay:.05s"><div class="stat-label">You owe</div><div class="stat-value">${formatCurrency(t.owe)}</div><div class="stat-sub">${t.owe>0?t.owe>10000?'This keeps you up at night':'Manageable':'Debt free'}</div></div></div>
  ${roastHtml}${salaryHtml}${cbHtml}
  <div class="quick-actions" style="grid-template-columns:repeat(2,1fr)">
    <button class="quick-btn g1 glass" data-action="modal-card"><div class="qb-icon" style="color:var(--green)">${ICO.cardBuy}</div>Card Buy</button>
    <button class="quick-btn g2 glass" data-action="modal-lent"><div class="qb-icon" style="color:var(--red)">${ICO.cashLent}</div>Cash Lent</button>
    <button class="quick-btn g3 glass" data-action="modal-borrow"><div class="qb-icon" style="color:var(--blue)">${ICO.borrow}</div>Borrowed</button>
    <button class="quick-btn g4 glass" data-action="modal-expense"><div class="qb-icon" style="color:var(--pink)">${ICO.expense}</div>Add Expense</button>
  </div>
  <div class="section"><div class="section-title">Recent Activity<a class="see-all" data-action="go" data-href="#/history">See All</a></div><div class="list-card glass">${actHtml}</div></div>`;
}

function renderPeople(){
  const people=Store.getPeople();
  const sorted=people.map(p=>({...p,bal:Store.getPersonBalance(p.id)})).sort((a,b)=>Math.abs(b.bal.net)-Math.abs(a.bal.net));
  let html='';
  sorted.forEach((p,i)=>{
    const c=p.bal.net>0?'green':p.bal.net<0?'red':'blue';
    const lbl=p.bal.net>0?'owes you':p.bal.net<0?'you owe':'settled';
    html+=`<div class="list-item fade-in" style="animation-delay:${i*.04}s" data-action="view-person" data-id="${p.id}"><div class="li-avatar ${c}">${esc(p.name[0]).toUpperCase()}</div><div class="li-info"><div class="li-name">${esc(p.name)}</div><div class="li-sub">${lbl}</div></div><div class="li-right"><div class="li-amount ${c}">${formatCurrency(Math.abs(p.bal.net))}</div></div></div>`;
  });
  if(!html) html=`<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.ghost}</div><h3>No contacts yet</h3><p>They'll show up once you start lending money you don't have.</p></div>`;
  return `<div class="page-header fade-in" style="display:flex;justify-content:space-between;align-items:center"><div><h1>People</h1><p class="subtitle">${people.length} contact${people.length!==1?'s':''}</p></div><button class="btn-submit purple" style="width:auto;margin:0;padding:10px 20px" data-action="modal-lent">+ Add</button></div><div class="list-card glass">${html}</div>`;
}
