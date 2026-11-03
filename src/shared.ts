// User
const USERS = [
  {name:"Dariusz Zarosa", pass:"dzarosa2026", role:"user"},
  {name:"Test", pass:"test", role:"user"},
  {name:"Administrator", pass:"admin", role:"admin"}
];

const COST_APP_KEY = 'dcw_costs_v6';
const COST_SESSION_KEY = 'dcw_cost_session_v6';
const VISITED_KEY = 'dcw_visited_v1';
let currentDayId = 'd17';

function getVisitedData(){ try{ return JSON.parse(localStorage.getItem(VISITED_KEY)||'{}'); }catch(e){ return {}; } }
function saveVisitedData(d){ localStorage.setItem(VISITED_KEY, JSON.stringify(d)); }
function toggleVisited(place){ const d=getVisitedData(); d[place]=!d[place]; saveVisitedData(d); renderDay(currentDayId); }
function isVisited(place){ return !!getVisitedData()[place]; }
function isAdmin(){ const s=getSession(); return s&&s.role==='admin'; }

//  GOOGLE DRIVE CLOUD SYNC (Google Apps Script)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzkD86SRv7vwLwfF9q_JoHpM9afSpBZzdwi64qI4h_U0v1qY4BIdeOBh2o4Ssx34F5W/exec';
const SYNC_KEY = 'dcw_last_sync_v1';

function getSyncStatus(){
  try { return JSON.parse(localStorage.getItem(SYNC_KEY)||'{}'); } catch(e){ return {}; }
}
function setSyncStatus(s){ localStorage.setItem(SYNC_KEY, JSON.stringify(s)); }

// Automatisch beim Start prüfen (wenn URL konfiguriert)
async function autoSyncOnLoad(){
  if(GAS_URL.includes('HIER_DEINE')) return;
  try {
    const resp = await fetch(GAS_URL + '?t=' + Date.now(), {cache:'no-store'});
    const cloudData = await resp.json();
    if(!cloudData || !cloudData.expenses) return;
    
    const localData = getCostData();
    const cloudTime = cloudData.lastModified || 0;
    const localTime = localData.lastModified || 0;
    
    if(cloudTime > localTime){
      if(confirm('☁️ Neuere Daten in Google Drive gefunden (von ' + (cloudData.modifiedBy||'unbekannt') + ').\n\nSollen die lokalen Daten aktualisiert werden?')){
        saveCostData(cloudData);
        setSyncStatus({lastSync: Date.now(), source:'cloud'});
        location.reload();
      }
    }
  } catch(e){ console.log('Auto-Sync nicht möglich:', e); }
}

// ☁️ HOCHLADEN zu Google Drive
async function pushToCloud(){
  if(GAS_URL.includes('HIER_DEINE') || !GAS_URL.includes('script.google.com')){
    alert('⚠️ Bitte zuerst die GAS_URL konfigurieren!');
    return;
  }

  const data = getCostData();
  data.lastModified = Date.now();
  data.modifiedBy = (getSession().name || 'Unbekannt');

  const counts = (data.expenses||[]).length + ' Kosten, ' +
                 (data.transfers||[]).length + ' Überweisungen';

  if(!confirm('☁️ In Google Drive speichern?\n\nEnthält: ' + counts + '\n\nOK = Hochladen')) return;

  const btn = document.getElementById('sync-btn');
  if(btn){ btn.innerHTML = '⏳ Speichere...'; btn.disabled = true; }

  try {
    // WICHTIG: GitHub Pages -> Google Apps Script ist Cross-Origin.
    // Firefox blockiert die lesbare Antwort von Apps Script/Google-Redirects
    // teilweise als "NetworkError". no-cors sendet die Daten trotzdem,
    // ohne dass der Browser die Antwort wegen CORS verwirft.
    await fetch(GAS_URL + '?t=' + Date.now(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {'Content-Type': 'text/plain;charset=UTF-8'},
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    setSyncStatus({lastSync: Date.now(), source:'local'});
    alert('✅ Daten wurden an Google Drive gesendet.\n\nCORS-FIX 2 ist aktiv.');
  } catch(e) {
    // Fallback, falls fetch z.B. durch eine Erweiterung blockiert wird.
    try {
      const payload = new Blob([JSON.stringify(data)], {type:'text/plain;charset=UTF-8'});
      const ok = navigator.sendBeacon(GAS_URL + '?t=' + Date.now(), payload);
      if(!ok) throw new Error('sendBeacon wurde vom Browser abgelehnt');
      setSyncStatus({lastSync: Date.now(), source:'local'});
      alert('✅ Daten wurden an Google Drive gesendet (Fallback).\n\nCORS-FIX 2 ist aktiv.');
    } catch(e2) {
      alert('❌ Verbindung zu Google Apps Script fehlgeschlagen.\n\n' +
            'Bitte prüfe, ob die Apps-Script-Web-App als „Jeder/Anyone“ veröffentlicht ist.\n\n' +
            'Technischer Fehler: ' + e2.message);
    }
  } finally {
    if(btn){ btn.innerHTML = '☁️ In Google Drive speichern'; btn.disabled = false; }
  }
}

// 📥 HERUNTERLADEN von Google Drive (inkl. Zusammenführen)
async function pullFromCloud(){
  if(GAS_URL.includes('HIER_DEINE') || !GAS_URL.includes('script.google.com')){
    alert('⚠️ Bitte zuerst die GAS_URL konfigurieren!'); 
    return;
  }
  try {
    const btn = document.getElementById('sync-pull-btn');
    if(btn) { btn.innerHTML = '⏳ Lade...'; btn.disabled = true; }
    
    const resp = await fetch(GAS_URL + '?t=' + Date.now(), {cache:'no-store'});
    const cloudData = await resp.json();
    
    if(!cloudData || !cloudData.expenses){
      alert('ℹ️ Keine Daten in Google Drive gefunden.');
      return;
    }
    
    const localData = getCostData();
    const cloudDate = cloudData.lastModified ? new Date(cloudData.lastModified).toLocaleString('de-DE') : 'unbekannt';
    
    const cK = (cloudData.expenses||[]).length, cT = (cloudData.transfers||[]).length;
    const lK = (localData.expenses||[]).length, lT = (localData.transfers||[]).length;
    
    // Merge-Modus: OK = ersetzen, Abbrechen = zusammenführen
    const action = confirm(
      '📥 Cloud-Daten laden?\n\n' +
      '☁️ Cloud (' + (cloudData.modifiedBy||'unbekannt') + '):\n   ' + cK + ' Kosten, ' + cT + ' Überweisungen\n' +
      '💻 Lokal (' + (getSession().name||'du') + '):\n   ' + lK + ' Kosten, ' + lT + ' Überweisungen\n\n' +
      'OK = Cloud überschreibt alles\n' +
      'Abbrechen = Zusammenführen (beides behalten)'
    );
    
    if(action){
      // Ersetzen
      saveCostData(cloudData);
    } else {
      // Mergen: Duplikate vermeiden durch "Fingerprint"
      const merged = {
        expenses: mergeRecords(localData.expenses||[], cloudData.expenses||[], ['desc','amount','payer','date']),
        transfers: mergeRecords(localData.transfers||[], cloudData.transfers||[], ['desc','amount','from','to','date']),
        currency: cloudData.currency || localData.currency || 'EUR',
        lastModified: Date.now(),
        modifiedBy: getSession().name || 'Unbekannt'
      };
      saveCostData(merged);
      alert('✅ Zusammengeführt!\nNeu: ' + merged.expenses.length + ' Kosten, ' + merged.transfers.length + ' Überweisungen');
    }
    
    setSyncStatus({lastSync: Date.now(), source:'cloud'});
    location.reload();
  } catch(e) {
    alert('❌ Fehler: ' + e.message);
  } finally {
    const btn = document.getElementById('sync-pull-btn');
    if(btn) { btn.innerHTML = '📥 Aus Google Drive laden'; btn.disabled = false; }
  }
}

// Hilfsfunktion: Arrays zusammenführen ohne Duplikate
function mergeRecords(localArr, cloudArr, keys){
  const result = [...localArr];
  const seen = new Set(result.map(item => keys.map(k => item[k]||'').join('|')));
  cloudArr.forEach(item => {
    const fp = keys.map(k => item[k]||'').join('|');
    if(!seen.has(fp)){ result.push(item); seen.add(fp); }
  });
  return result;
}
// Sync-Status anzeigen
function renderSyncStatus(){
  const status = getSyncStatus();
  if(!status.lastSync) return '';
  const date = new Date(status.lastSync).toLocaleString('de-DE');
  return `<span style="font-size:0.75rem;color:var(--muted);display:block;margin-top:4px;">☁️ Zuletzt synchronisiert: ${date}</span>`;
}
//  EINGEBETTETE DATEN (für Datei-Austausch)
if(typeof window.__EMBEDDED_DATA__ !== 'undefined' && window.__EMBEDDED_DATA__){
  if(confirm('📎 Diese Datei enthält eingebettete Reisedaten. Sollen sie geladen werden?\n\nAchtung: Lokale Daten werden überschrieben!')){
    localStorage.setItem(COST_APP_KEY, JSON.stringify(window.__EMBEDDED_DATA__));
  }
}
function getCostData(){
  try{
    const raw = localStorage.getItem(COST_APP_KEY);
    if(!raw) return {expenses:[], transfers:[], currency:'EUR'};
    const parsed = JSON.parse(raw);
    if(!parsed.expenses) parsed.expenses = [];
    if(!parsed.transfers) parsed.transfers = [];
    delete parsed.restaurants;
    return parsed;
  }catch(e){ return {expenses:[], transfers:[], currency:'EUR'}; }
}
function saveCostData(data){
  delete data.restaurants;
  localStorage.setItem(COST_APP_KEY, JSON.stringify(data));
}

function getSession(){ try{ return JSON.parse(localStorage.getItem(COST_SESSION_KEY)||'{}'); }catch(e){ return {}; } }
function setSession(s){ localStorage.setItem(COST_SESSION_KEY, JSON.stringify(s)); }
function clearSession(){ localStorage.removeItem(COST_SESSION_KEY); }

//DATEI MIT DATEN SPEICHERN

function saveFileWithData(){
  const data = getCostData();
  
  // Aktuellen HTML-Quelltext holen
  let html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  
  // Alte eingebettete Daten entfernen (falls vorhanden)
  html = html.replace(/<script>window\.__EMBEDDED_DATA__=.*?<\/script>\s*/g, '');
  
  // Neue Daten als Script einbetten (direkt nach <head>)
  const dataScript = '<script>window.__EMBEDDED_DATA__=' + JSON.stringify(data) + ';<\/script>';
  html = html.replace('<head>', '<head>\n  ' + dataScript);
  
  // Als Datei herunterladen
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Korea_Japan_Reiseplan_2027_MIT_DATEN.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Datei wurde gespeichert!');
}

function exportJSON(){
  const data = getCostData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Reisedaten_Export_' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSON(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(evt){
      try{
        const data = JSON.parse(evt.target.result);
        if(!data.expenses) data.expenses = [];
        if(!data.transfers) data.transfers = [];
        delete data.restaurants;
        if(confirm('📥 Daten importieren? Bestehende lokale Daten werden überschrieben.')){
          saveCostData(data);
          alert('✅ Daten erfolgreich importiert!');
          location.reload();
        }
      }catch(err){ alert('❌ Ungültige JSON-Datei: ' + err.message); }
    };
    reader.readAsText(file);
  };
  input.click();
}
Object.assign(window, {
  USERS,
  COST_APP_KEY,
  COST_SESSION_KEY,
  VISITED_KEY,
  currentDayId,
  getVisitedData,
  saveVisitedData,
  toggleVisited,
  isVisited,
  getSession,
  setSession,
  clearSession,
  isAdmin,
  esc,
  renderCostApp
});