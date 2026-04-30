/* modals.js — All modal dialogs for Pocket Ledger */
function getPersonOpts(sel){return Store.getPeople().map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)}</option>`).join('')}
function getCardOpts(sel){return Store.getCards().map(c=>`<option value="${esc(c.name)}" ${c.name===sel?'selected':''}>${esc(c.name)}</option>`).join('')}
function getGroupOpts(sel){return Store.getGroups().map(g=>`<option value="${g.id}" ${g.id===sel?'selected':''}>${g.icon} ${esc(g.name)}</option>`).join('')}
function openModal(h){document.getElementById('modal-content').innerHTML=h;document.getElementById('modal-overlay').classList.remove('hidden')}
function closeModal(){document.getElementById('modal-overlay').classList.add('hidden');document.getElementById('modal-content').innerHTML=''}
function resolvePersonId(f){const s=f.querySelector('select[name="personId"]');if(s.value==='__new'){const n=f.querySelector('input[name="newPerson"]').value.trim();if(!n){showFieldError(f.querySelector('input[name="newPerson"]'),'Name is required.');return null}return Store.findOrCreatePerson(n).id}return s.value}

/* ── Amount Validation ── */
function attachAmountValidation(form) {
  form.querySelectorAll('input[data-amount]').forEach(inp => {
    inp.addEventListener('input', function() {
      const prev = this.value;
      // Strip everything except digits and ONE decimal point
      let v = this.value.replace(/[^0-9.]/g, '');
      const parts = v.split('.');
      if (parts.length > 2) v = parts[0] + '.' + parts[1];
      if (this.value !== v) {
        this.value = v;
        showFieldError(this, 'Only numbers allowed — no letters or symbols.');
      } else {
        clearFieldError(this);
      }
    });
    inp.addEventListener('blur', function() {
      const val = parseFloat(this.value);
      if (this.value && (isNaN(val) || val <= 0)) {
        showFieldError(this, 'Please enter a valid amount greater than 0.');
      }
    });
  });
}
function showFieldError(inp, msg) {
  let err = inp.parentNode.querySelector('.field-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'field-error';
    inp.insertAdjacentElement('afterend', err);
  }
  err.textContent = msg;
  err.style.display = 'block';
  inp.style.borderColor = 'var(--red)';
  setTimeout(() => clearFieldError(inp), 3000);
}
function clearFieldError(inp) {
  const err = inp.parentNode.querySelector('.field-error');
  if (err) err.style.display = 'none';
  inp.style.borderColor = '';
}

// Shared dynamic card logic — shows card row only when "card" is selected
function attachCardLogic(f){
  const pm = f.querySelector('[name="paymentMethod"]');
  const cn = f.querySelector('[name="cardName"]');
  const row = f.querySelector('.dynamic-card-row');
  const ncr = f.querySelector('.dynamic-new-card-row');
  
  function syncVisibility() {
    if(!pm) return;
    const isCard = pm.value === 'card';
    if(row) row.classList.toggle('hidden', !isCard);
    if(ncr && cn) ncr.classList.toggle('hidden', !(isCard && cn.value === '__new'));
  }

  if(pm) pm.addEventListener('change', syncVisibility);
  if(cn) cn.addEventListener('change', syncVisibility);
  
  syncVisibility();
}
function resolveCardName(f){
  if(f.paymentMethod && f.paymentMethod.value !== 'card') return null;
  if(!f.cardName) return null;
  let cn = f.cardName.value;
  if(cn === '__new'){
    cn = f.newCard.value.trim();
    if(cn) Store.findOrCreateCard(cn);
  }
  return cn || null;
}
function dynamicCardHTML(){
  return `<div class="form-group hidden dynamic-card-row"><label>Which Card?</label><select class="form-select" name="cardName">${getCardOpts()}<option value="__new">+ New Card</option></select></div>
  <div class="form-group hidden dynamic-new-card-row"><label>Card Name</label><input class="form-input" name="newCard" placeholder="HDFC, SBI..."></div>`;
}

/* ── Card Purchase Modal ── */
function showCardPurchaseModal(pid){
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--green)">${ICO.card}</span> Card Purchase</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="card-form">
  <div class="form-group"><label>Person</label><select class="form-select" name="personId" required>${getPersonOpts(pid)}<option value="__new">+ New Person</option></select></div>
  <div class="form-group hidden" id="new-person-row"><label>Name</label><input class="form-input" name="newPerson" placeholder="Enter name"></div>
  <div class="form-group"><label>Product</label><input class="form-input" name="productName" placeholder="iPhone, Laptop..." required></div>
  <div class="form-group"><label>Amount (₹)</label><input class="form-input" name="amount" type="text" inputmode="decimal" data-amount placeholder="30000" required autocomplete="off"><div class="field-error" style="display:none"></div></div>
  <div class="form-group"><label>Card</label><select class="form-select" name="cardName" required>${getCardOpts()}<option value="__new">+ New Card</option></select></div>
  <div class="form-group hidden" id="new-card-row"><label>Card Name</label><input class="form-input" name="newCard" placeholder="HDFC, SBI..."></div>
  <div class="form-group"><div class="toggle-row"><span>EMI?</span><label class="toggle"><input type="checkbox" name="isEMI" id="emi-toggle"><span class="toggle-slider"></span></label></div></div>
  <div class="form-group hidden" id="emi-months-row"><label>Months</label><select class="form-select" name="emiMonths"><option value="3">3</option><option value="6" selected>6</option><option value="9">9</option><option value="12">12</option><option value="18">18</option><option value="24">24</option></select></div>
  <div class="form-group"><label>Cashback %</label><input class="form-input" name="cashbackPercent" type="text" inputmode="decimal" data-amount value="0" autocomplete="off"></div>
  <div class="form-group"><label>Date</label><input class="form-input" name="date" type="date" value="${todayISO()}"></div>
  <div class="form-preview hidden" id="card-preview"></div>
  <button type="submit" class="btn-submit green">Add Purchase</button></form></div>`);
  const f=document.getElementById('card-form');
  attachAmountValidation(f);
  const personSel = f.querySelector('[name="personId"]');
  const cardSel = f.querySelector('[name="cardName"]');
  personSel.onchange = function() { document.getElementById('new-person-row').classList.toggle('hidden', this.value !== '__new'); };
  cardSel.onchange = function() { document.getElementById('new-card-row').classList.toggle('hidden', this.value !== '__new'); };
  personSel.dispatchEvent(new Event('change'));
  cardSel.dispatchEvent(new Event('change'));
  document.getElementById('emi-toggle').onchange=function(){document.getElementById('emi-months-row').classList.toggle('hidden',!this.checked);updPreview()};
  ['amount','cashbackPercent'].forEach(n=>f.querySelector(`[name="${n}"]`).oninput=updPreview);
  f.querySelector('[name="emiMonths"]').onchange=updPreview;
  f.onsubmit=handleCardSubmit;
}
function updPreview(){
  const f=document.getElementById('card-form'),a=parseFloat(f.amount.value)||0,cb=parseFloat(f.cashbackPercent.value)||0,emi=f.isEMI.checked,mo=parseInt(f.emiMonths.value)||6,p=document.getElementById('card-preview');
  if(a<=0){p.classList.add('hidden');return}const eff=calcEffective(a,cb),cbA=a-eff;
  let h=`<div class="fp-row"><span>Amount</span><strong>${formatCurrency(a)}</strong></div>`;
  if(cb>0) h+=`<div class="fp-row"><span>Cashback ${cb}%</span><strong style="color:var(--amber)">-${formatCurrency(cbA)}</strong></div>`;
  h+=`<div class="fp-row"><span>They pay you</span><strong class="fp-highlight">${formatCurrency(eff)}</strong></div>`;
  if(emi) h+=`<div class="fp-row"><span>Monthly</span><strong>${formatCurrency(calcMonthlyEMI(eff,mo))} × ${mo}mo</strong></div>`;
  p.innerHTML=h;p.classList.remove('hidden');
}
function handleCardSubmit(e){
  e.preventDefault();const f=e.target,pid=resolvePersonId(f);if(!pid)return;
  const a=parseFloat(f.amount.value);
  if(!a||a<=0){showFieldError(f.querySelector('[name="amount"]'),'Please enter a valid amount.');return;}
  let cn=f.cardName.value;if(cn==='__new'){cn=f.newCard.value.trim();if(!cn){alert('Card name is required.');return}Store.findOrCreateCard(cn)}
  const cb=parseFloat(f.cashbackPercent.value)||0,emi=f.isEMI.checked,mo=emi?parseInt(f.emiMonths.value):0,eff=calcEffective(a,cb);
  Store.addTransaction({type:'CARD_PURCHASE',personId:pid,productName:f.productName.value.trim(),amount:a,cardName:cn,isEMI:emi,emiMonths:mo,cashbackPercent:cb,cashbackAmount:a-eff,effectiveAmount:eff,cashbackReceived:false,monthlyEMI:emi?calcMonthlyEMI(eff,mo):0,date:f.date.value||todayISO()});
  closeModal();App.route();
}

/* ── Cash Lent Modal ── */
function showCashLentModal(pid){
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--red)">${ICO.cashLent}</span> Cash Lent</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="lent-form">
  <div class="form-group"><label>Person</label><select class="form-select" name="personId" required>${getPersonOpts(pid)}<option value="__new">+ New</option></select></div>
  <div class="form-group hidden" id="np-lent"><label>Name</label><input class="form-input" name="newPerson" placeholder="Enter name"></div>
  <div class="form-group"><label>Amount (₹)</label><input class="form-input" name="amount" type="text" inputmode="decimal" data-amount required placeholder="500" autocomplete="off"></div>
  <div class="form-group"><label>Payment Method</label><select class="form-select" name="paymentMethod"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option></select></div>
  ${dynamicCardHTML()}
  <div class="form-group"><label>Reason</label><input class="form-input" name="note" placeholder="Optional"></div>
  <div class="form-group"><label>Date</label><input class="form-input" name="date" type="date" value="${todayISO()}"></div>
  <button type="submit" class="btn-submit green">Add</button></form></div>`);
  const f=document.getElementById('lent-form');
  attachAmountValidation(f);
  attachCardLogic(f);
  const lentPersonSel = f.querySelector('[name="personId"]');
  lentPersonSel.onchange = function() { document.getElementById('np-lent').classList.toggle('hidden', this.value !== '__new'); };
  lentPersonSel.dispatchEvent(new Event('change'));
  f.onsubmit=e=>{e.preventDefault();
    const pid2=resolvePersonId(f);if(!pid2)return;
    const a=parseFloat(f.amount.value);if(!a||a<=0){showFieldError(f.querySelector('[name="amount"]'),'Enter a valid amount.');return;}
    Store.addTransaction({type:'CASH_LENT',personId:pid2,amount:a,paymentMethod:f.paymentMethod.value,cardName:resolveCardName(f),note:f.note.value.trim(),date:f.date.value||todayISO()});closeModal();App.route()};
}

/* ── Borrow Modal ── */
function showBorrowModal(){
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--blue)">${ICO.handshake}</span> I Borrowed</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="borrow-form">
  <div class="form-group"><label>From</label><select class="form-select" name="personId" required>${getPersonOpts()}<option value="__new">+ New</option></select></div>
  <div class="form-group hidden" id="np-borrow"><label>Name</label><input class="form-input" name="newPerson" placeholder="Enter name"></div>
  <div class="form-group"><label>Amount (₹)</label><input class="form-input" name="amount" type="text" inputmode="decimal" data-amount required placeholder="500" autocomplete="off"></div>
  <div class="form-group"><label>Received Via</label><select class="form-select" name="paymentMethod"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option></select></div>
  ${dynamicCardHTML()}
  <div class="form-group"><label>Reason</label><input class="form-input" name="note"></div>
  <div class="form-group"><label>Date</label><input class="form-input" name="date" type="date" value="${todayISO()}"></div>
  <button type="submit" class="btn-submit blue">Add</button></form></div>`);
  const f=document.getElementById('borrow-form');
  attachAmountValidation(f);
  attachCardLogic(f);
  const borrowPersonSel = f.querySelector('[name="personId"]');
  borrowPersonSel.onchange = function() { document.getElementById('np-borrow').classList.toggle('hidden', this.value !== '__new'); };
  borrowPersonSel.dispatchEvent(new Event('change'));
  f.onsubmit=e=>{e.preventDefault();
    const pid=resolvePersonId(f);if(!pid)return;
    const a=parseFloat(f.amount.value);if(!a||a<=0){showFieldError(f.querySelector('[name="amount"]'),'Enter a valid amount.');return;}
    Store.addTransaction({type:'BORROWED',personId:pid,amount:a,paymentMethod:f.paymentMethod.value,cardName:resolveCardName(f),note:f.note.value.trim(),date:f.date.value||todayISO()});closeModal();App.route()};
}

/* ── Payment Modal ── */
function showPaymentModal(pid,txId){
  const person=Store.getPerson(pid),pn=person?esc(person.name):'';let pre='',info='';
  if(txId){const tx=Store.getTransaction(txId);if(tx){const r=Store.getTxBalance(txId);pre=tx.isEMI?tx.monthlyEMI:r;info=`<div class="form-preview"><div class="fp-row"><span>For</span><strong>${esc(tx.productName||'Cash')}</strong></div><div class="fp-row"><span>Remaining</span><strong style="color:var(--red)">${formatCurrency(r)}</strong></div>${tx.isEMI?`<div class="fp-row"><span>EMI</span><strong>${formatCurrency(tx.monthlyEMI)}</strong></div>`:''}</div>`}}
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--green)">${ICO.coin}</span> Payment</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="pay-form"><input type="hidden" name="personId" value="${pid}"><input type="hidden" name="transactionId" value="${txId||''}">${info}
  <div class="form-group"><label>Amount (₹)</label><input class="form-input" name="amount" type="text" inputmode="decimal" data-amount value="${pre}" required placeholder="500" autocomplete="off"></div>
  <div class="form-group"><label>Payment Method</label><select class="form-select" name="paymentMethod"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option></select></div>
  ${dynamicCardHTML()}
  <div class="form-group"><label>Date</label><input class="form-input" name="date" type="date" value="${todayISO()}"></div>
  <div class="form-group"><label>Note</label><input class="form-input" name="note" placeholder="EMI month 3..."></div>
  <button type="submit" class="btn-submit green">Record</button></form></div>`);
  const f=document.getElementById('pay-form');
  attachAmountValidation(f);
  attachCardLogic(f);
  f.onsubmit=e=>{e.preventDefault();
    const a=parseFloat(f.amount.value);if(!a||a<=0){showFieldError(f.querySelector('[name="amount"]'),'Enter a valid amount.');return;}
    Store.addPayment({personId:f.personId.value,transactionId:f.transactionId.value||undefined,amount:a,paymentMethod:f.paymentMethod.value,cardName:resolveCardName(f),date:f.date.value||todayISO(),note:f.note.value.trim()});closeModal();App.route()};
}

/* ── Add Card Modal ── */
function showAddCardModal(){
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--purple)">${ICO.card}</span> Add Card</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="ac-form"><div class="form-group"><label>Card Name</label><input class="form-input" name="name" placeholder="HDFC, SBI..." required></div><button type="submit" class="btn-submit purple">Add Card</button></form></div>`);
  document.getElementById('ac-form').onsubmit=e=>{e.preventDefault();const n=e.target.name.value.trim();if(n){Store.addCard({name:n});closeModal();App.route()}};
}

/* ── Expense Modal ── */
function showExpenseModal(groupId){
  // Default date: if viewing a past month, use last day of that month
  let defaultDate = todayISO();
  if(typeof spendMonth !== 'undefined'){
    const now = new Date();
    const isCurrentMonth = spendMonth.year === now.getFullYear() && spendMonth.month === now.getMonth();
    if(!isCurrentMonth){
      const lastDay = new Date(spendMonth.year, spendMonth.month + 1, 0);
      defaultDate = lastDay.toISOString().split('T')[0];
    }
  }
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--pink)">${ICO.expense}</span> Add Expense</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="exp-form">
  <div class="form-group"><label>Group / Trip</label><select class="form-select" name="groupId">${getGroupOpts(groupId)}<option value="">No group</option></select></div>
  <div class="form-group"><label>What</label><input class="form-input" name="name" placeholder="Biryani, Petrol..." required></div>
  <div class="form-group"><label>Amount (₹)</label><input class="form-input" name="amount" type="text" inputmode="decimal" data-amount required placeholder="500" autocomplete="off"></div>
  <div class="form-group"><label>Category</label><select class="form-select" name="category"><option value="food">🍕 Food</option><option value="stay">🏨 Stay</option><option value="travel">✈️ Travel</option><option value="fuel">⛽ Fuel</option><option value="shopping">🛍️ Shopping</option><option value="fun">🎉 Fun</option><option value="bills">📄 Bills</option><option value="drinks">🍺 Drinks</option><option value="other">📦 Other</option></select></div>
  <div class="form-group"><label>Payment Method</label><select class="form-select" name="paymentMethod"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option></select></div>
  ${dynamicCardHTML()}
  <div class="form-group"><label>Date</label><input class="form-input" name="date" type="date" value="${defaultDate}"></div>
  <button type="submit" class="btn-submit purple">Add Expense</button></form></div>`);
  const f=document.getElementById('exp-form');
  attachAmountValidation(f);
  attachCardLogic(f);
  f.onsubmit=e=>{e.preventDefault();
    const a=parseFloat(f.amount.value);if(!a||a<=0){showFieldError(f.querySelector('[name="amount"]'),'Enter a valid amount.');return;}
    Store.addExpense({groupId:f.groupId.value||null,name:f.name.value.trim(),amount:a,category:f.category.value,paymentMethod:f.paymentMethod.value,cardName:resolveCardName(f),date:f.date.value||todayISO()});closeModal();App.route()};
}

/* ── Group Modal ── */
function showGroupModal(){
  const icons=['food','stay','travel','fuel','shopping','fun','bills','drinks','other'];
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--blue)">${ICO.wallet}</span> New Group</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="grp-form">
  <div class="form-group"><label>Name</label><input class="form-input" name="name" placeholder="Munnar Trip, Jan Expenses..." required></div>
  <div class="form-group"><label>Icon</label><div class="chip-row">${icons.map((ic,i)=>`<button type="button" class="chip ${i===0?'active':''}" style="padding:10px;display:flex;align-items:center;justify-content:center" data-icon="${ic}">${ICO.cat[ic]||ICO.cat.other}</button>`).join('')}</div><input type="hidden" name="icon" value="other"></div>
  <button type="submit" class="btn-submit purple">Create</button></form></div>`);
  document.querySelectorAll('#grp-form .chip').forEach(c=>c.onclick=function(){document.querySelectorAll('#grp-form .chip').forEach(x=>x.classList.remove('active'));this.classList.add('active');document.querySelector('#grp-form [name="icon"]').value=this.dataset.icon});
  document.getElementById('grp-form').onsubmit=e=>{e.preventDefault();const f=e.target;Store.addGroup({name:f.name.value.trim(),icon:f.icon.value});closeModal();App.route()};
}

/* ── Salary Modal ── */
function showSalaryModal(){
  const cur=Store.getSalary();
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--green)">${ICO.salary}</span> Monthly Salary</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="sal-form"><div class="form-group"><label>Salary (₹)</label><input class="form-input" name="salary" type="text" inputmode="decimal" data-amount value="${cur||''}" placeholder="50000" required autocomplete="off"></div>
  <button type="submit" class="btn-submit green">Save</button></form></div>`);
  const f=document.getElementById('sal-form');
  attachAmountValidation(f);
  f.onsubmit=e=>{e.preventDefault();
    const a=parseFloat(f.salary.value);if(!a||a<=0){showFieldError(f.querySelector('[name="salary"]'),'Enter a valid amount.');return;}
    Store.setSalary(a);closeModal();App.route()};
}

/* ── Subscription Modal ── */
function showSubModal(){
  openModal(`<div class="modal-handle" data-action="close-modal"></div><div class="modal-header"><h2><span style="color:var(--accent)">${ICO.sync}</span> New Subscription</h2><button class="modal-close" data-action="close-modal">${ICO.x}</button></div>
  <div class="modal-body"><form id="sub-form">
  <div class="form-group"><label>Name</label><input class="form-input" name="name" placeholder="Netflix, Gym..." required></div>
  <div class="form-group"><label>Amount (₹)</label><input class="form-input" name="amount" type="text" inputmode="decimal" data-amount required placeholder="199" autocomplete="off"></div>
  <div class="form-group"><label>Start Date</label><input class="form-input" name="startDate" type="date" value="${todayISO()}" required></div>
  <div class="form-group"><label>Deduction Day</label><input class="form-input" name="day" type="number" required min="1" max="31" placeholder="e.g. 5 for 5th of every month"></div>
  <button type="submit" class="btn-submit purple">Add Subscription</button></form></div>`);
  const f=document.getElementById('sub-form');
  attachAmountValidation(f);
  f.onsubmit=e=>{
    e.preventDefault();
    const a=parseFloat(f.amount.value);if(!a||a<=0){showFieldError(f.querySelector('[name="amount"]'),'Enter a valid amount.');return;}
    Store.addSubscription({name:f.name.value.trim(),amount:a,startDate:f.startDate.value,day:parseInt(f.day.value)});
    closeModal();App.route();
  };
}
