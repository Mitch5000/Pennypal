import { Transaction, Budget, User } from '../types';

// Demo-mode persistence: keeps the reviewer's data (and session) across refreshes
// so the app behaves like a real product instead of resetting to seed every reload.
const DATA_KEY = 'pennypal_demo_data_v1';
const AUTH_KEY = 'pennypal_demo_auth_v1';

export interface DemoData {
  transactions: Transaction[];
  budgets: Budget[];
}

export function loadDemoData(): DemoData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoData;
    if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.budgets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDemoData(transactions: Transaction[], budgets: Budget[]): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify({ transactions, budgets }));
  } catch {
    /* storage full or unavailable - fail silently */
  }
}

export function loadDemoAuth(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveDemoAuth(user: User): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearDemoAuth(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function clearDemoData(): void {
  try {
    localStorage.removeItem(DATA_KEY);
  } catch {
    /* ignore */
  }
}
