import { useState, useEffect } from "react";

export interface ExpenseReportItem {
  id: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  repairs: number;
  miscellaneous: number;
  credit: number;
  supplierName: string;
  supplierAmount: number;
  agencyName: string;
  agencyAmount: number;
  driverName: string;
  driverAmount: number;
  reason: string;
  paymentMethod?: string;
  createdAt?: string;
}

export const STORAGE_KEY_EXPENSES = "FT_EXPENSE_REPORTS_V1";
export const EXPENSES_UPDATED_EVENT = "ft-expenses-updated";

export const INITIAL_EXPENSE_ENTRIES: ExpenseReportItem[] = [
  {
    id: "EXP-1001",
    dateFrom: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    dateTo: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    repairs: 4500,
    miscellaneous: 650,
    credit: 2000,
    supplierName: "Bosch Car Care (Jayanagar)",
    supplierAmount: 4500,
    agencyName: "Southern Holidays B2B",
    agencyAmount: 1800,
    driverName: "Manjunath K",
    driverAmount: 2400,
    reason: "Innova Crysta KA-05-MN-1234 Brake pad replacement & Outstation Mysuru trip bata",
    paymentMethod: "UPI",
    createdAt: new Date().toISOString(),
  },
  {
    id: "EXP-1002",
    dateFrom: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),
    repairs: 1200,
    miscellaneous: 850,
    credit: 0,
    supplierName: "Indian Oil Bunk Rajajinagar",
    supplierAmount: 3800,
    agencyName: "MakeMyTrip Partner Desk",
    agencyAmount: 950,
    driverName: "Ramesh Babu",
    driverAmount: 1500,
    reason: "Airport transfers fuel top-up, toll fees, airport parking, driver daily allowance",
    paymentMethod: "Cash",
    createdAt: new Date().toISOString(),
  },
  {
    id: "EXP-1003",
    dateFrom: new Date().toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),
    repairs: 0,
    miscellaneous: 1450,
    credit: 5000,
    supplierName: "Siddaganga Tyres",
    supplierAmount: 0,
    agencyName: "Fortune Travels Whitefield Branch",
    agencyAmount: 2200,
    driverName: "Suresh Kumar",
    driverAmount: 1800,
    reason: "Client advance credit clearance, office broadband recharge, driver Coorg tour advance",
    paymentMethod: "Bank Transfer",
    createdAt: new Date().toISOString(),
  },
];

export function getSavedExpenseReports(): ExpenseReportItem[] {
  if (typeof window === "undefined") return INITIAL_EXPENSE_ENTRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(INITIAL_EXPENSE_ENTRIES));
      return INITIAL_EXPENSE_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EXPENSE_ENTRIES;
  } catch (err) {
    console.error("Error reading saved expenses:", err);
    return INITIAL_EXPENSE_ENTRIES;
  }
}

export function saveExpenseReports(items: ExpenseReportItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EXPENSES_UPDATED_EVENT, { detail: items }));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error saving expenses:", err);
  }
}

export function addExpenseReportItem(item: Omit<ExpenseReportItem, "id">): ExpenseReportItem {
  const current = getSavedExpenseReports();
  const newItem: ExpenseReportItem = {
    ...item,
    id: `EXP-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...current];
  saveExpenseReports(updated);
  return newItem;
}

export function deleteExpenseReportItem(id: string): void {
  const current = getSavedExpenseReports();
  const updated = current.filter((x) => x.id !== id);
  saveExpenseReports(updated);
}

export function updateExpenseReportItem(id: string, updates: Partial<ExpenseReportItem>): void {
  const current = getSavedExpenseReports();
  const updated = current.map((x) => (x.id === id ? { ...x, ...updates } : x));
  saveExpenseReports(updated);
}

export function resetExpenseReportsToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(INITIAL_EXPENSE_ENTRIES));
  window.dispatchEvent(new CustomEvent(EXPENSES_UPDATED_EVENT, { detail: INITIAL_EXPENSE_ENTRIES }));
  window.dispatchEvent(new Event("storage"));
}

export function computeExpenseItemTotal(item: ExpenseReportItem): number {
  return (
    Number(item.repairs || 0) +
    Number(item.miscellaneous || 0) +
    Number(item.credit || 0) +
    Number(item.supplierAmount || 0) +
    Number(item.agencyAmount || 0) +
    Number(item.driverAmount || 0)
  );
}

export function useExpenseReports() {
  const [items, setItems] = useState<ExpenseReportItem[]>(() => getSavedExpenseReports());

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getSavedExpenseReports());
    };
    window.addEventListener(EXPENSES_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EXPENSES_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    items,
    save: saveExpenseReports,
    add: addExpenseReportItem,
    remove: deleteExpenseReportItem,
    update: updateExpenseReportItem,
    reset: resetExpenseReportsToDefaults,
  };
}
