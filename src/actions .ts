// HILFSFUNKTIONEN FÜR KOSTEN-APP
function getUserOptions(exclude){
  return USERS.filter(u=>u.role==='user'&&u.name!==exclude).map(u=>`<option value="${esc(u.name)}">${esc(u.name)}</option>`).join('');
}

function calcTotals(data){
  const total = data.expenses.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const n = Math.max(USERS.filter(u=>u.role==='user').length, 1);
  const per = total / n;
  const paid = {};
  USERS.forEach(u=>paid[u.name]=0);
  data.expenses.forEach(e=>{ if(e.payer) paid[e.payer]=(paid[e.payer]||0)+(parseFloat(e.amount)||0); });
  return {total, perPerson:per, paid};
}

function fmt(n){ return (parseFloat(n)||0).toFixed(2).replace('.',','); }
function esc(s){ return (s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }
function todayStr(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function setFilter(f){ costFilter=f; renderCostApp(); }
function setCostTab(t){ costTab=t; renderCostApp(); }
function costLogout(){ clearSession(); costFilter='all'; costTab='overview'; renderCostApp(); }

  // AKTION - KOSTEN
function addUserCost(){
  const desc = document.getElementById('u-desc').value.trim();
  const amount = parseFloat(document.getElementById('u-amount').value);
  const date = document.getElementById('u-date').value;
  const statusEl = document.getElementById('u-status');
  const status = statusEl ? statusEl.value : 'offen';
  if(!desc || isNaN(amount) || amount<=0){ alert('Bitte Bezeichnung und gültigen Betrag eingeben.'); return; }
  const data = getCostData();
  const session = getSession();
  data.expenses.push({desc, amount, payer:session.name, status, date:date||todayStr()});
  saveCostData(data);
  document.getElementById('u-desc').value='';
  document.getElementById('u-amount').value='';
  renderCostApp();
}

function addAdminCost(){
  const desc = document.getElementById('a-desc').value.trim();
  const amount = parseFloat(document.getElementById('a-amount').value);
  const date = document.getElementById('a-date').value;
  const payer = document.getElementById('a-payer').value;
  const statusEl = document.getElementById('a-status');
  const status = statusEl ? statusEl.value : 'offen';
  if(!desc || isNaN(amount) || amount<=0){ alert('Bitte Bezeichnung und gültigen Betrag eingeben.'); return; }
  if(!payer){ alert('Bitte einen Bezahler auswählen.'); return; }
  const data = getCostData();
  data.expenses.push({desc, amount, payer, status, date:date||todayStr()});
  saveCostData(data);
  document.getElementById('a-desc').value='';
  document.getElementById('a-amount').value='';
  renderCostApp();
}

function addGroupCost(){
  const desc = document.getElementById('g-desc').value.trim();
  const amount = parseFloat(document.getElementById('g-amount').value);
  const date = document.getElementById('g-date').value;
  const statusEl = document.getElementById('g-status');
  const status = statusEl ? statusEl.value : 'offen';
  if(!desc || isNaN(amount) || amount<=0){ alert('Bitte Bezeichnung und gültigen Betrag eingeben.'); return; }
  const data = getCostData();
  const userList = USERS.filter(u=>u.role==='user').map(u=>u.name);
  userList.forEach(u=>{
    data.expenses.push({desc: desc + ' (' + u + ')', amount, payer:u, status, date:date||todayStr()});
  });
  saveCostData(data);
  document.getElementById('g-desc').value='';
  document.getElementById('g-amount').value='';
  renderCostApp();
}

function deleteCost(idx){
  if(!confirm('Diese Kosten wirklich löschen?')) return;
  const data = getCostData();
  data.expenses.splice(idx,1);
  saveCostData(data);
  renderCostApp();
}

function toggleCostStatus(idx){
  const data = getCostData();
  if(idx>=0 && idx<data.expenses.length){
    data.expenses[idx].status = nextStatus(data.expenses[idx].status || 'offen');
    saveCostData(data);
    renderCostApp();
  }
}

//AKTION - ÜBERWEISUNGEN
function addUserTransfer(){
  const desc = document.getElementById('ut-desc').value.trim();
  const amount = parseFloat(document.getElementById('ut-amount').value);
  const date = document.getElementById('ut-date').value;
  const to = document.getElementById('ut-to').value;
  const statusEl = document.getElementById('ut-status');
  const received = statusEl ? (statusEl.value==='received') : false;
  if(!desc || isNaN(amount) || amount<=0 || !to){ alert('Bitte alle Felder ausfüllen.'); return; }
  const data = getCostData();
  const session = getSession();
  data.transfers.push({desc, amount, from:session.name, to, received, date:date||todayStr()});
  saveCostData(data);
  document.getElementById('ut-desc').value='';
  document.getElementById('ut-amount').value='';
  renderCostApp();
}

function addAdminTransfer(){
  const desc = document.getElementById('at-desc').value.trim();
  const amount = parseFloat(document.getElementById('at-amount').value);
  const date = document.getElementById('at-date').value;
  const from = document.getElementById('at-from').value;
  const to = document.getElementById('at-to').value;
  const statusEl = document.getElementById('at-status');
  const received = statusEl ? (statusEl.value==='received') : false;
  if(!desc || isNaN(amount) || amount<=0 || !from || !to){ alert('Bitte alle Felder ausfüllen.'); return; }
  if(from===to){ alert('Absender und Empfänger dürfen nicht identisch sein.'); return; }
  const data = getCostData();
  data.transfers.push({desc, amount, from, to, received, date:date||todayStr()});
  saveCostData(data);
  document.getElementById('at-desc').value='';
  document.getElementById('at-amount').value='';
  renderCostApp();
}

function deleteTransfer(idx){
  if(!confirm('Diese Überweisung wirklich löschen?')) return;
  const data = getCostData();
  data.transfers.splice(idx,1);
  saveCostData(data);
  renderCostApp();
}

function toggleTransferStatus(idx){
  const data = getCostData();
  if(idx>=0 && idx<data.transfers.length){
    data.transfers[idx].received = !data.transfers[idx].received;
    saveCostData(data);
    renderCostApp();
  }
}

/* ENTER-KEY SUPPORT */
window.addEventListener('keydown',function(e){
  if(e.key!=='Enter') return;
  const active = document.activeElement;
  if(!active) return;
  if(active.id==='u-amount' || active.id==='u-desc'){ addUserCost(); }
  if(active.id==='ut-amount' || active.id==='ut-desc'){ addUserTransfer(); }
  if(active.id==='login-pass'){ doLogin(); }
  if(active.id==='login-pass-user'){ doUserLogin(); }
  if(active.id==='a-amount' || active.id==='a-desc'){ addAdminCost(); }
  if(active.id==='g-amount' || active.id==='g-desc'){ addGroupCost(); }
  if(active.id==='at-amount' || active.id==='at-desc'){ addAdminTransfer(); }
});

/* Auto-Sync beim Start */
setTimeout(autoSyncOnLoad, 1500);

Object.assign(window, {
  getUserOptions,
  calcTotals,
  fmt,
  esc,
  todayStr,
  setFilter,
  setCostTab,
  costLogout,
  addUserCost,
  addAdminCost,
  addGroupCost,
  deleteCost,
  toggleCostStatus,
  addUserTransfer,
  addAdminTransfer,
  deleteTransfer,
  toggleTransferStatus
});
