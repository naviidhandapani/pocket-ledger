/* screens2.js - Person detail, Tx detail, Cards, Cashback */
function renderPersonDetail(id){
  const p=Store.getPerson(id);
  if(!p) return `<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.ghost}</div><h3>Person not found</h3><p>Either deleted or never existed. Like your budget plan.</p></div>`;
  const bal=Store.getPersonBalance(id), txs=Store.getTransactionsByPerson(id).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
  const c=bal.net>0?'green':bal.net<0?'red':'blue';
  const lbl=bal.net>0?'owes you':bal.net<0?'you owe them':'all settled';
  let txH='';
  txs.forEach((tx,i)=>{
    const rem=Store.getTxBalance(tx.id);
    if(tx.type==='CARD_PURCHASE'){
      const pm=Store.getPaymentsByTx(tx.id).length, prog=tx.isEMI?`${pm}/${tx.emiMonths} EMIs`:(rem<=0?'Cleared':'Pending');
      txH+=`<div class="list-item glass fade-in" style="animation-delay:${i*.04}s" data-action="view-tx" data-id="${tx.id}"><div class="li-avatar purple">${ICO.card}</div><div class="li-info"><div class="li-name">${esc(tx.productName)}</div><div class="li-sub">${esc(tx.cardName)} · ${prog}</div>${tx.isEMI?`<div class="emi-progress"><div class="emi-bar"><div class="emi-bar-fill green" style="width:${Math.min(100,(pm/tx.emiMonths)*100)}%"></div></div></div>`:''}</div><div class="li-right"><div class="li-amount ${rem>0?'red':'green'}">${rem>0?formatCurrency(rem):'Paid'}</div><div class="li-time">${formatDateShort(tx.date||tx.createdAt)}</div></div></div>`;
    } else {
      const ico=tx.type==='CASH_LENT'?ICO.cashLent:ICO.handshake, lbl2=tx.type==='CASH_LENT'?'Cash Lent':'Borrowed';
      txH+=`<div class="list-item glass fade-in" style="animation-delay:${i*.04}s"><div class="li-avatar ${tx.type==='CASH_LENT'?'red':'blue'}">${ico}</div><div class="li-info"><div class="li-name">${lbl2}</div><div class="li-sub">${esc(tx.note)||'No reason given'}</div></div><div class="li-right"><div class="li-amount ${rem>0?'red':'green'}">${rem>0?formatCurrency(rem):'Paid'}</div><div class="li-time">${formatDateShort(tx.date||tx.createdAt)}</div></div></div>`;
    }
  });
  if(!txH) txH=`<div class="empty-state"><p>No transactions with ${esc(p.name)} yet.</p></div>`;
  const stats = Store.getPersonStats(id);
  const bdH = `
  <div class="stats-row fade-in" style="margin-bottom:24px">
    <div class="stat-card glass" style="padding:16px;background:var(--red-bg);border:1px solid rgba(251,113,133,0.2)">
      <div class="stat-label" style="color:var(--red)">I Paid Them</div>
      <div class="stat-value" style="font-size:20px;color:var(--text)">${formatCurrency(stats.iPaid)}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:6px;line-height:1.4">
        ${stats.myBd.cash>0?`<div>Cash: ${formatCurrency(stats.myBd.cash)}</div>`:''}
        ${stats.myBd.upi>0?`<div>UPI: ${formatCurrency(stats.myBd.upi)}</div>`:''}
        ${stats.myBd.card>0?`<div>Card: ${formatCurrency(stats.myBd.card)}</div>`:''}
      </div>
    </div>
    <div class="stat-card glass" style="padding:16px;background:var(--green-bg);border:1px solid rgba(74,222,128,0.2)">
      <div class="stat-label" style="color:var(--green)">They Paid Me</div>
      <div class="stat-value" style="font-size:20px;color:var(--text)">${formatCurrency(stats.theyPaid)}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:6px;line-height:1.4">
        ${stats.theirBd.cash>0?`<div>Cash: ${formatCurrency(stats.theirBd.cash)}</div>`:''}
        ${stats.theirBd.upi>0?`<div>UPI: ${formatCurrency(stats.theirBd.upi)}</div>`:''}
        ${stats.theirBd.card>0?`<div>Card: ${formatCurrency(stats.theirBd.card)}</div>`:''}
      </div>
    </div>
  </div>`;
  return `<button class="back-btn" data-action="go" data-href="#/people">${ICO.back} People</button>
  <div class="person-header fade-in"><div class="ph-name">${esc(p.name)}</div>${p.phone?`<div style="color:var(--text3);font-size:12px">${esc(p.phone)}</div>`:''}
  <div class="ph-balance" style="color:var(--${c})">${formatCurrency(Math.abs(bal.net))}</div><div class="ph-label">${lbl}</div></div>
  <div class="person-actions fade-in"><button data-action="modal-pay" data-person="${id}" class="primary">Record Payment</button><button data-action="modal-card" data-person="${id}">Card Buy</button><button data-action="modal-lent" data-person="${id}">Lend</button></div>
  ${bdH}
  <div class="section"><div class="section-title">Transactions</div><div class="list-card glass">${txH}</div></div>
  <button class="btn-danger" data-action="delete-person" data-id="${id}" data-name="${esc(p.name)}">🗑 Delete Contact</button>`;
}

function renderTxDetail(id){
  const tx=Store.getTransaction(id);
  if(!tx) return `<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.emptybox}</div><h3>Transaction not found</h3><p>Gone. Reduced to atoms.</p></div>`;
  const person=Store.getPerson(tx.personId), pn=person?esc(person.name):'Unknown';
  const payments=Store.getPaymentsByTx(id).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
  const rem=Store.getTxBalance(id), pm=payments.length;
  let payH='';
  payments.forEach((pay,i)=>{payH+=`<div class="list-item glass fade-in" style="animation-delay:${i*.04}s"><div class="li-avatar green">${ICO.payment}</div><div class="li-info"><div class="li-name">${formatCurrency(pay.amount)}</div><div class="li-sub">${formatDate(pay.date||pay.createdAt)}${pay.note?' · '+esc(pay.note):''}</div></div><div class="li-right"><button class="modal-close" data-action="delete-payment" data-id="${pay.id}" data-tx="${id}">${ICO.x}</button></div></div>`});
  let d=`<div class="form-preview fade-in"><div class="fp-row"><span>Product</span><strong>${esc(tx.productName)}</strong></div><div class="fp-row"><span>Amount</span><strong>${formatCurrency(tx.amount)}</strong></div>`;
  if(tx.cashbackPercent>0) d+=`<div class="fp-row"><span>Cashback (${tx.cashbackPercent}%)</span><strong style="color:var(--amber)">−${formatCurrency(tx.cashbackAmount)}</strong></div><div class="fp-row"><span>Effective</span><strong>${formatCurrency(tx.effectiveAmount)}</strong></div><div class="fp-row"><span>Cashback</span><strong style="color:var(--${tx.cashbackReceived?'green':'amber'})">${tx.cashbackReceived?'Received':'Pending'}</strong></div>`;
  if(tx.isEMI) d+=`<div class="fp-row"><span>EMI</span><strong>${tx.emiMonths} × ${formatCurrency(tx.monthlyEMI)}/mo</strong></div><div class="fp-row"><span>Progress</span><strong>${pm}/${tx.emiMonths} paid</strong></div>`;
  d+=`<div class="fp-row"><span>Card</span><strong>${esc(tx.cardName)}</strong></div><div class="fp-row"><span>Remaining</span><strong class="fp-highlight" style="color:var(--${rem>0?'red':'green'})">${rem>0?formatCurrency(rem):'Fully Paid'}</strong></div></div>`;
  if(tx.isEMI) d+=`<div class="emi-progress fade-in" style="margin-bottom:16px"><div class="emi-bar" style="height:8px"><div class="emi-bar-fill green" style="width:${Math.min(100,(pm/tx.emiMonths)*100)}%"></div></div><div class="emi-months"><span>${pm} of ${tx.emiMonths} months</span><span>${formatCurrency(rem)} remaining</span></div></div>`;
  let btns='';
  if(rem>0) btns+=`<button class="btn-submit green" style="margin-bottom:10px" data-action="modal-pay-tx" data-tx="${id}" data-person="${tx.personId}">Record Payment${tx.isEMI?' ('+formatCurrency(tx.monthlyEMI)+')':''}</button>`;
  if(tx.cashbackAmount>0&&!tx.cashbackReceived) btns+=`<button class="btn-submit purple" style="margin-bottom:10px" data-action="mark-cb" data-id="${id}">Mark Cashback Received</button>`;
  return `<button class="back-btn" data-action="go" data-href="#/people/${tx.personId}">${ICO.back} ${pn}</button><div class="page-header fade-in"><h1>${esc(tx.productName)}</h1><p class="subtitle">${pn} · ${esc(tx.cardName)}</p></div>${d}${btns}<div class="section"><div class="section-title">Payment History</div><div class="list-card glass">${payH||'<div class="empty-state"><p>No payments recorded. The wait continues.</p></div>'}</div></div><button class="btn-danger" data-action="delete-tx" data-id="${id}">Delete Transaction</button>`;
}

function renderCards(){
  const cards=Store.getCards(); let h='';
  cards.forEach((c,i)=>{
    const txs=Store.getTransactionsByCard(c.name), active=txs.filter(t=>Store.getTxBalance(t.id)>0);
    const out=active.reduce((s,t)=>s+Store.getTxBalance(t.id),0);
    const pcb=txs.filter(t=>t.cashbackAmount>0&&!t.cashbackReceived).reduce((s,t)=>s+t.cashbackAmount,0);
    h+=`<div class="credit-card-visual fade-in" style="animation-delay:${i*.06}s"><div class="cc-name">${esc(c.name)}</div><div class="cc-stat"><span>Outstanding</span><strong style="color:var(--red)">${formatCurrency(out)}</strong></div><div class="cc-stat"><span>Active items</span><strong>${active.length}</strong></div>${pcb>0?`<div class="cc-stat"><span>Cashback pending</span><strong style="color:var(--amber)">${formatCurrency(pcb)}</strong></div>`:''}
    <div style="margin-top:12px"><button class="btn-danger" style="margin:0;padding:8px;font-size:11px" data-action="delete-card" data-id="${c.id}">Remove</button></div></div>`;
  });
  if(!h) h=`<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.card}</div><h3>No cards added</h3><p>Cards are created automatically when you log a purchase.</p></div>`;
  return `<div class="page-header fade-in"><h1>Cards</h1><p class="subtitle">${cards.length} card${cards.length!==1?'s':''}</p></div><button class="btn-submit purple" style="margin-bottom:16px" data-action="modal-add-card">+ Add Card</button>${h}`;
}

function renderCashback(){
  const pend=Store.getPendingCashback(), recv=Store.getTransactions().filter(t=>t.type==='CARD_PURCHASE'&&t.cashbackAmount>0&&t.cashbackReceived);
  const tp=pend.reduce((s,t)=>s+t.cashbackAmount,0), tr=recv.reduce((s,t)=>s+t.cashbackAmount,0);
  let lh='';
  pend.forEach((t,i)=>{const p=Store.getPerson(t.personId);lh+=`<div class="list-item glass fade-in" style="animation-delay:${i*.04}s"><div class="li-avatar amber">${ICO.coin}</div><div class="li-info"><div class="li-name">${esc(t.productName)}</div><div class="li-sub">${p?esc(p.name):''} · ${esc(t.cardName)}</div></div><div class="li-right"><div class="li-amount amber">${formatCurrency(t.cashbackAmount)}</div><button style="font-size:10px;padding:4px 10px;border-radius:6px;border:1px solid rgba(134,239,172,0.15);background:var(--green-bg);color:var(--green);cursor:pointer;margin-top:3px;font-family:inherit;font-weight:600" data-action="mark-cb" data-id="${t.id}">Received</button></div></div>`});
  if(!lh) lh=`<div class="empty-state"><div class="empty-icon" style="color:var(--text3)">${ICO.handshake}</div><h3>All caught up</h3><p>No pending cashback. Small mercies.</p></div>`;
  return `<button class="back-btn" data-action="go" data-href="#/">${ICO.back} Home</button><div class="page-header fade-in"><h1>Cashback</h1></div><div class="stats-row"><div class="stat-card amber fade-in"><div class="stat-label">Pending</div><div class="stat-value">${formatCurrency(tp)}</div></div><div class="stat-card green fade-in"><div class="stat-label">Received</div><div class="stat-value">${formatCurrency(tr)}</div></div></div><div class="section"><div class="section-title">Pending</div><div class="list-card glass">${lh}</div></div>`;
}
