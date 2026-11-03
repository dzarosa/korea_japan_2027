import { DAYS } from './route';

interface ItineraryDay {
  id: string;
  city: string;
  stops: string[];
}

interface TripSummary {
  days: number;
  stops: number;
  cities: number;
}

function getTripSummary(days: ItineraryDay[]): TripSummary {
  const stops = days.reduce((total, day) => total + day.stops.length, 0);
  const cities = new Set(days.map((day) => day.city)).size;
  return { days: days.length, stops, cities };
}

function formatTripSummary(summary: TripSummary): string {
  return `${summary.days} Reisetage · ${summary.stops} geplante Stationen · ${summary.cities} Routenabschnitte`;
}

const toggle = document.querySelector<HTMLButtonElement>('#summary-toggle');
const output = document.querySelector<HTMLParagraphElement>('#trip-summary');

if (toggle && output) {
  toggle.addEventListener('click', (): void => {
    const shouldShow = output.hidden;
    output.hidden = !shouldShow;
    output.textContent = shouldShow ? formatTripSummary(getTripSummary(DAYS)) : '';
    toggle.setAttribute('aria-expanded', String(shouldShow));
    toggle.textContent = shouldShow ? 'Reiseübersicht ausblenden' : 'Reiseübersicht anzeigen';
  });
}
