import {
  USERS,
  calcTotals,
  clearSession,
  esc,
  fmt,
  getCostData,
  getSession,
  getStatusInfo,
  getUserOptions,
  renderSyncStatus,
  setSession,
  todayStr,
} from './shared';
import type { ExpenseStatus, Session } from './types';

export type CostFilter = 'all' | ExpenseStatus;
export type CostTab = 'overview' | 'costs' | 'transfers' | 'allcosts' | 'add';

let costFilter: CostFilter = 'all';
let costTab: CostTab = 'overview';

// Hauptteil der Kosten-App
//komplette Kostenansicht (Login, Dashboard)
export function renderCostApp(): void {
  const app = document.querySelector<HTMLElement>('#cost-app');
  if (!app) return;
  const session = getSession();
  if (!session.name) {
    app.innerHTML = buildLoginScreen();
    return;
  }
  app.innerHTML = session.role === 'admin'
    ? buildAdminDashboard(session)
    : buildUserDashboard(session);
}

// Hilfsfunktionen
function setFormVisible(id: string, visible: boolean): void {
  const form = document.querySelector<HTMLElement>(`#${id}`);
  if (form) form.hidden = !visible;
}

function setLoginError(id: string, visible: boolean): void {
  const output = document.querySelector<HTMLOutputElement>(`#${id}`);
  if (output) output.hidden = !visible;
}

function valueOf(id: string): string {
  return document.querySelector<HTMLInputElement>(`#${id}`)?.value.trim() ?? '';
}

//Login
//Baut den Login-Seite (Benutzerliste  und Admin-Login)
export function buildLoginScreen(): string {
  const userButtons = USERS
    .filter((user) => user.role === 'user')
    .map((user) => `
      <button type="button" class="login-user-btn" onclick="selectUser('${esc(user.name)}')">
        <span class="lu-avatar" aria-hidden="true">${user.name.split(' ').map((part) => part[0]).join('').substring(0, 2)}</span>
        <span class="lu-copy"><span class="lu-name">${esc(user.name)}</span><span class="lu-role">Reiseteilnehmer</span></span>
      </button>`)
    .join('');

  return `
    <section class="cost-login-wrap" aria-labelledby="login-title">
      <p class="cost-empty-icon" aria-hidden="true">🔐</p>
      <h3 id="login-title">Kostenabrechnung - Anmeldung</h3>
      <p>Wähle deinen Namen aus der Liste oder melde dich als Administrator an.</p>
      <div class="login-grid">
        ${userButtons}
        <button type="button" class="login-user-btn admin-login-btn" onclick="toggleAdminLogin()" aria-controls="admin-login-form" aria-expanded="false">
          <span class="lu-avatar admin-avatar" aria-hidden="true">A</span>
          <span class="lu-copy"><span class="lu-name">Administrator</span><span class="lu-role">Admin-Zugang</span></span>
        </button>
      </div>

      <form id="admin-login-form" class="login-form" onsubmit="doLogin();return false" hidden>
        <label class="sr-only" for="login-name">Benutzername</label>
        <input type="text" id="login-name" autocomplete="username" value="Administrator" required>
        <label class="sr-only" for="login-pass">Passwort</label>
        <input type="password" id="login-pass" autocomplete="current-password" placeholder="Passwort" required>
        <output class="login-error" id="login-error" role="alert" hidden>Benutzername oder Passwort falsch.</output>
        <button type="submit">Anmelden</button>
      </form>

      <form id="user-login-form" class="login-form" onsubmit="doUserLogin();return false" hidden>
        <label class="sr-only" for="login-name-user">Benutzername</label>
        <input type="text" id="login-name-user" autocomplete="username" readonly>
        <label class="sr-only" for="login-pass-user">Passwort</label>
        <input type="password" id="login-pass-user" autocomplete="current-password" placeholder="Passwort" required>
        <output class="login-error" id="login-error-user" role="alert" hidden>Passwort falsch.</output>
        <button type="submit">Anmelden</button>
        <button type="button" class="login-toggle" onclick="backToUserList()">Zurück zur Liste</button>
      </form>
    </section>`;
}

//Zeige das Passwort-Form für einen ausgewählten Benutzer
export function selectUser(name: string): void {
  setFormVisible('admin-login-form', false);
  setFormVisible('user-login-form', true);
  const nameInput = document.querySelector<HTMLInputElement>('#login-name-user');
  if (nameInput) nameInput.value = name;
  setLoginError('login-error-user', false);
  document.querySelector<HTMLInputElement>('#login-pass-user')?.focus();
}

//Blendet das Admin-Login ein/aus 
export function toggleAdminLogin(): void {
  setFormVisible('user-login-form', false);
  const form = document.querySelector<HTMLFormElement>('#admin-login-form');
  const show = form?.hidden ?? false;
  setFormVisible('admin-login-form', show);
  const trigger = document.querySelector<HTMLButtonElement>('.admin-login-btn');
  trigger?.setAttribute('aria-expanded', String(show));
  if (show) document.querySelector<HTMLInputElement>('#login-pass')?.focus();
}

//Zur Benutzerliste zurückkehren
export function backToUserList(): void {
  setFormVisible('user-login-form', false);
  setFormVisible('admin-login-form', false);
  document.querySelector<HTMLButtonElement>('.admin-login-btn')?.setAttribute('aria-expanded', 'false');
}

// Login für Administrator
export function doLogin(): void {
  const user = USERS.find((entry) => entry.name === valueOf('login-name') && entry.pass === valueOf('login-pass'));
  if (!user) {
    setLoginError('login-error', true);
    return;
  }
  setSession({ name: user.name, role: user.role });
  renderCostApp();
}

// Login für normalen User
export function doUserLogin(): void {
  const user = USERS.find((entry) => entry.name === valueOf('login-name-user') && entry.pass === valueOf('login-pass-user'));
  if (!user) {
    setLoginError('login-error-user', true);
    return;
  }
  setSession({ name: user.name, role: user.role });
  renderCostApp();
}

// Filter & Tabs
export function setFilter(filter: CostFilter): void {
  costFilter = filter;
  renderCostApp();
}
export function setCostTab(tab: CostTab): void {
  costTab = tab;
  renderCostApp();
}
export function costLogout(): void {
  clearSession();
  costFilter = 'all';
  costTab = 'overview';
  renderCostApp();
}

//Wiederverwendbare Bauelemente
// Buttons für Cloud-Sync und Backup
function syncButtons(isAdmin: boolean): string {
  return `
    <nav class="sync-actions" aria-label="Datensicherung und Synchronisation">
      <button type="button" id="sync-btn" class="btn btn-cloud-save" onclick="pushToCloud()">In Google Drive speichern</button>
      <button type="button" id="sync-pull-btn" class="btn btn-cloud-load" onclick="pullFromCloud()">Aus Google Drive laden</button>
      <button type="button" class="btn btn-center" onclick="saveFileWithData()">Als Datei speichern (Backup)</button>
      ${isAdmin ? `
        <button type="button" class="btn btn-center" onclick="exportJSON()">JSON exportieren</button>
        <button type="button" class="btn btn-center" onclick="importJSON()">JSON importieren</button>` : ''}
    </nav>
    ${renderSyncStatus()}`;
}

function dashboardHeader(title: string, session: Session): string {
  return `
    <header class="cost-topbar">
      <h3>${title}</h3>
      <p class="session-actions">
        <span class="user-chip ${session.role === 'admin' ? 'admin-chip' : ''}">${esc(session.name)}</span>
        <button type="button" class="logout-btn" onclick="costLogout()">Abmelden</button>
      </p>
    </header>`;
}
function costTabs(items: { id: CostTab; label: string }[]): string {
  return `<nav class="cost-tabs" aria-label="Bereiche der Kostenabrechnung">
    ${items.map((item) => `<button type="button" class="cost-tab ${costTab === item.id ? 'active' : ''}" aria-pressed="${costTab === item.id}" onclick="setCostTab('${item.id}')">${item.label}</button>`).join('')}
  </nav>`;
}
function emptyState(message: string): string {
  return `<section class="cost-empty"><h4>${message}</h4></section>`;
}
// User-Dashboard
function buildUserDashboard(session: Session): string {
  const data = getCostData();
  const myName = session.name ?? '';
  const myExpenses = data.expenses.filter((expense) => expense.payer === myName);
  const myTransfersSent = data.transfers.filter((transfer) => transfer.from === myName);
  const myTransfersRecv = data.transfers.filter((transfer) => transfer.to === myName);
  const sum = (status: ExpenseStatus): number => myExpenses
    .filter((expense) => expense.status === status)
    .reduce((total, expense) => total + expense.amount, 0);
  const myBar = sum('offen');
  const myOffenUeber = sum('offen_überweisung');
  const myBezahlt = sum('bezahlt');
  const myBezahltUeber = sum('bezahlt_überweisung');
  const myPaid = myExpenses.reduce((total, expense) => total + expense.amount, 0);
  let html = `
    ${dashboardHeader('Meine Kosten', session)}
    ${syncButtons(false)}
    <dl class="cost-summary" aria-label="Zusammenfassung meiner Kosten">
      <div class="cost-card"><dt class="label">Gesamt</dt><dd class="value">${fmt(myPaid)} ${data.currency}</dd></div>
      <div class="cost-card"><dt class="label">Bar vor Ort</dt><dd class="value warning">${fmt(myBar)} ${data.currency}</dd></div>
      <div class="cost-card"><dt class="label">Überweisung offen</dt><dd class="value purple">${fmt(myOffenUeber)} ${data.currency}</dd></div>
      <div class="cost-card"><dt class="label">Bezahlt</dt><dd class="value positive">${fmt(myBezahlt)} ${data.currency}</dd></div>
      <div class="cost-card"><dt class="label">Bezahlt (Überw.)</dt><dd class="value positive">${fmt(myBezahltUeber)} ${data.currency}</dd></div>
    </dl>
    ${costTabs([
      { id: 'overview', label: 'Übersicht' },
      { id: 'costs', label: 'Meine Kosten' },
      { id: 'transfers', label: 'Überweisungen' },
    ])}`;

  // Tab: Übersicht (Formulare und Zusammenfassung)
  if (costTab === 'overview') {
    html += `
      <section class="tab-panel active" aria-label="Neue Einträge und Übersicht">
        <section class="form-section">
          <h4>Neue Kosten hinzufügen</h4>
          <form onsubmit="addUserCost();return false">
            <div class="form-row form-row-4">
              <label class="sr-only" for="u-desc">Bezeichnung</label>
              <input type="text" id="u-desc" placeholder="Bezeichnung (z. B. Hotel, Essen, Ticket)" required>
              <label class="sr-only" for="u-amount">Betrag in Euro</label>
              <input type="number" id="u-amount" placeholder="Betrag (€)" min="0.01" step="0.01" required>
              <label class="sr-only" for="u-date">Datum</label>
              <input type="date" id="u-date" value="${todayStr()}" required>
              <label class="sr-only" for="u-status">Zahlungsstatus</label>
              <select id="u-status">
                <option value="offen">Offen - Bar vor Ort</option>
                <option value="offen_überweisung">Offen - Überweisung</option>
                <option value="bezahlt">Bezahlt</option>
                <option value="bezahlt_überweisung">Bezahlt - Überweisung</option>
              </select>
            </div>
            <div class="form-row form-row-2 form-submit"><button type="submit">Kosten speichern</button></div>
          </form>
        </section>
        <section class="form-section">
          <h4>Überweisung eintragen</h4>
          <form onsubmit="addUserTransfer();return false">
            <div class="form-row form-row-5">
              <label class="sr-only" for="ut-desc">Zweck der Überweisung</label>
              <input type="text" id="ut-desc" placeholder="Zweck der Überweisung" required>
              <label class="sr-only" for="ut-amount">Betrag in Euro</label>
              <input type="number" id="ut-amount" placeholder="Betrag (€)" min="0.01" step="0.01" required>
              <label class="sr-only" for="ut-date">Datum</label>
              <input type="date" id="ut-date" value="${todayStr()}" required>
              <label class="sr-only" for="ut-to">Empfänger</label>
              <select id="ut-to" required>${getUserOptions(myName)}</select>
              <label class="sr-only" for="ut-status">Empfangsstatus</label>
              <select id="ut-status"><option value="pending">Nicht erhalten</option><option value="received">Erhalten</option></select>
            </div>
            <div class="form-row form-row-2 form-submit"><button type="submit" class="btn-info">Überweisung speichern</button></div>
          </form>
        </section>
        <h4 class="section-title">Zusammenfassung der Kosten</h4>
        <div class="cost-table-wrap">
          <table class="cost-table">
            <caption class="sr-only">Kosten nach Zahlungsstatus</caption>
            <thead><tr><th scope="col">Status</th><th scope="col">Anzahl</th><th scope="col" class="amount">Betrag</th></tr></thead>
            <tbody>
              <tr class="status-bar"><td>Bar vor Ort</td><td>${myExpenses.filter((expense) => expense.status === 'offen').length}</td><td class="amount">${fmt(myBar)} ${data.currency}</td></tr>
              <tr class="status-ueber"><td>Überweisung offen</td><td>${myExpenses.filter((expense) => expense.status === 'offen_überweisung').length}</td><td class="amount">${fmt(myOffenUeber)} ${data.currency}</td></tr>
              <tr class="status-paid"><td>Bezahlt</td><td>${myExpenses.filter((expense) => expense.status === 'bezahlt').length}</td><td class="amount">${fmt(myBezahlt)} ${data.currency}</td></tr>
              <tr class="status-paid"><td>Bezahlt - Überweisung</td><td>${myExpenses.filter((expense) => expense.status === 'bezahlt_überweisung').length}</td><td class="amount">${fmt(myBezahltUeber)} ${data.currency}</td></tr>
              <tr class="table-total"><td>Gesamt</td><td>${myExpenses.length}</td><td class="amount">${fmt(myPaid)} ${data.currency}</td></tr>
            </tbody>
          </table>
        </div>`;
    if (myTransfersSent.length > 0 || myTransfersRecv.length > 0) {
      const sentTotal = myTransfersSent.reduce((total, transfer) => total + transfer.amount, 0);
      const recvTotal = myTransfersRecv.filter((transfer) => transfer.received).reduce((total, transfer) => total + transfer.amount, 0);
      const pendingTotal = myTransfersRecv.filter((transfer) => !transfer.received).reduce((total, transfer) => total + transfer.amount, 0);
      html += `
        <h4 class="section-title">Meine Überweisungen</h4>
        <dl class="cost-summary transfer-summary">
          <div class="cost-card"><dt class="label">Gesendet</dt><dd class="value">${fmt(sentTotal)} ${data.currency}</dd></div>
          <div class="cost-card"><dt class="label">Erhalten</dt><dd class="value positive">${fmt(recvTotal)} ${data.currency}</dd></div>
          <div class="cost-card"><dt class="label">Ausstehend</dt><dd class="value warning">${fmt(pendingTotal)} ${data.currency}</dd></div>
        </dl>`;
    }
    html += '</section>';
  }
  // Reiter Meine Kosten (Liste und Filter)
  if (costTab === 'costs') {
    const filtered = costFilter === 'all'
      ? myExpenses
      : myExpenses.filter((expense) => expense.status === costFilter);
    html += `
      <section class="tab-panel active" aria-label="Meine erfassten Kosten">
        ${filterButtons()}
        <h4 class="section-title">Meine Kosten (${filtered.length})</h4>`;
    if (filtered.length === 0) {
      html += emptyState('Keine Kosten gefunden');
    } else {
      html += `
        <div class="cost-table-wrap"><table class="cost-table">
          <caption class="sr-only">Meine erfassten Kosten</caption>
          <thead><tr><th scope="col">Datum</th><th scope="col">Bezeichnung</th><th scope="col">Status</th><th scope="col" class="amount">Betrag</th><th scope="col">Aktionen</th></tr></thead>
          <tbody>${[...filtered].reverse().map((expense) => {
            const index = data.expenses.indexOf(expense);
            const status = getStatusInfo(expense.status);
            return `<tr class="status-${expense.status}"><td>${esc(expense.date)}</td><td>${esc(expense.desc)}</td><td><button type="button" class="status-badge ${status.cls}" onclick="toggleCostStatus(${index})" aria-label="Status für ${esc(expense.desc)} ändern">${status.label}</button></td><td class="amount">${fmt(expense.amount)} ${data.currency}</td><td><div class="table-actions"><button type="button" class="toggle-btn" onclick="toggleCostStatus(${index})">Status ändern</button><button type="button" class="delete-btn" onclick="deleteCost(${index})" aria-label="${esc(expense.desc)} löschen">Löschen</button></div></td></tr>`;
          }).join('')}</tbody>
        </table></div>`;
    }
    html += '</section>';
  }
  // Reiter: Überweisungen
  if (costTab === 'transfers') {
    html += '<section class="tab-panel active" aria-label="Meine Überweisungen">';
    html += `<h4 class="section-title">Gesendete Überweisungen (${myTransfersSent.length})</h4>`;
    if (myTransfersSent.length === 0) {
      html += emptyState('Keine gesendeten Überweisungen');
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">Gesendete Überweisungen</caption><thead><tr><th scope="col">Datum</th><th scope="col">Zweck</th><th scope="col">An</th><th scope="col">Status</th><th scope="col" class="amount">Betrag</th><th scope="col">Aktion</th></tr></thead><tbody>`;
      [...myTransfersSent].reverse().forEach((transfer) => {
        const index = data.transfers.indexOf(transfer);
        html += `<tr class="${transfer.received ? 'transfer-row' : ''}"><td>${esc(transfer.date)}</td><td>${esc(transfer.desc)}</td><td class="payer">${esc(transfer.to)}</td><td><span class="status-badge ${transfer.received ? 'status-received' : 'status-pending'}">${transfer.received ? 'Erhalten' : 'Nicht erhalten'}</span></td><td class="amount">${fmt(transfer.amount)} ${data.currency}</td><td><button type="button" class="delete-btn" onclick="deleteTransfer(${index})" aria-label="Überweisung ${esc(transfer.desc)} löschen">Löschen</button></td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += `<h4 class="section-title">Erhaltene Überweisungen (${myTransfersRecv.length})</h4>`;
    if (myTransfersRecv.length === 0) {
      html += emptyState('Keine erhaltenen Überweisungen');
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">Erhaltene Überweisungen</caption><thead><tr><th scope="col">Datum</th><th scope="col">Zweck</th><th scope="col">Von</th><th scope="col">Status</th><th scope="col" class="amount">Betrag</th></tr></thead><tbody>`;
      [...myTransfersRecv].reverse().forEach((transfer) => {
        html += `<tr class="${transfer.received ? 'transfer-row' : ''}"><td>${esc(transfer.date)}</td><td>${esc(transfer.desc)}</td><td class="payer">${esc(transfer.from)}</td><td><span class="status-badge ${transfer.received ? 'status-received' : 'status-pending'}">${transfer.received ? 'Erhalten' : 'Nicht erhalten'}</span></td><td class="amount">${fmt(transfer.amount)} ${data.currency}</td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += '</section>';
  }
  return html;
}
function filterButtons(): string {
  const filters: { id: CostFilter; label: string }[] = [
    { id: 'all', label: 'Alle' },
    { id: 'offen', label: 'Bar vor Ort' },
    { id: 'offen_überweisung', label: 'Überweisung offen' },
    { id: 'bezahlt', label: 'Bezahlt' },
    { id: 'bezahlt_überweisung', label: 'Bezahlt (Überw.)' },
  ];
  return `<nav class="filter-bar" aria-label="Kosten nach Status filtern">${filters.map((filter) => `<button type="button" class="filter-btn ${costFilter === filter.id ? 'active' : ''}" aria-pressed="${costFilter === filter.id}" onclick="setFilter('${filter.id}')">${filter.label}</button>`).join('')}</nav>`;
}

// Admin-Dashboard
function buildAdminDashboard(session: Session): string {
  const data = getCostData();
  const totals = calcTotals(data);
  const userList = USERS.filter((user) => user.role === 'user').map((user) => user.name);
  const sumByStatus = (status: ExpenseStatus): number => data.expenses
    .filter((expense) => expense.status === status)
    .reduce((total, expense) => total + expense.amount, 0);
  const totalBar = sumByStatus('offen');
  const totalOffenUeber = sumByStatus('offen_überweisung');
  const totalBezahlt = sumByStatus('bezahlt');
  const totalBezahltUeber = sumByStatus('bezahlt_überweisung');
  let html = `
    ${dashboardHeader('Admin-Dashboard - Gruppenabrechnung', session)}
    ${syncButtons(true)}
    <section class="group-totals" aria-labelledby="group-totals-title">
      <h4 id="group-totals-title">Gruppenübersicht</h4>
      <dl class="group-totals-grid">
        <div class="gt-item"><dd class="gt-val">${fmt(totals.total)}</dd><dt class="gt-label">Gesamtkosten</dt></div>
        <div class="gt-item"><dd class="gt-val total-bar">${fmt(totalBar)}</dd><dt class="gt-label">Bar vor Ort</dt></div>
        <div class="gt-item"><dd class="gt-val total-transfer">${fmt(totalOffenUeber)}</dd><dt class="gt-label">Überw. offen</dt></div>
        <div class="gt-item"><dd class="gt-val total-paid">${fmt(totalBezahlt)}</dd><dt class="gt-label">Bezahlt</dt></div>
        <div class="gt-item"><dd class="gt-val total-paid">${fmt(totalBezahltUeber)}</dd><dt class="gt-label">Bezahlt (Überw.)</dt></div>
        <div class="gt-item"><dd class="gt-val">${fmt(totals.perPerson)}</dd><dt class="gt-label">Anteil/Person</dt></div>
      </dl>
    </section>
    ${costTabs([
      { id: 'overview', label: 'Personen' },
      { id: 'allcosts', label: 'Alle Kosten' },
      { id: 'transfers', label: 'Überweisungen' },
      { id: 'add', label: 'Hinzufügen' },
    ])}`;

  // Reiter: Personen (Übersicht pro Teilnehmer)
  if (costTab === 'overview') {
    html += '<section class="tab-panel active" aria-label="Abrechnung pro Person"><div class="admin-summary-grid">';
    userList.forEach((user) => {
      const expenses = data.expenses.filter((expense) => expense.payer === user);
      const paid = totals.paid[user] ?? 0;
      const balance = paid - totals.perPerson;
      const userSum = (status: ExpenseStatus): number => expenses
        .filter((expense) => expense.status === status)
        .reduce((total, expense) => total + expense.amount, 0);
      const sent = data.transfers.filter((transfer) => transfer.from === user).reduce((total, transfer) => total + transfer.amount, 0);
      const received = data.transfers.filter((transfer) => transfer.to === user && transfer.received).reduce((total, transfer) => total + transfer.amount, 0);
      html += `
        <article class="admin-user-card">
          <h4 class="auc-name">${esc(user)}</h4>
          <p class="auc-role">Reiseteilnehmer · ${expenses.length} Einträge</p>
          <p class="auc-row"><span>Ausgaben:</span><strong>${fmt(paid)} ${data.currency}</strong></p>
          <p class="auc-row"><span>Anteil:</span><strong>${fmt(totals.perPerson)} ${data.currency}</strong></p>
          <p class="auc-row"><span>Bar vor Ort:</span><strong class="warning">${fmt(userSum('offen'))} ${data.currency}</strong></p>
          <p class="auc-row"><span>Überw. offen:</span><strong class="purple">${fmt(userSum('offen_überweisung'))} ${data.currency}</strong></p>
          <p class="auc-row"><span>Bezahlt:</span><strong class="positive">${fmt(userSum('bezahlt'))} ${data.currency}</strong></p>
          <p class="auc-row"><span>Bezahlt (Überw.):</span><strong class="positive">${fmt(userSum('bezahlt_überweisung'))} ${data.currency}</strong></p>
          <p class="auc-row"><span>Überw. gesendet:</span><strong>${fmt(sent)} ${data.currency}</strong></p>
          <p class="auc-row"><span>Überw. erhalten:</span><strong class="positive">${fmt(received)} ${data.currency}</strong></p>
          <p class="auc-balance ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'}">${balance > 0 ? '+' : ''}${fmt(balance)} ${data.currency}</p>
        </article>`;
    });
    html += `</div>
      <h4 class="section-title">Detaillierte Abrechnung</h4>
      <div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">Balance pro Reiseteilnehmer</caption><thead><tr><th scope="col">Person</th><th scope="col">Ausgaben</th><th scope="col">Anteil</th><th scope="col">Balance</th><th scope="col">Status</th></tr></thead><tbody>`;
    userList.forEach((user) => {
      const paid = totals.paid[user] ?? 0;
      const balance = paid - totals.perPerson;
      const status = balance > 0.01
        ? `<span class="status-badge status-paid">Bekommt ${fmt(balance)}</span>`
        : balance < -0.01
          ? `<span class="status-badge status-open">Schuldet ${fmt(Math.abs(balance))}</span>`
          : '<span class="status-badge status-paid">Ausgeglichen</span>';
      html += `<tr><td class="payer">${esc(user)}</td><td class="amount">${fmt(paid)} ${data.currency}</td><td class="amount">${fmt(totals.perPerson)} ${data.currency}</td><td class="amount ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : ''}">${balance > 0 ? '+' : ''}${fmt(balance)} ${data.currency}</td><td>${status}</td></tr>`;
    });
    html += '</tbody></table></div></section>';
  }

  // Reiter: Alle Kosten
  if (costTab === 'allcosts') {
    const filtered = costFilter === 'all'
      ? data.expenses
      : data.expenses.filter((expense) => expense.status === costFilter);
    html += `<section class="tab-panel active" aria-label="Alle Kosten">${filterButtons()}<h4 class="section-title">Alle Kosten (${filtered.length})</h4>`;
    if (filtered.length === 0) {
      html += emptyState('Keine Kosten gefunden');
    } else {
      html += `<div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">Alle erfassten Gruppenkosten</caption><thead><tr><th scope="col">Datum</th><th scope="col">Bezeichnung</th><th scope="col">Bezahlt von</th><th scope="col">Status</th><th scope="col" class="amount">Betrag</th><th scope="col">Aktionen</th></tr></thead><tbody>`;
      [...filtered].reverse().forEach((expense) => {
        const index = data.expenses.indexOf(expense);
        const status = getStatusInfo(expense.status);
        html += `<tr class="status-${expense.status}"><td>${esc(expense.date)}</td><td>${esc(expense.desc)}</td><td class="payer">${esc(expense.payer)}</td><td><button type="button" class="status-badge ${status.cls}" onclick="toggleCostStatus(${index})" aria-label="Status für ${esc(expense.desc)} ändern">${status.label}</button></td><td class="amount">${fmt(expense.amount)} ${data.currency}</td><td><div class="table-actions"><button type="button" class="toggle-btn" onclick="toggleCostStatus(${index})">Status ändern</button><button type="button" class="delete-btn" onclick="deleteCost(${index})" aria-label="${esc(expense.desc)} löschen">Löschen</button></div></td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += '</section>';
  }
  // Reiter: Alle Überweisungen
  if (costTab === 'transfers') {
    html += `<section class="tab-panel active" aria-label="Alle Überweisungen"><h4 class="section-title">Alle Überweisungen (${data.transfers.length})</h4>`;
    if (data.transfers.length === 0) {
      html += emptyState('Keine Überweisungen vorhanden');
    } else {
      html += '<div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">Alle Gruppenüberweisungen</caption><thead><tr><th scope="col">Datum</th><th scope="col">Zweck</th><th scope="col">Von</th><th scope="col">An</th><th scope="col">Status</th><th scope="col" class="amount">Betrag</th><th scope="col">Aktionen</th></tr></thead><tbody>';
      [...data.transfers].reverse().forEach((transfer) => {
        const index = data.transfers.indexOf(transfer);
        html += `<tr class="${transfer.received ? 'transfer-row' : ''}"><td>${esc(transfer.date)}</td><td>${esc(transfer.desc)}</td><td class="payer">${esc(transfer.from)}</td><td class="payer">${esc(transfer.to)}</td><td><button type="button" class="status-badge ${transfer.received ? 'status-received' : 'status-pending'}" onclick="toggleTransferStatus(${index})" aria-label="Empfangsstatus für ${esc(transfer.desc)} ändern">${transfer.received ? 'Erhalten' : 'Nicht erhalten'}</button></td><td class="amount">${fmt(transfer.amount)} ${data.currency}</td><td><div class="table-actions"><button type="button" class="toggle-btn" onclick="toggleTransferStatus(${index})">Status ändern</button><button type="button" class="delete-btn" onclick="deleteTransfer(${index})" aria-label="Überweisung ${esc(transfer.desc)} löschen">Löschen</button></div></td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += '</section>';
  }

  // Reiter: Hinzufügen
  if (costTab === 'add') {
    html += `
      <section class="tab-panel active" aria-label="Neue Gruppeneinträge">
        <section class="form-section">
          <h4>Einzelne Kosten hinzufügen</h4>
          <form onsubmit="addAdminCost();return false">
            <div class="form-row form-row-4">
              <label class="sr-only" for="a-desc">Bezeichnung</label><input type="text" id="a-desc" placeholder="Bezeichnung (z. B. Hotel, Essen, Ticket)" required>
              <label class="sr-only" for="a-amount">Betrag in Euro</label><input type="number" id="a-amount" placeholder="Betrag (€)" min="0.01" step="0.01" required>
              <label class="sr-only" for="a-date">Datum</label><input type="date" id="a-date" value="${todayStr()}" required>
              <label class="sr-only" for="a-payer">Bezahlt von</label><select id="a-payer" required><option value="">Bezahler wählen</option>${getUserOptions('')}</select>
            </div>
            <div class="form-row form-row-2 form-submit-wide">
              <label class="sr-only" for="a-status">Zahlungsstatus</label><select id="a-status"><option value="offen">Offen - Bar vor Ort</option><option value="offen_überweisung">Offen - Überweisung</option><option value="bezahlt">Bezahlt</option><option value="bezahlt_überweisung">Bezahlt - Überweisung</option></select>
              <button type="submit">Kosten speichern</button>
            </div>
          </form>
        </section>

        <section class="form-section">
          <h4>Gruppenkosten für alle ${userList.length} Teilnehmer</h4>
          <form onsubmit="addGroupCost();return false">
            <div class="form-row form-row-4">
              <label class="sr-only" for="g-desc">Bezeichnung</label><input type="text" id="g-desc" placeholder="Bezeichnung (z. B. Gruppenhotel, Tour)" required>
              <label class="sr-only" for="g-amount">Betrag pro Person in Euro</label><input type="number" id="g-amount" placeholder="Betrag pro Person (€)" min="0.01" step="0.01" required>
              <label class="sr-only" for="g-date">Datum</label><input type="date" id="g-date" value="${todayStr()}" required>
              <label class="sr-only" for="g-status">Zahlungsstatus</label><select id="g-status"><option value="offen">Offen - Bar vor Ort</option><option value="offen_überweisung">Offen - Überweisung</option><option value="bezahlt">Bezahlt</option><option value="bezahlt_überweisung">Bezahlt - Überweisung</option></select>
            </div>
            <div class="form-row form-submit"><button type="submit" class="btn-accent">Für alle ${userList.length} Teilnehmer hinzufügen</button></div>
          </form>
        </section>

        <section class="form-section">
          <h4>Überweisung eintragen</h4>
          <form onsubmit="addAdminTransfer();return false">
            <div class="form-row form-row-5">
              <label class="sr-only" for="at-desc">Zweck</label><input type="text" id="at-desc" placeholder="Zweck der Überweisung" required>
              <label class="sr-only" for="at-amount">Betrag in Euro</label><input type="number" id="at-amount" placeholder="Betrag (€)" min="0.01" step="0.01" required>
              <label class="sr-only" for="at-date">Datum</label><input type="date" id="at-date" value="${todayStr()}" required>
              <label class="sr-only" for="at-from">Absender</label><select id="at-from" required><option value="">Absender wählen</option>${getUserOptions('')}</select>
              <label class="sr-only" for="at-to">Empfänger</label><select id="at-to" required><option value="">Empfänger wählen</option>${getUserOptions('')}</select>
            </div>
            <div class="form-row form-row-2 form-submit-wide">
              <label class="sr-only" for="at-status">Empfangsstatus</label><select id="at-status"><option value="pending">Nicht erhalten</option><option value="received">Erhalten</option></select>
              <button type="submit" class="btn-info">Überweisung speichern</button>
            </div>
          </form>
        </section>
      </section>`;
  }

  return html;
}
// Globale Funktionen für onclick-Handler im HTML
Object.assign(window, {
  renderCostApp,
  selectUser,
  toggleAdminLogin,
  backToUserList,
  doLogin,
  doUserLogin,
  setFilter,
  setCostTab,
  costLogout,
});