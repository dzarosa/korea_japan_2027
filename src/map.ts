import * as L from 'leaflet';
import { renderCostApp } from './costs';
import {
  esc,
  getVisitedData,
  isAdmin,
  isVisited,
  saveVisitedData,
} from './shared';
import { DAYS, LOC } from './route';
import type { LocationPoint, TransportMode } from './types';

// Farben und Bezeichnungen für Transportsmittel ===
const MODE_COLORS: Record<TransportMode, string> = {
  walk: '#27ae60',
  metro: '#2980b9',
  train: '#8e44ad',
  car: '#e74c3c',
  bus: '#f39c12',
  shinkansen: '#e84393',
  plane: '#00cec9',
  ferry: '#00b894',
  cablecar: '#9b59b6',
  monorail: '#6c5ce7',
  shuttle: '#636e72',
  tram: '#00b894',
};
const MODE_LABELS: Record<TransportMode, string> = {
  walk: 'Fußweg',
  metro: 'U-Bahn',
  train: 'Zug',
  car: 'Auto/Taxi',
  bus: 'Bus',
  shinkansen: 'Shinkansen',
  plane: 'Flug',
  ferry: 'Fähre',
  cablecar: 'Seilbahn',
  monorail: 'Einschienenbahn',
  shuttle: 'Shuttle',
  tram: 'Straßenbahn',
};

// Diverse Farben für die Ortstypen auf der Karte
const MARKER_COLORS: Record<string, string> = {
  hotel: '#d35400', airport: '#e74c3c', station: '#8e44ad', temple: '#27ae60',
  palace: '#f39c12', museum: '#2980b9', park: '#27ae60', beach: '#3478b9',
  shopping: '#c2387b', viewpoint: '#8e44ad', culture: '#147d70', food: '#b85d12',
  nature: '#238b45', memorial: '#626c76', castle: '#a93226', amusement: '#c44b52',
  spa: '#008b8b', activity: '#9a7610', transport: '#5b4dc4', fortress: '#59636b',
  hike: '#008c72', street: '#b03a2e', nightlife: '#2d3436', market: '#a9523b',
};

// Karte initialisieren
const mapElement = document.querySelector<HTMLElement>('#map');
if (!mapElement) throw new Error('Kartenbereich wurde nicht gefunden.');

const map = L.map(mapElement, { zoomControl: false }).setView([36.5, 128.5], 6);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map);

let layers: L.Polyline[] = [];
let markers: L.Marker[] = [];
let currentDayId = 'd17';

/* Entfernt alle Marker und Linien von der Karte */
function clearMap(): void {
  layers.forEach((layer) => map.removeLayer(layer));
  markers.forEach((marker) => map.removeLayer(marker));
  layers = [];
  markers = [];
}

/* Erstellt ein benutzerdefiniertes Marker-Icon */
function getIcon(type: string, num: string | number, visited: boolean): L.DivIcon {
  const color = visited ? '#218838' : MARKER_COLORS[type] ?? '#2c7873';
  const check = visited ? '<span class="sr-only">besucht</span><span aria-hidden="true">✓</span>' : '';
  return L.divIcon({
    className: 'custom-marker',
    html: `<span class="map-marker" style="--marker-color:${color}">${num}${check}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/** Berechnet die Luftlinien-Distanz zwischen zwei Punkten in km */
export function haversine(a: LocationPoint, b: LocationPoint): number {
  const radius = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 10) / 10;
}

// Link-Generatoren für externe Karten

function buildKakaoLink(stopName: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(stopName)},${lat},${lng}`;
}

function buildGoogleLinkTo(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
}

function buildGoogleLink(stops: string[]): string {
  const coords = stops.flatMap((stop) => {
    const location = LOC[stop];
    return location ? [`${location.lat},${location.lng}`] : [];
  });
  if (coords.length < 2) return 'https://www.google.com/maps';
  let url = `https://www.google.com/maps/dir/?api=1&origin=${coords[0]}&destination=${coords.at(-1)}&travelmode=transit`;
  if (coords.length > 2) url += `&waypoints=${coords.slice(1, -1).join('|')}`;
  return url;
}

/* Fliegt die Karte zu einem Punkt (respektiert Reduced Motion) */
export function flyTo(lat: number, lng: number, zoom: number): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  map.flyTo([lat, lng], zoom, { duration: reducedMotion ? 0 : 1.2 });
}

/* Markiert einen Ort als besucht / nicht besucht und aktualisiert die Ansicht */
export function toggleVisited(place: string): void {
  const data = getVisitedData();
  data[place] = !data[place];
  saveVisitedData(data);
  renderDay(currentDayId);
}

/* Aktualisiert die aktive Markierung in der Timeline und im Content */
function updateSelection(id: string): void {
  document.querySelectorAll<HTMLButtonElement>('.day-btn').forEach((button) => {
    const selected = button.dataset.id === id;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll<HTMLElement>('.day-content').forEach((panel) => {
    const selected = panel.dataset.id === id;
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
}

/* Rendert den ausgewählten Tag inkl. Karte und Details */
export function renderDay(id: string): void {
  currentDayId = id;
  clearMap();
  updateSelection(id);

  // Sonderfall: Kosten-Ansicht
  if (id === 'costs') {
    renderCostApp();
    map.setView([35.68, 139.76], 5);
    return;
  }

  const day = DAYS.find((entry) => entry.id === id);
  if (!day) return;
  const bounds: [number, number][] = [];

  // Marker für alle Stops des Tages
  day.stops.forEach((stop, index) => {
    const location = LOC[stop];
    if (!location) return;
    bounds.push([location.lat, location.lng]);
    const isHotel = location.t === 'hotel';
    const num = isHotel ? 'H' : index + 1;
    const visited = isVisited(stop);
    const marker = L.marker([location.lat, location.lng], {
      icon: getIcon(location.t, num, visited),
      keyboard: true,
      title: stop,
      alt: `Kartenmarker für ${stop}`,
    }).addTo(map).bindPopup(
      `<strong>${esc(stop)}</strong>${visited ? ' - besucht' : ''}<br><small>${esc(location.t.toUpperCase())}</small><p>${esc(day.det[index] ?? '')}</p>`,
    );
    markers.push(marker);
  });

  // Verbindungslinien zwischen den Stops
  for (let index = 0; index < day.stops.length - 1; index += 1) {
    const a = LOC[day.stops[index]];
    const b = LOC[day.stops[index + 1]];
    if (!a || !b) continue;
    const mode = day.modes[index] ?? 'walk';
    const line = L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
      color: MODE_COLORS[mode],
      weight: 4,
      opacity: 0.85,
      dashArray: mode === 'walk' ? '8,6' : undefined,
    }).addTo(map);
    layers.push(line);
  }

  if (bounds.length > 0) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
}

function toISODate(date: string): string {
  const [day, month, year] = date.split('.');
  return `${year}-${month}-${day}`;
}

function scrollToPanel(id: string): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelector<HTMLElement>(`.day-content[data-id="${id}"]`)
    ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

//UI initialisieren (Timeline + Tages-Panels)
const timeline = document.querySelector<HTMLUListElement>('#timeline');
const sidebar = document.querySelector<HTMLElement>('#sidebar');
if (!timeline || !sidebar) throw new Error('Reiseplan konnte nicht initialisiert werden.');
timeline.replaceChildren();
sidebar.replaceChildren();

// Timeline-Buttons für alle Tage erstellen
DAYS.forEach((day, index) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `day-btn${index === 0 ? ' active' : ''}`;
  button.dataset.id = day.id;
  button.setAttribute('aria-pressed', String(index === 0));
  button.setAttribute('aria-controls', `panel-${day.id}`);
  button.innerHTML = `<span class="d-num">${day.num}</span><time class="d-date" datetime="${toISODate(day.date)}">${day.date}</time><span class="d-city">${day.city}</span>`;
  button.addEventListener('click', () => {
    renderDay(day.id);
    scrollToPanel(day.id);
  });
  item.appendChild(button);
  timeline.appendChild(item);
});

// Kosten-Tab hinzufügen
const costItem = document.createElement('li');
const costButton = document.createElement('button');
costButton.type = 'button';
costButton.className = 'day-btn cost-tab-btn';
costButton.dataset.id = 'costs';
costButton.setAttribute('aria-pressed', 'false');
costButton.setAttribute('aria-controls', 'panel-costs');
costButton.innerHTML = '<span class="d-num">€</span><span class="d-date">Kosten</span><span class="d-city">Abrechnung</span>';
costButton.addEventListener('click', () => {
  renderDay('costs');
  scrollToPanel('costs');
});
costItem.appendChild(costButton);
timeline.appendChild(costItem);

// Detail-Panels für jeden Tag erzeugen
DAYS.forEach((day, index) => {
  const panel = document.createElement('article');
  panel.className = `day-content${index === 0 ? ' active' : ''}`;
  panel.dataset.id = day.id;
  panel.id = `panel-${day.id}`;
  panel.setAttribute('aria-labelledby', `title-${day.id}`);
  panel.hidden = index !== 0;
  let totalDist = 0;
  const routeHTML = day.stops.map((stop, stopIndex) => {
    const location = LOC[stop];
    const isHotel = location?.t === 'hotel';
    const num = isHotel ? 'H' : stopIndex + 1;
    const mode = day.modes[stopIndex - 1];
    let distance = '';
    if (stopIndex > 0 && location && LOC[day.stops[stopIndex - 1]]) {
      const value = haversine(LOC[day.stops[stopIndex - 1]], location);
      totalDist += value;
      distance = `<strong> · ca. ${value} km</strong>`;
    }
    const visited = isVisited(stop);
    const visitedButton = isAdmin()
      ? `<button type="button" class="btn visit-btn ${visited ? 'is-visited' : ''}" onclick="toggleVisited('${esc(stop)}')" aria-pressed="${visited}">${visited ? 'Als nicht besucht markieren' : 'Als besucht markieren'}</button>`
      : '';
    let navigationButton = '';
    if (location && !isHotel) {
      if (day.kr) {
        navigationButton = `<a class="btn btn-maps-kr" href="${buildKakaoLink(stop, location.lat, location.lng)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(stop)} in Kakao Maps öffnen">Kakao Maps</a>`;
      } else if (day.jp) {
        navigationButton = `<a class="btn btn-maps-jp" href="${buildGoogleLinkTo(location.lat, location.lng)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(stop)} in Google Maps öffnen">Google Maps</a>`;
      }
    }
    return `
      <li class="route-item">
        <span class="route-connector" aria-hidden="true"></span>
        <span class="route-num ${isHotel ? 'hotel' : ''} ${visited ? 'visited' : ''}" aria-hidden="true">${num}</span>
        <section class="route-body" aria-labelledby="stop-${day.id}-${stopIndex}">
          <h4 class="route-name" id="stop-${day.id}-${stopIndex}">${visited ? '<span class="sr-only">Besucht: </span>' : ''}${esc(stop)}</h4>
          <p class="route-desc">${esc(day.det[stopIndex] ?? '')}${distance}</p>
          ${day.trans[stopIndex] ? `<p class="transport-tag ${mode ? `t-${mode}` : ''}">${mode ? `${MODE_LABELS[mode]}: ` : ''}${esc(day.trans[stopIndex])}</p>` : ''}
          ${day.tim[stopIndex] ? `<p class="route-time">Dauer: ${esc(day.tim[stopIndex])}</p>` : ''}
          <nav class="route-actions" aria-label="Aktionen für ${esc(stop)}">${visitedButton}${navigationButton}</nav>
        </section>
      </li>`;
  }).join('');
  const routeMapButton = day.jp
    ? `<a class="btn btn-maps-jp" href="${buildGoogleLink(day.stops)}" target="_blank" rel="noopener noreferrer">Tagesroute in Google Maps öffnen</a>`
    : '';
  panel.innerHTML = `
    <header class="day-header">
      <h2 id="title-${day.id}">${day.title}</h2>
      <p class="day-sub">${day.city}</p>
      <p class="day-date"><time datetime="${toISODate(day.date)}">${day.date}</time> · ${day.num}</p>
    </header>
    <ul class="badges" aria-label="Unterkunft"><li class="badge badge-hotel">${esc(day.hotel)}</li></ul>
    <section aria-labelledby="route-title-${day.id}">
      <h3 class="sec-divider" id="route-title-${day.id}">Route & Sehenswürdigkeiten</h3>
      <ol class="route-list">${routeHTML}</ol>
    </section>
    <aside class="dist-summary" aria-label="Geschätzte Gesamtstrecke">
      <p><strong>Gesamtstrecke (Luftlinie):</strong> ca. ${Math.round(totalDist * 10) / 10} km</p>
      <small>Die tatsächliche Route kann abweichen.</small>
    </aside>
    <nav class="actions" aria-label="Kartenaktionen für ${day.num}">
      ${routeMapButton}
      <button type="button" class="btn btn-center" onclick="renderDay('${day.id}')">Karte zentrieren</button>
    </nav>`;
  sidebar.appendChild(panel);
});

// Kosten-Panel hinzufügen
const costPanel = document.createElement('article');
costPanel.className = 'day-content cost-panel';
costPanel.dataset.id = 'costs';
costPanel.id = 'panel-costs';
costPanel.setAttribute('aria-label', 'Reisekostenabrechnung');
costPanel.hidden = true;
costPanel.innerHTML = '<section id="cost-app" aria-label="Kostenverwaltung"></section>';
sidebar.appendChild(costPanel);

// Startansicht laden
renderDay('d17');

// Globale Funktionen für onclick-Handler im HTML
Object.assign(window, { flyTo, renderDay, toggleVisited });