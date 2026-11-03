import { DAYS } from './route';

//Struktur des Reisetags
interface ItineraryDay {
  id: string;
  city: string;
  stops: string[];
}

// Überblick über die zusammengefassten Kennzahlen der gesamten Reise
interface TripSummary {
  days: number;
  stops: number;
  cities: number;
}

// Die Summe aller Reisetage wird berechnet
function getTripSummary(days: ItineraryDay[]): TripSummary {
  const stops = days.reduce((total, day) => total + day.stops.length, 0);
  const cities = new Set(days.map((day) => day.city)).size;
  return { days: days.length, stops, cities };
}

//Formatiert die Zahlen als lesbaren Text
function formatTripSummary(summary: TripSummary): string {
  return `${summary.days} Reisetage · ${summary.stops} geplante Stationen · ${summary.cities} Routenabschnitte`;
}

// Elemente für die Reiseübersicht
const toggle = document.querySelector<HTMLButtonElement>('#summary-toggle');
const output = document.querySelector<HTMLParagraphElement>('#trip-summary');

if (toggle && output) {
  toggle.disabled = false;

  // Übersicht ein-/ausblenden und Text aktualisieren
  toggle.addEventListener('click', (): void => {
    const shouldShow = output.hidden;
    output.hidden = !shouldShow;
    output.textContent = formatTripSummary(getTripSummary(DAYS));
    toggle.setAttribute('aria-expanded', String(shouldShow));
    toggle.textContent = shouldShow ? 'Reiseübersicht ausblenden' : 'Reiseübersicht anzeigen';
  });
}