export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export type View = 'dashboard' | 'transactions' | 'analytics' | 'reports' | 'settings';

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Personal Care',
  'Investments',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental',
  'Gifts',
  'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#c0603a',
  'Transportation': '#4f7a8c',
  'Shopping': '#a8586f',
  'Entertainment': '#7a5c8c',
  'Bills & Utilities': '#8a6a3b',
  'Health & Fitness': '#3f8a63',
  'Travel': '#3d8a8a',
  'Education': '#b5842b',
  'Personal Care': '#c07a8f',
  'Salary': '#2f6f4f',
  'Freelance': '#5b6ea8',
  'Business': '#4a8a7a',
  'Investments': '#7d5fa0',
  'Rental': '#c08a3b',
  'Gifts': '#b0577a',
  'Other': '#8b8175',
};
