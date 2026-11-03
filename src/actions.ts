import { renderCostApp } from './costs';
import {
  USERS,
  getCostData,
  getSession,
  nextStatus,
  saveCostData,
  todayStr,
} from './shared';
import type { ExpenseStatus } from './types';

// Hilfsfunktionen zum Auslesen von Formularfeldern

function inputValue(id: string): string {
  return document.querySelector<HTMLInputElement>(`#${id}`)?.value.trim() ?? '';
}

function selectValue(id: string): string {
  return document.querySelector<HTMLSelectElement>(`#${id}`)?.value ?? '';
}

function amountValue(id: string): number {
  return Number.parseFloat(inputValue(id));
}

function expenseStatusValue(id: string): ExpenseStatus {
  const value = selectValue(id);
  const statuses: ExpenseStatus[] = ['offen', 'offen_überweisung', 'bezahlt', 'bezahlt_überweisung'];
  return statuses.includes(value as ExpenseStatus) ? value as ExpenseStatus : 'offen';
}

// Prüfte, ob Bezeichnung und Betrag gültig sind
function validExpense(desc: string, amount: number): boolean {
  if (desc && Number.isFinite(amount) && amount > 0) return true;
  window.alert('Bitte Bezeichnung und einen gültigen Betrag eingeben.');
  return false;
}

// Kosten hinzufügen

// Kosten als aktueller User hinzufügen
export function addUserCost(): void {
  const desc = inputValue('u-desc');
  const amount = amountValue('u-amount');
  if (!validExpense(desc, amount)) return;
  const data = getCostData();
  data.expenses.push({
    desc,
    amount,
    payer: getSession().name ?? '',
    status: expenseStatusValue('u-status'),
    date: inputValue('u-date') || todayStr(),
  });
  saveCostData(data);
  renderCostApp();
}

// Kosten als Admin für einen bestimmten User ergänzen
export function addAdminCost(): void {
  const desc = inputValue('a-desc');
  const amount = amountValue('a-amount');
  const payer = selectValue('a-payer');
  if (!validExpense(desc, amount)) return;
  if (!payer) {
    window.alert('Bitte einen Bezahler auswählen.');
    return;
  }
  const data = getCostData();
  data.expenses.push({
    desc,
    amount,
    payer,
    status: expenseStatusValue('a-status'),
    date: inputValue('a-date') || todayStr(),
  });
  saveCostData(data);
  renderCostApp();
}

// Gleiche Kosten für alle Benutzer anlegen (Gruppenkosten)
export function addGroupCost(): void {
  const desc = inputValue('g-desc');
  const amount = amountValue('g-amount');
  if (!validExpense(desc, amount)) return;
  const data = getCostData();
  USERS.filter((user) => user.role === 'user').forEach((user) => {
    data.expenses.push({
      desc: `${desc} (${user.name})`,
      amount,
      payer: user.name,
      status: expenseStatusValue('g-status'),
      date: inputValue('g-date') || todayStr(),
    });
  });
  saveCostData(data);
  renderCostApp();
}

// Kosten bearbeiten 
// Kosten löschen
export function deleteCost(index: number): void {
  if (!window.confirm('Diese Kosten wirklich löschen?')) return;
  const data = getCostData();
  if (index < 0 || index >= data.expenses.length) return;
  data.expenses.splice(index, 1);
  saveCostData(data);
  renderCostApp();
}

// Status einer Kostenposition schalten
export function toggleCostStatus(index: number): void {
  const data = getCostData();
  const expense = data.expenses[index];
  if (!expense) return;
  expense.status = nextStatus(expense.status);
  saveCostData(data);
  renderCostApp();
}

// Überweisungen

//Prüfe, ob eine Überweisung gültig ist sind alle felder ausgefüllt
function validTransfer(desc: string, amount: number, from: string, to: string): boolean {
  if (!desc || !Number.isFinite(amount) || amount <= 0 || !from || !to) {
    window.alert('Bitte alle Felder ausfüllen.');
    return false;
  }
  if (from === to) {
    window.alert('Absender und Empfänger dürfen nicht identisch sein.');
    return false;
  }
  return true;
}

//Überweisung als aktueller Benutzer anlegen
export function addUserTransfer(): void {
  const desc = inputValue('ut-desc');
  const amount = amountValue('ut-amount');
  const from = getSession().name ?? '';
  const to = selectValue('ut-to');
  if (!validTransfer(desc, amount, from, to)) return;
  const data = getCostData();
  data.transfers.push({
    desc,
    amount,
    from,
    to,
    received: selectValue('ut-status') === 'received',
    date: inputValue('ut-date') || todayStr(),
  });
  saveCostData(data);
  renderCostApp();
}

// Überweisung als Admin anlegen
export function addAdminTransfer(): void {
  const desc = inputValue('at-desc');
  const amount = amountValue('at-amount');
  const from = selectValue('at-from');
  const to = selectValue('at-to');
  if (!validTransfer(desc, amount, from, to)) return;
  const data = getCostData();
  data.transfers.push({
    desc,
    amount,
    from,
    to,
    received: selectValue('at-status') === 'received',
    date: inputValue('at-date') || todayStr(),
  });
  saveCostData(data);
  renderCostApp();
}

//Überweisung löschen
export function deleteTransfer(index: number): void {
  if (!window.confirm('Diese Überweisung wirklich löschen?')) return;
  const data = getCostData();
  if (index < 0 || index >= data.transfers.length) return;
  data.transfers.splice(index, 1);
  saveCostData(data);
  renderCostApp();
}

//Empfangsstatus einer Überweisung ändern
export function toggleTransferStatus(index: number): void {
  const data = getCostData();
  const transfer = data.transfers[index];
  if (!transfer) return;
  transfer.received = !transfer.received;
  saveCostData(data);
  renderCostApp();
}

//Globale Funktionen für onclick-Handler im HTML
Object.assign(window, {
  addUserCost,
  addAdminCost,
  addGroupCost,
  deleteCost,
  toggleCostStatus,
  addUserTransfer,
  addAdminTransfer,
  deleteTransfer,
  toggleTransferStatus,
});