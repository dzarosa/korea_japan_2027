// Benutzer & Sitzung

export type UserRole = 'user' | 'admin';

// Benutzer mit Name, Passwort und Rolle
export interface User {
  name: string;
  pass: string;
  role: UserRole;
}

//Aktuelle Anmeldung
export interface Session {
  name?: string;
  role?: UserRole;
}

// Kosten & Überweisungen
// Status der Kostenpositionen (offen, bezahlt, Überweisung)
export type ExpenseStatus = 'offen' | 'offen_überweisung' | 'bezahlt' | 'bezahlt_überweisung';

/ Einzelne Ausgabe / Kostenposition
export interface Expense {
  desc: string;
  amount: number;
  payer: string;
  status: ExpenseStatus;
  date: string;
}

// Überweisung zwischen Reiseteilnehmern
export interface Transfer {
  desc: string;
  amount: number;
  from: string;
  to: string;
  received: boolean;
  date: string;
}

//Gesamte Kosten-Datenstruktur (localStorage / Cloud)
export interface CostData {
  expenses: Expense[];
  transfers: Transfer[];
  currency: string;
  lastModified?: number;
  modifiedBy?: string;
}

//Status der letzten Synchronisation
export interface SyncStatus {
  lastSync?: number;
  source?: 'cloud' | 'local';
}

// Reise & Karte
//Koordinaten und Typ des Ortes
export interface LocationPoint {
  lat: number;
  lng: number;
  t: string;
}

/** 
 * Verkehrsmittel für die Routenplanung
 * Gehen, Metro, Bus, Bahn/Shinkansen, Shuttle, Auto, Flug
 */
export type TransportMode =
  | 'walk'        // Gehen
  | 'metro'       // Metro / U-Bahn
  | 'bus'         // Bus
  | 'train'       // Bahn / Shinkansen
  | 'shuttle'     // Shuttle
  | 'car'         // Auto / Taxi
  | 'plane';      // Flug

// Ein einzelner Reisetag mit Route, Transport und Details
export interface ItineraryDay {
  id: string;
  num: string;
  date: string;
  city: string;
  title: string;
  hotel: string;
  kr: boolean;
  jp: boolean;
  stops: string[];
  modes: TransportMode[];
  trans: string[];
  det: string[];
  tim: string[];
}

//Zusammengefassung der Kennzahlen der gesamten Reise
export interface TripSummary {
  days: number;
  stops: number;
  cities: number;
}

// Hilfstypen
// Darstellung eines Kosten-Status (CSS-Klasse inkl. Label) 
export interface StatusInfo {
  cls: string;
  label: string;
}

// Summen für die Abrechnung
export interface Totals {
  total: number;
  perPerson: number;
  paid: Record<string, number>;
}

// Globale Erweiterung für eingebettete Daten
declare global {
  interface Window {
    __EMBEDDED_DATA__?: CostData;
  }
}