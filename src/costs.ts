/*   KOSTEN-Verwaltung */
let costFilter = 'all';
let costTab = 'overview';

function renderCostApp(){
  const app=document.getElementById('cost-app');
  const session = getSession();
  if(!session.name){
    app.innerHTML = buildLoginScreen();
    return;
  }
  if(session.role === 'admin'){
    app.innerHTML = buildAdminDashboard(session);
  } else {
    app.innerHTML = buildUserDashboard(session);
  }
}

/*  LOGIN  */
function buildLoginScreen(){
  const regularUsers = USERS.filter(u=>u.role==='user');
  let userButtons = regularUsers.map(u=>`
    <button class="login-user-btn" onclick="selectUser('${esc(u.name)}')">
      <div class="lu-avatar">${u.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
      <div style="flex:1;text-align:left;"><div class="lu-name">${esc(u.name)}</div><div class="lu-role">Reiseteilnehmer</div></div>
    </button>
  `).join('');

  return `
    <div class="cost-login-wrap">
      <div class="cost-empty-icon">🔐</div>
      <h3>Kostenabrechnung – Anmeldung</h3>
      <p>Wähle deinen Namen aus der Liste oder melde dich als Admin an.</p>
      <div class="login-grid">${userButtons}
        <button class="login-user-btn" onclick="toggleAdminLogin()" style="border-color:var(--warning);background:var(--warning-light);">
          <div class="lu-avatar" style="background:linear-gradient(135deg,var(--warning),var(--secondary));">👑</div>
          <div style="flex:1;text-align:left;"><div class="lu-name">Administrator</div><div class="lu-role">Admin-Zugang</div></div>
        </button>
      </div>
      <div id="admin-login-form" style="display:none;">
        <div class="login-form">
          <input type="text" id="login-name" placeholder="Benutzername" value="Administrator">
          <input type="password" id="login-pass" placeholder="Passwort">
          <div class="login-error" id="login-error" style="display:none;">❌ Benutzername oder Passwort falsch.</div>
          <button onclick="doLogin()">Anmelden</button>
        </div>
      </div>
      <div id="user-login-form" style="display:none;">
        <div class="login-form">
          <input type="text" id="login-name-user" placeholder="Benutzername" readonly style="background:#f8f9fa;">
          <input type="password" id="login-pass-user" placeholder="Passwort">
          <div class="login-error" id="login-error-user" style="display:none;">❌ Passwort falsch.</div>
          <button onclick="doUserLogin()">Anmelden</button>
          <div class="login-toggle" onclick="backToUserList()">← Zurück zur Liste</div>
        </div>
      </div>
    </div>
  `;
}

function selectUser(name){
  document.getElementById('admin-login-form').style.display='none';
  const form = document.getElementById('user-login-form');
  form.style.display='block';
  document.getElementById('login-name-user').value = name;
  document.getElementById('login-error-user').style.display='none';
  setTimeout(()=>{const el=document.getElementById('login-pass-user');if(el)el.focus();},50);
}

function toggleAdminLogin(){
  document.getElementById('user-login-form').style.display='none';
  const form = document.getElementById('admin-login-form');
  const show = form.style.display==='none';
  form.style.display = show?'block':'none';
  if(show) setTimeout(()=>{const el=document.getElementById('login-pass');if(el)el.focus();},50);
}

function backToUserList(){
  document.getElementById('user-login-form').style.display='none';
  document.getElementById('admin-login-form').style.display='none';
}
function doLogin(){
  const name = document.getElementById('login-name').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const user = USERS.find(u=>u.name===name && u.pass===pass);
  if(!user){ document.getElementById('login-error').style.display='block'; return; }
  setSession({name:user.name, role:user.role});
  renderCostApp();
}
function doUserLogin(){
  const name = document.getElementById('login-name-user').value.trim();
  const pass = document.getElementById('login-pass-user').value.trim();
  const user = USERS.find(u=>u.name===name && u.pass===pass);
  if(!user){ document.getElementById('login-error-user').style.display='block'; return; }
  setSession({name:user.name, role:user.role});
  renderCostApp();
}

/* USER DASHBOARD */
function buildUserDashboard(session){
  const data = getCostData();
  const myName = session.name;
  const myExpenses = data.expenses.filter(e=>e.payer===myName);
  const myTransfersSent = data.transfers.filter(t=>t.from===myName);
  const myTransfersRecv = data.transfers.filter(t=>t.to===myName);

  // Eigene Kosten nach Status
  const myBar = myExpenses.filter(e=>e.status==='offen').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const myOffenUeber = myExpenses.filter(e=>e.status==='offen_überweisung').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const myBezahlt = myExpenses.filter(e=>e.status==='bezahlt').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const myBezahltUeber = myExpenses.filter(e=>e.status==='bezahlt_überweisung').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const myPaid = myExpenses.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

   let html = `
    <div class="cost-topbar">
      <h3>💰 Meine Kosten</h3>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="user-chip">👤 ${esc(myName)}</span>
        <button class="logout-btn" onclick="costLogout()">🚪 Abmelden</button>
      </div>
    </div>

    <!-- ☁️ SYNC-BUTTONS (User) -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
      <button id="sync-btn" class="btn" style="background:linear-gradient(135deg,#4285f4,#34a853);color:#fff;" onclick="pushToCloud()">☁️ In Google Drive speichern</button>
      <button id="sync-pull-btn" class="btn" style="background:linear-gradient(135deg,#fbbc05,#ea4335);color:#fff;" onclick="pullFromCloud()">📥 Aus Google Drive laden</button>
      <button class="btn btn-center" onclick="saveFileWithData()">💾 Als Datei speichern (Backup)</button>
    </div>
    ${renderSyncStatus()}

    <div class="cost-summary">`;

    html += `
      <div class="cost-card"><div class="label">Gesamt</div><div class="value">${fmt(myPaid)} ${data.currency}</div></div>
      <div class="cost-card"><div class="label">Bar vor Ort</div><div class="value warning">${fmt(myBar)} ${data.currency}</div></div>
      <div class="cost-card"><div class="label">Überweisung offen</div><div class="value purple">${fmt(myOffenUeber)} ${data.currency}</div></div>
      <div class="cost-card"><div class="label">Bezahlt</div><div class="value positive">${fmt(myBezahlt)} ${data.currency}</div></div>
      <div class="cost-card"><div class="label">Bezahlt (Überw.)</div><div class="value positive">${fmt(myBezahltUeber)} ${data.currency}</div></div>
    </div>

    <div class="cost-tabs">
      <button class="cost-tab ${costTab==='overview'?'active':''}" onclick="setCostTab('overview')">📊 Übersicht</button>
      <button class="cost-tab ${costTab==='costs'?'active':''}" onclick="setCostTab('costs')">📝 Meine Kosten</button>
      <button class="cost-tab ${costTab==='transfers'?'active':''}" onclick="setCostTab('transfers')">💸 Überweisungen</button>
      
    </div>
  `;

  if(costTab==='overview'){
    html += `<div class="tab-panel active">`;
    html += `
      <div class="form-section">
        <h4>➕ Neue Kosten hinzufügen</h4>
        <div class="form-row form-row-4">
          <input type="text" id="u-desc" placeholder="Bezeichnung (z.B. Hotel, Essen, Ticket)">
          <input type="number" id="u-amount" placeholder="Betrag (€)" min="0" step="0.01">
          <input type="date" id="u-date" value="${todayStr()}">
          <select id="u-status">
            <option value="offen">🟡 Offen – Bar vor Ort</option>
            <option value="offen_überweisung">💳 Offen – Überweisung</option>
            <option value="bezahlt">🟢 Bezahlt</option>
            <option value="bezahlt_überweisung">✅ Bezahlt – Überweisung</option>
          </select>
        </div>
        <div class="form-row form-row-2" style="max-width:300px;">
          <button onclick="addUserCost()">💾 Kosten speichern</button>
        </div>
      </div>
    `;
    html += `
      <div class="form-section">
        <h4>💸 Überweisung eintragen</h4>
        <div class="form-row form-row-5">
          <input type="text" id="ut-desc" placeholder="Zweck der Überweisung">
          <input type="number" id="ut-amount" placeholder="Betrag (€)" min="0" step="0.01">
          <input type="date" id="ut-date" value="${todayStr()}">
          <select id="ut-to">${getUserOptions(myName)}</select>
          <select id="ut-status"><option value="pending">🟡 Nicht erhalten</option><option value="received">🟢 Erhalten</option></select>
        </div>
        <div class="form-row form-row-2" style="max-width:300px;">
          <button onclick="addUserTransfer()" class="btn-info">💾 Überweisung speichern</button>
        </div>
      </div>
    `;
    html += `<div class="section-title">📊 Zusammenfassung meiner Kosten</div>`;
    html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Status</th><th>Anzahl</th><th class="amount">Betrag</th></tr></thead><tbody>`;
    html += `<tr class="status-bar"><td><span class="status-badge status-bar">🟡 Bar vor Ort</span></td><td>${myExpenses.filter(e=>e.status==='offen').length}</td><td class="amount">${fmt(myBar)} ${data.currency}</td></tr>`;
    html += `<tr class="status-ueber"><td><span class="status-badge status-ueber">💳 Überweisung offen</span></td><td>${myExpenses.filter(e=>e.status==='offen_überweisung').length}</td><td class="amount">${fmt(myOffenUeber)} ${data.currency}</td></tr>`;
    html += `<tr class="status-paid"><td><span class="status-badge status-paid">🟢 Bezahlt</span></td><td>${myExpenses.filter(e=>e.status==='bezahlt').length}</td><td class="amount">${fmt(myBezahlt)} ${data.currency}</td></tr>`;
    html += `<tr class="status-paid"><td><span class="status-badge status-paid">✅ Bezahlt – Überweisung</span></td><td>${myExpenses.filter(e=>e.status==='bezahlt_überweisung').length}</td><td class="amount">${fmt(myBezahltUeber)} ${data.currency}</td></tr>`;
    html += `<tr style="font-weight:700;"><td>Gesamt</td><td>${myExpenses.length}</td><td class="amount">${fmt(myPaid)} ${data.currency}</td></tr>`;
    html += `</tbody></table></div>`;
    if(myTransfersSent.length>0 || myTransfersRecv.length>0){
      html += `<div class="section-title">💸 Meine Überweisungen</div>`;
      const sentTotal = myTransfersSent.reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
      const recvTotal = myTransfersRecv.filter(t=>t.received).reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
      const pendingTotal = myTransfersRecv.filter(t=>!t.received).reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
      html += `<div class="cost-summary" style="grid-template-columns:repeat(3,1fr);">`;
      html += `<div class="cost-card"><div class="label">Gesendet</div><div class="value">${fmt(sentTotal)} ${data.currency}</div></div>`;
      html += `<div class="cost-card"><div class="label">Erhalten</div><div class="value positive">${fmt(recvTotal)} ${data.currency}</div></div>`;
      html += `<div class="cost-card"><div class="label">Ausstehend</div><div class="value warning">${fmt(pendingTotal)} ${data.currency}</div></div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  if(costTab==='costs'){
    html += `<div class="tab-panel active">`;
    html += `<div class="filter-bar">
      <button class="filter-btn ${costFilter==='all'?'active':''}" onclick="setFilter('all')">Alle</button>
      <button class="filter-btn ${costFilter==='offen'?'active':''}" onclick="setFilter('offen')">🟡 Bar vor Ort</button>
      <button class="filter-btn ${costFilter==='offen_überweisung'?'active':''}" onclick="setFilter('offen_überweisung')">💳 Überweisung offen</button>
      <button class="filter-btn ${costFilter==='bezahlt'?'active':''}" onclick="setFilter('bezahlt')">🟢 Bezahlt</button>
      <button class="filter-btn ${costFilter==='bezahlt_überweisung'?'active':''}" onclick="setFilter('bezahlt_überweisung')">✅ Bezahlt (Überw.)</button>
    </div>`;
    let filtered = myExpenses;
    if(costFilter!=='all') filtered = filtered.filter(e=>e.status===costFilter);
    html += `<div class="section-title">📝 Meine Kosten (${filtered.length})</div>`;
    if(filtered.length===0){
      html += `<div class="cost-empty"><div class="cost-empty-icon">📝</div><h4>Keine Kosten gefunden</h4></div>`;
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Datum</th><th>Bezeichnung</th><th>Status</th><th class="amount">Betrag</th><th></th></tr></thead><tbody>`;
      [...filtered].reverse().forEach(ex=>{
        const realIdx = data.expenses.indexOf(ex);
        const si = getStatusInfo(ex.status);
        html += `<tr class="status-${ex.status}"><td>${ex.date||'-'}</td><td>${esc(ex.desc)}</td><td><span class="status-badge ${si.cls}" onclick="toggleCostStatus(${realIdx})" title="Klicken zum Ändern">${si.label}</span></td><td class="amount">${fmt(ex.amount)} ${data.currency}</td><td><div class="table-actions"><button class="toggle-btn" onclick="toggleCostStatus(${realIdx})" title="Status ändern">🔄</button><button class="delete-btn" onclick="deleteCost(${realIdx})">🗑</button></div></td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    html += `</div>`;
  }

  if(costTab==='transfers'){
    html += `<div class="tab-panel active">`;
    html += `<div class="section-title">📤 Gesendete Überweisungen (${myTransfersSent.length})</div>`;
    if(myTransfersSent.length===0){
      html += `<div class="cost-empty"><div class="cost-empty-icon">📤</div><h4>Keine gesendeten Überweisungen</h4></div>`;
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Datum</th><th>Zweck</th><th>An</th><th>Status beim Empfänger</th><th class="amount">Betrag</th><th></th></tr></thead><tbody>`;
      [...myTransfersSent].reverse().forEach(tr=>{
        const realIdx = data.transfers.indexOf(tr);
        const statusClass = tr.received?'status-received':'status-pending';
        const statusLabel = tr.received?'Erhalten':'Nicht erhalten';
        html += `<tr class="${tr.received?'transfer-row':''}"><td>${tr.date||'-'}</td><td>${esc(tr.desc)}</td><td class="payer">${esc(tr.to)}</td><td><span class="status-badge ${statusClass}">${statusLabel}</span></td><td class="amount">${fmt(tr.amount)} ${data.currency}</td><td><button class="delete-btn" onclick="deleteTransfer(${realIdx})">🗑</button></td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    html += `<div class="section-title">📥 Erhaltene Überweisungen (${myTransfersRecv.length})</div>`;
    if(myTransfersRecv.length===0){
      html += `<div class="cost-empty"><div class="cost-empty-icon">📥</div><h4>Keine erhaltenen Überweisungen</h4></div>`;
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Datum</th><th>Zweck</th><th>Von</th><th>Status</th><th class="amount">Betrag</th></tr></thead><tbody>`;
      [...myTransfersRecv].reverse().forEach(tr=>{
        const statusClass = tr.received?'status-received':'status-pending';
        const statusLabel = tr.received?'Erhalten':'Nicht erhalten';
        html += `<tr class="${tr.received?'transfer-row':''}"><td>${tr.date||'-'}</td><td>${esc(tr.desc)}</td><td class="payer">${esc(tr.from)}</td><td><span class="status-badge ${statusClass}">${statusLabel}</span></td><td class="amount">${fmt(tr.amount)} ${data.currency}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    html += `</div>`;
  }



  return html;
}
/* ---------- ADMIN DASHBOARD ---------- */
function buildAdminDashboard(session){
  const data = getCostData();
  const totals = calcTotals(data);
  const userList = USERS.filter(u=>u.role==='user').map(u=>u.name);

  // Kosten nach Status
  const totalBar = data.expenses.filter(e=>e.status==='offen').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalOffenUeber = data.expenses.filter(e=>e.status==='offen_überweisung').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalBezahlt = data.expenses.filter(e=>e.status==='bezahlt').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalBezahltUeber = data.expenses.filter(e=>e.status==='bezahlt_überweisung').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalExp = data.expenses.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalTransfers = data.transfers.reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
  const totalRecv = data.transfers.filter(t=>t.received).reduce((s,t)=>s+(parseFloat(t.amount)||0),0);

    let html = `
    <div class="cost-topbar">
      <h3>👑 Admin Dashboard – Gruppenabrechnung</h3>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="user-chip admin-chip">👑 ${esc(session.name)}</span>
        <button class="logout-btn" onclick="costLogout()">🚪 Abmelden</button>
      </div>
    </div>

    <!-- ☁️ SYNC-BUTTONS (Admin) -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
      <button id="sync-btn" class="btn" style="background:linear-gradient(135deg,#4285f4,#34a853);color:#fff;" onclick="pushToCloud()">☁️ In Google Drive speichern</button>
      <button id="sync-pull-btn" class="btn" style="background:linear-gradient(135deg,#fbbc05,#ea4335);color:#fff;" onclick="pullFromCloud()">📥 Aus Google Drive laden</button>
      <button class="btn btn-center" onclick="saveFileWithData()">💾 Als Datei speichern (Backup)</button>
      <button class="btn btn-center" onclick="exportJSON()">📤 JSON exportieren</button>
      <button class="btn btn-center" onclick="importJSON()">📥 JSON importieren</button>
    </div>
    ${renderSyncStatus()}

    <div class="group-totals">`;

    html += `
      <h4>📊 Gruppenübersicht</h4>
      <div class="group-totals-grid">
        <div class="gt-item"><div class="gt-val">${fmt(totalExp)}</div><div class="gt-label">Gesamtkosten</div></div>
        <div class="gt-item"><div class="gt-val" style="color:#ffcc80;">${fmt(totalBar)}</div><div class="gt-label">Bar vor Ort</div></div>
        <div class="gt-item"><div class="gt-val" style="color:#ce93d8;">${fmt(totalOffenUeber)}</div><div class="gt-label">Überw. offen</div></div>
        <div class="gt-item"><div class="gt-val" style="color:#a5d6a7;">${fmt(totalBezahlt)}</div><div class="gt-label">Bezahlt</div></div>
        <div class="gt-item"><div class="gt-val" style="color:#a5d6a7;">${fmt(totalBezahltUeber)}</div><div class="gt-label">Bezahlt (Überw.)</div></div>
        <div class="gt-item"><div class="gt-val">${fmt(totals.perPerson)}</div><div class="gt-label">Anteil/Person</div></div>
      </div>
    </div>

    <div class="cost-tabs">
      <button class="cost-tab ${costTab==='overview'?'active':''}" onclick="setCostTab('overview')">👥 Personen</button>
      <button class="cost-tab ${costTab==='allcosts'?'active':''}" onclick="setCostTab('allcosts')">📋 Alle Kosten</button>
      <button class="cost-tab ${costTab==='transfers'?'active':''}" onclick="setCostTab('transfers')">💸 Überweisungen</button>
      <button class="cost-tab ${costTab==='add'?'active':''}" onclick="setCostTab('add')">➕ Hinzufügen</button>
      
    </div>
  `;

  if(costTab==='overview'){
    html += `<div class="tab-panel active">`;
    html += `<div class="admin-summary-grid">`;
    userList.forEach(u=>{
      const uPaid = totals.paid[u]||0;
      const uBal = uPaid - totals.perPerson;
      const uCount = data.expenses.filter(e=>e.payer===u).length;
      const uBar = data.expenses.filter(e=>e.payer===u&&e.status==='offen').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
      const uOffenUeber = data.expenses.filter(e=>e.payer===u&&e.status==='offen_überweisung').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
      const uBezahlt = data.expenses.filter(e=>e.payer===u&&e.status==='bezahlt').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
      const uBezahltUeber = data.expenses.filter(e=>e.payer===u&&e.status==='bezahlt_überweisung').reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
      const uTransSent = data.transfers.filter(t=>t.from===u).reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
      const uTransRecv = data.transfers.filter(t=>t.to===u&&t.received).reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
      html += `
        <div class="admin-user-card">
          <div class="auc-name">${esc(u)}</div>
          <div class="auc-role">Reiseteilnehmer</div>
          <div class="auc-row"><span>Ausgaben:</span><strong>${fmt(uPaid)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Anteil:</span><strong>${fmt(totals.perPerson)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Bar vor Ort:</span><strong style="color:var(--warning);">${fmt(uBar)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Überw. offen:</span><strong style="color:var(--purple);">${fmt(uOffenUeber)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Bezahlt:</span><strong style="color:var(--success);">${fmt(uBezahlt)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Bezahlt (Überw.):</span><strong style="color:var(--success);">${fmt(uBezahltUeber)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Überw. gesendet:</span><strong>${fmt(uTransSent)} ${data.currency}</strong></div>
          <div class="auc-row"><span>Überw. erhalten:</span><strong style="color:var(--success);">${fmt(uTransRecv)} ${data.currency}</strong></div>
          <div class="auc-balance ${uBal>0?'positive':(uBal<0?'negative':'neutral')}">${uBal>0?'+':''}${fmt(uBal)} ${data.currency}</div>
        </div>
      `;
    });
    html += `</div>`;
    html += `<div class="section-title">⚖️ Detaillierte Abrechnung</div>`;
    html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Person</th><th>Ausgaben</th><th>Anteil</th><th>Balance</th><th>Status</th></tr></thead><tbody>`;
    userList.forEach(u=>{
      const uPaid = totals.paid[u]||0;
      const uBal = uPaid - totals.perPerson;
      let status = '';
      if(uBal>0.01) status = `<span class="status-badge status-paid">Bekommt ${fmt(uBal)}</span>`;
      else if(uBal<-0.01) status = `<span class="status-badge status-open">Schuldet ${fmt(Math.abs(uBal))}</span>`;
      else status = `<span class="status-badge status-paid">Ausgeglichen</span>`;
      html += `<tr><td class="payer">${esc(u)}</td><td class="amount">${fmt(uPaid)} ${data.currency}</td><td class="amount">${fmt(totals.perPerson)} ${data.currency}</td><td class="amount ${uBal>0?'positive':(uBal<0?'negative':'')}">${uBal>0?'+':''}${fmt(uBal)} ${data.currency}</td><td>${status}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    html += `</div>`;
  }

  if(costTab==='allcosts'){
    html += `<div class="tab-panel active">`;
    html += `<div class="filter-bar">
      <button class="filter-btn ${costFilter==='all'?'active':''}" onclick="setFilter('all')">Alle</button>
      <button class="filter-btn ${costFilter==='offen'?'active':''}" onclick="setFilter('offen')">🟡 Bar vor Ort</button>
      <button class="filter-btn ${costFilter==='offen_überweisung'?'active':''}" onclick="setFilter('offen_überweisung')">💳 Überweisung offen</button>
      <button class="filter-btn ${costFilter==='bezahlt'?'active':''}" onclick="setFilter('bezahlt')">🟢 Bezahlt</button>
      <button class="filter-btn ${costFilter==='bezahlt_überweisung'?'active':''}" onclick="setFilter('bezahlt_überweisung')">✅ Bezahlt (Überw.)</button>
    </div>`;
    let filtered = data.expenses;
    if(costFilter!=='all') filtered = filtered.filter(e=>e.status===costFilter);
    html += `<div class="section-title">📋 Alle Kosten (${filtered.length})</div>`;
    if(filtered.length===0){
      html += `<div class="cost-empty"><div class="cost-empty-icon">📋</div><h4>Keine Kosten gefunden</h4></div>`;
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Datum</th><th>Bezeichnung</th><th>Bezahlt von</th><th>Status</th><th class="amount">Betrag</th><th></th></tr></thead><tbody>`;
      [...filtered].reverse().forEach((ex,idx)=>{
        const realIdx = data.expenses.indexOf(ex);
        const si = getStatusInfo(ex.status);
        html += `<tr class="status-${ex.status}"><td>${ex.date||'-'}</td><td>${esc(ex.desc)}</td><td class="payer">${esc(ex.payer)}</td><td><span class="status-badge ${si.cls}" onclick="toggleCostStatus(${realIdx})" title="Klicken zum Ändern">${si.label}</span></td><td class="amount">${fmt(ex.amount)} ${data.currency}</td><td><div class="table-actions"><button class="toggle-btn" onclick="toggleCostStatus(${realIdx})" title="Status ändern">🔄</button><button class="delete-btn" onclick="deleteCost(${realIdx})">🗑</button></div></td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    html += `</div>`;
  }

  if(costTab==='transfers'){
    html += `<div class="tab-panel active">`;
    html += `<div class="section-title">💸 Alle Überweisungen (${data.transfers.length})</div>`;
    if(data.transfers.length===0){
      html += `<div class="cost-empty"><div class="cost-empty-icon">💸</div><h4>Keine Überweisungen vorhanden</h4></div>`;
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><thead><tr><th>Datum</th><th>Zweck</th><th>Von</th><th>An</th><th>Status</th><th class="amount">Betrag</th><th></th></tr></thead><tbody>`;
      [...data.transfers].reverse().forEach((tr,idx)=>{
        const realIdx = data.transfers.indexOf(tr);
        const statusClass = tr.received?'status-received':'status-pending';
        const statusLabel = tr.received?'Erhalten':'Nicht erhalten';
        html += `<tr class="${tr.received?'transfer-row':''}"><td>${tr.date||'-'}</td><td>${esc(tr.desc)}</td><td class="payer">${esc(tr.from)}</td><td class="payer">${esc(tr.to)}</td><td><span class="status-badge ${statusClass}" onclick="toggleTransferStatus(${realIdx})" title="Klicken zum Ändern">${statusLabel}</span></td><td class="amount">${fmt(tr.amount)} ${data.currency}</td><td><div class="table-actions"><button class="toggle-btn" onclick="toggleTransferStatus(${realIdx})" title="Status ändern">🔄</button><button class="delete-btn" onclick="deleteTransfer(${realIdx})">🗑</button></div></td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    html += `</div>`;
  }

  if(costTab==='add'){
    html += `<div class="tab-panel active">`;
    html += `
      <div class="form-section">
        <h4>➕ Einzelne Kosten hinzufügen</h4>
        <div class="form-row form-row-4">
          <input type="text" id="a-desc" placeholder="Bezeichnung (z.B. Hotel, Essen, Ticket)">
          <input type="number" id="a-amount" placeholder="Betrag (€)" min="0" step="0.01">
          <input type="date" id="a-date" value="${todayStr()}">
          <select id="a-payer">${getUserOptions('')}</select>
        </div>
        <div class="form-row form-row-2" style="max-width:500px;">
          <select id="a-status">
            <option value="offen">🟡 Offen – Bar vor Ort</option>
            <option value="offen_überweisung">💳 Offen – Überweisung</option>
            <option value="bezahlt">🟢 Bezahlt</option>
            <option value="bezahlt_überweisung">✅ Bezahlt – Überweisung</option>
          </select>
          <button onclick="addAdminCost()">💾 Kosten speichern</button>
        </div>
      </div>
    `;
    html += `
      <div class="form-section">
        <h4>➕ Gruppenkosten (gleicher Betrag für alle 9 Teilnehmer)</h4>
        <div class="form-row form-row-4">
          <input type="text" id="g-desc" placeholder="Bezeichnung (z.B. Gruppenhotel, Tour)">
          <input type="number" id="g-amount" placeholder="Betrag pro Person (€)" min="0" step="0.01">
          <input type="date" id="g-date" value="${todayStr()}">
          <select id="g-status">
            <option value="offen">🟡 Offen – Bar vor Ort</option>
            <option value="offen_überweisung">💳 Offen – Überweisung</option>
            <option value="bezahlt">🟢 Bezahlt</option>
            <option value="bezahlt_überweisung">✅ Bezahlt – Überweisung</option>
          </select>
        </div>
        <div class="form-row" style="max-width:400px;">
          <button onclick="addGroupCost()" class="btn-accent">💾 Für alle 9 Teilnehmer hinzufügen</button>
        </div>
      </div>
    `;
    html += `
      <div class="form-section">
        <h4>💸 Überweisung eintragen</h4>
        <div class="form-row form-row-5">
          <input type="text" id="at-desc" placeholder="Zweck der Überweisung">
          <input type="number" id="at-amount" placeholder="Betrag (€)" min="0" step="0.01">
          <input type="date" id="at-date" value="${todayStr()}">
          <select id="at-from">${getUserOptions('')}</select>
          <select id="at-to">${getUserOptions('')}</select>
        </div>
        <div class="form-row form-row-2" style="max-width:400px;">
          <select id="at-status"><option value="pending">🟡 Nicht erhalten</option><option value="received">🟢 Erhalten</option></select>
          <button onclick="addAdminTransfer()" class="btn-info">💾 Überweisung speichern</button>
        </div>
      </div>
    `;
    html += `</div>`;
  }



  return html;
}
Object.assign(window, {
  renderCostApp,
  buildLoginScreen,
  selectUser,
  toggleAdminLogin,
  backToUserList,
  doLogin,
  doUserLogin,
  buildUserDashboard,
  buildAdminDashboard,
  costFilter,
  costTab
});