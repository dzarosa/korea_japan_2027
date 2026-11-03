import type {
  CostData,
  ExpenseStatus,
  Session,
  StatusInfo,
  SyncStatus,
  Totals,
  User,
} from './types';

// Benutzer & Konfiguration
export const USERS: User[] = [
  { name: 'Dariusz Zarosa', pass: 'dzarosa2026', role: 'user' },
  { name: 'Test', pass: 'test', role: 'user' },
  { name: 'Administrator', pass: 'admin', role: 'admin' },
];

const COST_APP_KEY = 'dcw_costs_v6';
const COST_SESSION_KEY = 'dcw_cost_session_v6';
const VISITED_KEY = 'dcw_visited_v1';
const SYNC_KEY = 'dcw_last_sync_v1';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz_fe4Xf5UXXzUpdV9TiSKSJriuXDU5spJi_17E9qWpNvrxjjhiDKG5_CzVqYdcp2znow/exec';

type VisitedData = Record<string, boolean>;

//Hilfsfunktionen

/* Liest JSON sicher aus localStorage */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/* Stellt sicher, dass Kosten-Daten immer eine gültige Struktur haben */
function normaliseCostData(value: unknown): CostData {
  const candidate = (value && typeof value === 'object' ? value : {}) as Partial<CostData>;
  return {
    expenses: Array.isArray(candidate.expenses) ? candidate.expenses : [],
    transfers: Array.isArray(candidate.transfers) ? candidate.transfers : [],
    currency: candidate.currency ?? 'EUR',
    lastModified: candidate.lastModified,
    modifiedBy: candidate.modifiedBy,
  };
}

/* Gibt eine Fehlermeldung zurück */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unbekannter Fehler';
}

//Besuchte Orte

export function getVisitedData(): VisitedData {
  return readJSON<VisitedData>(VISITED_KEY, {});
}

export function saveVisitedData(data: VisitedData): void {
  localStorage.setItem(VISITED_KEY, JSON.stringify(data));
}

export function isVisited(place: string): boolean {
  return getVisitedData()[place] === true;
}

// Session & Login ===

export function getSession(): Session {
  return readJSON<Session>(COST_SESSION_KEY, {});
}

export function setSession(session: Session): void {
  localStorage.setItem(COST_SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(COST_SESSION_KEY);
}

export function isAdmin(): boolean {
  return getSession().role === 'admin';
}

// Kosten-Daten (localStorage)

export function getCostData(): CostData {
  return normaliseCostData(readJSON<unknown>(COST_APP_KEY, {}));
}

export function saveCostData(data: CostData): void {
  localStorage.setItem(COST_APP_KEY, JSON.stringify(normaliseCostData(data)));
}

// Sync-Status

function getSyncStatus(): SyncStatus {
  return readJSON<SyncStatus>(SYNC_KEY, {});
}

function setSyncStatus(status: SyncStatus): void {
  localStorage.setItem(SYNC_KEY, JSON.stringify(status));
}

/* Zeigt an, wann zuletzt synchronisiert wurde */
export function renderSyncStatus(): string {
  const status = getSyncStatus();
  if (!status.lastSync) return '';
  const date = new Date(status.lastSync).toLocaleString('de-DE');
  return `<small class="sync-status">Zuletzt synchronisiert: ${date}</small>`;
}

//GoogleDrive Synchronisation

/* Prüft beim Start, ob neuere Cloud-Daten vorhanden sind */
export async function autoSyncOnLoad(): Promise<void> {
  try {
    const response = await fetch(`${GAS_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const cloudData = normaliseCostData(await response.json());
    if (!Array.isArray(cloudData.expenses)) return;

    const localData = getCostData();
    if ((cloudData.lastModified ?? 0) <= (localData.lastModified ?? 0)) return;

    const message = `Neuere Daten in Google Drive gefunden (von ${cloudData.modifiedBy ?? 'unbekannt'}).\n\nSollen die lokalen Daten aktualisiert werden?`;
    if (window.confirm(message)) {
      saveCostData(cloudData);
      setSyncStatus({ lastSync: Date.now(), source: 'cloud' });
      location.reload();
    }
  } catch (error) {
    console.info('Automatische Synchronisation nicht verfügbar.', error);
  }
}

/*Lädt lokale Daten in GoogleDrive hoch */
export async function pushToCloud(): Promise<void> {
  const data = getCostData();
  data.lastModified = Date.now();
  data.modifiedBy = getSession().name ?? 'Unbekannt';

  const counts = `${data.expenses.length} Kosten, ${data.transfers.length} Überweisungen`;
  if (!window.confirm(`In Google Drive speichern?\n\nEnthält: ${counts}\n\nOK = Hochladen`)) return;

  const button = document.querySelector<HTMLButtonElement>('#sync-btn');
  if (button) {
    button.textContent = 'Speichere ...';
    button.disabled = true;
  }

  try {
    await fetch(`${GAS_URL}?t=${Date.now()}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    setSyncStatus({ lastSync: Date.now(), source: 'local' });
    window.alert('Daten wurden an Google Drive gesendet.');
  } catch (error) {
    // Fallback für Fälle, in denen fetch durch CORS blockiert wird
    try {
      const payload = new Blob([JSON.stringify(data)], { type: 'text/plain;charset=UTF-8' });
      if (!navigator.sendBeacon(`${GAS_URL}?t=${Date.now()}`, payload)) {
        throw new Error('sendBeacon wurde vom Browser abgelehnt.');
      }
      setSyncStatus({ lastSync: Date.now(), source: 'local' });
      window.alert('Daten wurden per Fallback an Google Drive gesendet.');
    } catch (fallbackError) {
      window.alert(`Verbindung zu Google Apps Script fehlgeschlagen: ${errorMessage(fallbackError)}`);
      console.error('Cloud-Synchronisation fehlgeschlagen.', error);
    }
  } finally {
    if (button) {
      button.textContent = 'In Google Drive speichern';
      button.disabled = false;
    }
  }
}

/* Lädt Daten aus GoogleDrive und bietet Ersetzen oder Zusammenführen an */
export async function pullFromCloud(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('#sync-pull-btn');
  if (button) {
    button.textContent = 'Lade ...';
    button.disabled = true;
  }

  try {
    const response = await fetch(`${GAS_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const cloudData = normaliseCostData(await response.json());
    const localData = getCostData();
    const cloudDate = cloudData.lastModified
      ? new Date(cloudData.lastModified).toLocaleString('de-DE')
      : 'unbekannt';

    const replace = window.confirm(
      `Cloud-Daten vom ${cloudDate} laden?\n\n` +
      `Cloud: ${cloudData.expenses.length} Kosten, ${cloudData.transfers.length} Überweisungen\n` +
      `Lokal: ${localData.expenses.length} Kosten, ${localData.transfers.length} Überweisungen\n\n` +
      'OK = Cloud ersetzt lokale Daten\nAbbrechen = beide Datenbestände zusammenführen',
    );

    if (replace) {
      saveCostData(cloudData);
    } else {
      saveCostData({
        expenses: mergeRecords(localData.expenses, cloudData.expenses, ['desc', 'amount', 'payer', 'date']),
        transfers: mergeRecords(localData.transfers, cloudData.transfers, ['desc', 'amount', 'from', 'to', 'date']),
        currency: cloudData.currency || localData.currency,
        lastModified: Date.now(),
        modifiedBy: getSession().name ?? 'Unbekannt',
      });
    }

    setSyncStatus({ lastSync: Date.now(), source: 'cloud' });
    location.reload();
  } catch (error) {
    window.alert(`Cloud-Daten konnten nicht geladen werden: ${errorMessage(error)}`);
  } finally {
    if (button) {
      button.textContent = 'Aus Google Drive laden';
      button.disabled = false;
    }
  }
}

/* Führt zwei Listen zusammen und vermeidet Duplikate */
function mergeRecords<T extends object>(local: T[], cloud: T[], keys: (keyof T)[]): T[] {
  const result = [...local];
  const fingerprint = (item: T): string => keys.map((key) => String(item[key] ?? '')).join('|');
  const seen = new Set(result.map(fingerprint));
  cloud.forEach((item) => {
    const key = fingerprint(item);
    if (!seen.has(key)) {
      result.push(item);
      seen.add(key);
    }
  });
  return result;
}

// Export / Import 
/* Speichert die aktuelle HTML-Seite inkl. eingebetteter Daten */
export function saveFileWithData(): void {
  const data = getCostData();
  let html = `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
  html = html.replace(/<script>window\.__EMBEDDED_DATA__=.*?<\/script>\s*/g, '');
  const dataScript = `<script>window.__EMBEDDED_DATA__=${JSON.stringify(data)};<\/script>`;
  html = html.replace('<head>', `<head>\n${dataScript}`);
  downloadBlob(new Blob([html], { type: 'text/html' }), 'Korea_Japan_Reiseplan_2027_MIT_DATEN.html');
  window.alert('Datei wurde gespeichert.');
}

export function exportJSON(): void {
  const blob = new Blob([JSON.stringify(getCostData(), null, 2)], { type: 'application/json' });
  downloadBlob(blob, `Reisedaten_Export_${todayStr()}.json`);
}

/* Lädt eine Datei im Browser herunter */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importJSON(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      try {
        const data = normaliseCostData(JSON.parse(String(reader.result)));
        if (window.confirm('Daten importieren? Bestehende lokale Daten werden überschrieben.')) {
          saveCostData(data);
          window.alert('Daten erfolgreich importiert.');
          location.reload();
        }
      } catch (error) {
        window.alert(`Ungültige JSON-Datei: ${errorMessage(error)}`);
      }
    });
    reader.readAsText(file);
  }, { once: true });
  input.click();
}

// Berechnungen & Hilfen für die UI

/* Erzeugt Benutzer-Dropdowns */
export function getUserOptions(exclude: string): string {
  return USERS
    .filter((user) => user.role === 'user' && user.name !== exclude)
    .map((user) => `<option value="${esc(user.name)}">${esc(user.name)}</option>`)
    .join('');
}

/* Berechnet Gesamtsumme, Anteil pro Person und bereits Gezahlte Beitrege */
export function calcTotals(data: CostData): Totals {
  const total = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const participantCount = Math.max(USERS.filter((user) => user.role === 'user').length, 1);
  const paid: Record<string, number> = {};
  USERS.forEach((user) => { paid[user.name] = 0; });
  data.expenses.forEach((expense) => {
    paid[expense.payer] = (paid[expense.payer] ?? 0) + expense.amount;
  });
  return { total, perPerson: total / participantCount, paid };
}

/* Formatiert Beträge im DE Format (Komma als Dezimaltrenner) */
export function fmt(value: number | string): string {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  return (Number.isFinite(numeric) ? numeric : 0).toFixed(2).replace('.', ',');
}

/* Schützt Text vor XSS beim Einfügen in HTML */
export function esc(value: unknown): string {
  const entities: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(value ?? '').replace(/[<>&"']/g, (character) => entities[character]);
}

/* Gibt das heutige Datum im Format YYYY-MM-DD zurück */
export function todayStr(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

//Status von Kosten

export function getStatusInfo(status: ExpenseStatus): StatusInfo {
  const statuses: Record<ExpenseStatus, StatusInfo> = {
    offen: { cls: 'status-bar', label: 'Bar vor Ort' },
    offen_überweisung: { cls: 'status-ueber', label: 'Überweisung offen' },
    bezahlt: { cls: 'status-paid', label: 'Bezahlt' },
    bezahlt_überweisung: { cls: 'status-paid', label: 'Bezahlt, Überweisung' },
  };
  return statuses[status] ?? statuses.offen;
}

/* Wechselt zyklisch zum nächsten Status */
export function nextStatus(status: ExpenseStatus): ExpenseStatus {
  const order: ExpenseStatus[] = ['offen', 'offen_überweisung', 'bezahlt', 'bezahlt_überweisung'];
  return order[(order.indexOf(status) + 1) % order.length];
}

// === Eingebettete Daten (beim Öffnen einer gespeicherten HTML-Datei) ===

const embeddedData = window.__EMBEDDED_DATA__;
if (embeddedData && window.confirm('Eingebettete Reisedaten laden? Lokale Daten werden überschrieben.')) {
  saveCostData(embeddedData);
}

// Funktionen global ersichtlich machen
Object.assign(window, {
  pushToCloud,
  pullFromCloud,
  saveFileWithData,
  exportJSON,
  importJSON,
});