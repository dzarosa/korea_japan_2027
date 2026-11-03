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