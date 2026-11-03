function toggleVisited(place) {
  const data = getVisitedData();

  data[place] = !data[place];

  saveVisitedData(data);

  renderDay(window.currentDayId || currentDayId);
}

function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem(COST_SESSION_KEY) || '{}'
    );
  } catch(e) {
    return {};
  }
}

function setSession(session) {
  localStorage.setItem(
    COST_SESSION_KEY,
    JSON.stringify(session)
  );
}

function clearSession() {
  localStorage.removeItem(COST_SESSION_KEY);
}

function isAdmin() {
  const session = getSession();
  return session && session.role === 'admin';
}

function esc(value) {
  return String(value || '').replace(
    /[<>&"']/g,
    char => ({
      '<':'&lt;',
      '>':'&gt;',
      '&':'&amp;',
      '"':'&quot;',
      "'":'&#39;'
    }[char])
  );
}

function renderCostApp() {
  const app = document.getElementById('cost-app');

  if(app) {
    app.innerHTML =
      '<section class="cost-login-wrap">' +
      '<h2>Kostenabrechnung</h2>' +
      '<p>Die Anmeldung folgt im nächsten Schritt.</p>' +
      '</section>';
  }
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