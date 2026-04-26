/* ─── store.js — localStorage CRUD for Pocket Ledger ─── */
const KEYS = {
  PEOPLE:'ed_people', TRANSACTIONS:'ed_transactions', PAYMENTS:'ed_payments',
  CARDS:'ed_cards', GROUPS:'ed_groups', EXPENSES:'ed_expenses', SETTINGS:'ed_settings',
  SUBSCRIPTIONS:'ed_subs'
};
function _get(k){try{return JSON.parse(localStorage.getItem(k))||[];}catch{return[];}}
function _set(k,v){localStorage.setItem(k,JSON.stringify(v));}
function _getObj(k){try{return JSON.parse(localStorage.getItem(k))||{};}catch{return {};}}
function _setObj(k,v){localStorage.setItem(k,JSON.stringify(v));}

const Store={
  /* People */
  getPeople(){return _get(KEYS.PEOPLE)},
  getPerson(id){return this.getPeople().find(p=>p.id===id)},
  addPerson({name,phone}){const l=this.getPeople();const p={id:generateId(),name:name.trim(),phone:phone?.trim()||'',createdAt:new Date().toISOString()};l.push(p);_set(KEYS.PEOPLE,l);this.autoBackup();return p},
  updatePerson(id,u){const l=this.getPeople();const i=l.findIndex(p=>p.id===id);if(i<0)return null;l[i]={...l[i],...u};_set(KEYS.PEOPLE,l);return l[i]},
  deletePerson(id){const txIds=this.getTransactionsByPerson(id).map(t=>t.id);_set(KEYS.PEOPLE,this.getPeople().filter(p=>p.id!==id));_set(KEYS.TRANSACTIONS,this.getTransactions().filter(t=>t.personId!==id));_set(KEYS.PAYMENTS,this.getPayments().filter(p=>!txIds.includes(p.transactionId)));this.autoBackup()},
  findOrCreatePerson(name){const f=this.getPeople().find(p=>p.name.toLowerCase()===name.trim().toLowerCase());return f||this.addPerson({name})},

  /* Cards */
  getCards(){return _get(KEYS.CARDS)},
  addCard({name}){const l=this.getCards();const c={id:generateId(),name:name.trim(),createdAt:new Date().toISOString()};l.push(c);_set(KEYS.CARDS,l);return c},
  deleteCard(id){_set(KEYS.CARDS,this.getCards().filter(c=>c.id!==id))},
  findOrCreateCard(name){const f=this.getCards().find(c=>c.name.toLowerCase()===name.trim().toLowerCase());return f||this.addCard({name})},

  /* Transactions (debts) */
  getTransactions(){return _get(KEYS.TRANSACTIONS)},
  getTransaction(id){return this.getTransactions().find(t=>t.id===id)},
  addTransaction(tx){const l=this.getTransactions();const t={id:generateId(),...tx,createdAt:new Date().toISOString()};l.push(t);_set(KEYS.TRANSACTIONS,l);this.autoBackup();return t},
  updateTransaction(id,u){const l=this.getTransactions();const i=l.findIndex(t=>t.id===id);if(i<0)return null;l[i]={...l[i],...u};_set(KEYS.TRANSACTIONS,l);return l[i]},
  deleteTransaction(id){_set(KEYS.TRANSACTIONS,this.getTransactions().filter(t=>t.id!==id));_set(KEYS.PAYMENTS,this.getPayments().filter(p=>p.transactionId!==id));this.autoBackup()},
  getTransactionsByPerson(pid){return this.getTransactions().filter(t=>t.personId===pid)},
  getTransactionsByCard(cn){return this.getTransactions().filter(t=>t.cardName===cn)},

  /* Payments */
  getPayments(){return _get(KEYS.PAYMENTS)},
  addPayment(p){const l=this.getPayments();const pay={id:generateId(),...p,createdAt:new Date().toISOString()};l.push(pay);_set(KEYS.PAYMENTS,l);this.autoBackup();return pay},
  deletePayment(id){_set(KEYS.PAYMENTS,this.getPayments().filter(p=>p.id!==id));this.autoBackup()},
  getPaymentsByTx(txId){return this.getPayments().filter(p=>p.transactionId===txId)},
  getPaymentsByPerson(pid){return this.getPayments().filter(p=>p.personId===pid)},

  /* Expense Groups (Trips/Categories) */
  getGroups(){return _get(KEYS.GROUPS)},
  getGroup(id){return this.getGroups().find(g=>g.id===id)},
  addGroup({name,icon,color}){const l=this.getGroups();const g={id:generateId(),name:name.trim(),icon:icon||'📁',color:color||'c1',createdAt:new Date().toISOString()};l.push(g);_set(KEYS.GROUPS,l);this.autoBackup();return g},
  deleteGroup(id){_set(KEYS.GROUPS,this.getGroups().filter(g=>g.id!==id));_set(KEYS.EXPENSES,this.getExpenses().filter(e=>e.groupId!==id));this.autoBackup()},

  /* Expenses (personal) */
  getExpenses(){return _get(KEYS.EXPENSES)},
  addExpense(e){const l=this.getExpenses();const exp={id:generateId(),...e,createdAt:new Date().toISOString()};l.push(exp);_set(KEYS.EXPENSES,l);this.autoBackup();return exp},
  deleteExpense(id){_set(KEYS.EXPENSES,this.getExpenses().filter(e=>e.id!==id));this.autoBackup()},
  getExpensesByGroup(gid){return this.getExpenses().filter(e=>e.groupId===gid)},
  getGroupTotal(gid){return this.getExpensesByGroup(gid).reduce((s,e)=>s+e.amount,0)},
  getMonthExpenses(year,month){return this.getExpenses().filter(e=>{const d=new Date(e.date||e.createdAt);return d.getFullYear()===year&&d.getMonth()===month})},
  getMonthTotal(year,month){return this.getMonthExpenses(year,month).reduce((s,e)=>s+e.amount,0)},

  /* Subscriptions */
  getSubscriptions(){return _get(KEYS.SUBSCRIPTIONS)},
  addSubscription(s){const l=this.getSubscriptions();const sub={id:generateId(),...s,createdAt:new Date().toISOString()};l.push(sub);_set(KEYS.SUBSCRIPTIONS,l);this.autoBackup();this.processSubscriptions();return sub;},
  deleteSubscription(id){_set(KEYS.SUBSCRIPTIONS,this.getSubscriptions().filter(s=>s.id!==id));this.autoBackup()},
  processSubscriptions(){
    const subs=this.getSubscriptions();
    const now=new Date();
    let lastProc = this.getSettings().lastSubProcess;
    if (typeof lastProc !== 'object' || lastProc === null) lastProc = {};
    
    subs.forEach(s => {
      const startD = new Date(s.startDate || s.createdAt);
      let cur = new Date(startD.getFullYear(), startD.getMonth(), parseInt(s.day));
      if (cur < startD) cur.setMonth(cur.getMonth() + 1);
      
      if (!lastProc[s.id]) lastProc[s.id] = [];
      
      while (cur <= now) {
        const ym = `${cur.getFullYear()}-${cur.getMonth()}`;
        if (!lastProc[s.id].includes(ym)) {
          this.addExpense({name: s.name, amount: s.amount, category: 'bills', date: cur.toISOString(), paymentMethod: 'card'});
          lastProc[s.id].push(ym);
        }
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, parseInt(s.day));
      }
    });
    this.updateSettings({lastSubProcess: lastProc});
  },

  /* Settings */
  getSettings(){return _getObj(KEYS.SETTINGS)},
  updateSettings(u){_setObj(KEYS.SETTINGS,{...this.getSettings(),...u})},
  getSalary(){return this.getSettings().salary||0},
  setSalary(amt){this.updateSettings({salary:amt})},

  /* Computed - Debts */
  getTxBalance(txId){const tx=this.getTransaction(txId);if(!tx)return 0;const paid=this.getPaymentsByTx(txId).reduce((s,p)=>s+p.amount,0);const owed=tx.type==='CARD_PURCHASE'?tx.effectiveAmount:tx.amount;return Math.max(0,owed-paid)},
  getPersonBalance(pid){const txs=this.getTransactionsByPerson(pid);const unlinked=this.getPaymentsByPerson(pid).filter(p=>!p.transactionId);let theyOwe=0,iOwe=0;txs.forEach(tx=>{const paid=this.getPaymentsByTx(tx.id).reduce((s,p)=>s+p.amount,0);if(tx.type==='CARD_PURCHASE'||tx.type==='CASH_LENT'){theyOwe+=Math.max(0,(tx.type==='CARD_PURCHASE'?tx.effectiveAmount:tx.amount)-paid)}else if(tx.type==='BORROWED'){iOwe+=Math.max(0,tx.amount-paid)}});const uTotal=unlinked.reduce((s,p)=>s+p.amount,0);theyOwe-=uTotal;return{theyOwe:Math.max(0,theyOwe),iOwe,net:theyOwe-iOwe}},
  getPersonStats(pid){
    const txs=this.getTransactionsByPerson(pid), pays=this.getPaymentsByPerson(pid);
    let iPaid=0, theyPaid=0, myBd={cash:0,upi:0,card:0}, theirBd={cash:0,upi:0,card:0};
    txs.forEach(tx=>{
      if(tx.type==='CARD_PURCHASE'){iPaid+=tx.effectiveAmount;myBd.card+=tx.effectiveAmount}
      else if(tx.type==='CASH_LENT'){iPaid+=tx.amount;const m=tx.paymentMethod||'cash';if(myBd[m]!==undefined)myBd[m]+=tx.amount}
      else if(tx.type==='BORROWED'){theyPaid+=tx.amount;const m=tx.paymentMethod||'cash';if(theirBd[m]!==undefined)theirBd[m]+=tx.amount}
    });
    pays.forEach(pay=>{
      let isPayingMe=true;
      if(pay.transactionId){
        const tx=this.getTransaction(pay.transactionId);
        if(tx&&tx.type==='BORROWED') isPayingMe=false;
      }
      const m=pay.paymentMethod||'cash';
      if(isPayingMe){theyPaid+=pay.amount;if(theirBd[m]!==undefined)theirBd[m]+=pay.amount}
      else{iPaid+=pay.amount;if(myBd[m]!==undefined)myBd[m]+=pay.amount}
    });
    return {iPaid,theyPaid,myBd,theirBd};
  },
  getTotals(){let owed=0,owe=0;this.getPeople().forEach(p=>{const b=this.getPersonBalance(p.id);owed+=b.theyOwe;owe+=b.iOwe});return{owed,owe,net:owed-owe}},
  getPendingCashback(){return this.getTransactions().filter(t=>t.type==='CARD_PURCHASE'&&t.cashbackAmount>0&&!t.cashbackReceived)},
  getTotalPendingCB(){return this.getPendingCashback().reduce((s,t)=>s+t.cashbackAmount,0)},
  getActiveEMIs(){return this.getTransactions().filter(t=>t.type==='CARD_PURCHASE'&&t.isEMI).map(t=>{const pays=this.getPaymentsByTx(t.id);return{...t,paidMonths:pays.length,totalPaid:pays.reduce((s,p)=>s+p.amount,0),remaining:Math.max(0,t.effectiveAmount-pays.reduce((s,p)=>s+p.amount,0)),isComplete:pays.length>=t.emiMonths}})},
  getMonthlyEMIOutflow(){return this.getActiveEMIs().filter(e=>!e.isComplete).reduce((s,e)=>s+e.monthlyEMI,0)},
  getRecentActivity(limit=10){const txs=this.getTransactions().map(t=>({...t,actType:'tx',sortDate:t.date||t.createdAt}));const pays=this.getPayments().map(p=>({...p,actType:'pay',sortDate:p.date||p.createdAt}));return[...txs,...pays].sort((a,b)=>new Date(b.sortDate)-new Date(a.sortDate)).slice(0,limit)},

  /* Auto-backup to IndexedDB */
  autoBackup(){try{const data=this.exportData();if('indexedDB' in window){const req=indexedDB.open('ed_backup',1);req.onupgradeneeded=e=>{e.target.result.createObjectStore('backups',{keyPath:'id'})};req.onsuccess=e=>{const db=e.target.result;try{const tx=db.transaction('backups','readwrite');tx.objectStore('backups').put({id:'latest',data,timestamp:Date.now()});tx.oncomplete=()=>db.close()}catch{db.close()}}}}catch{}},

  /* Export/Import */
  exportData(){return JSON.stringify({people:this.getPeople(),transactions:this.getTransactions(),payments:this.getPayments(),cards:this.getCards(),groups:this.getGroups(),expenses:this.getExpenses(),settings:this.getSettings(),exportedAt:new Date().toISOString()},null,2)},
  importData(json){try{const d=JSON.parse(json);if(d.people)_set(KEYS.PEOPLE,d.people);if(d.transactions)_set(KEYS.TRANSACTIONS,d.transactions);if(d.payments)_set(KEYS.PAYMENTS,d.payments);if(d.cards)_set(KEYS.CARDS,d.cards);if(d.groups)_set(KEYS.GROUPS,d.groups);if(d.expenses)_set(KEYS.EXPENSES,d.expenses);if(d.settings)_setObj(KEYS.SETTINGS,d.settings);return true}catch{return false}},
  clearAll(){Object.values(KEYS).forEach(k=>localStorage.removeItem(k))},
};
