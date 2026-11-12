import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { loadDemoData, saveDemoData, loadDemoAuth, saveDemoAuth, clearDemoAuth } from '../lib/demoStorage';
import { Transaction, Budget, User, View } from '../types';
import toast from 'react-hot-toast';

interface AppContextType {
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  currentView: View;
  loading: boolean;
  authLoading: boolean;
  setCurrentView: (view: View) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (b: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// Demo data for when Supabase is not configured
const DEMO_SEED: Transaction[] = [
  { id: '1', user_id: 'demo', amount: 5500, type: 'income', category: 'Salary', description: 'Monthly salary', date: '2025-06-01', created_at: '2025-06-01' },
  { id: '2', user_id: 'demo', amount: 1200, type: 'income', category: 'Freelance', description: 'Design project', date: '2025-06-05', created_at: '2025-06-05' },
  { id: '3', user_id: 'demo', amount: 450, type: 'expense', category: 'Food & Dining', description: 'Groceries & restaurants', date: '2025-06-03', created_at: '2025-06-03' },
  { id: '4', user_id: 'demo', amount: 150, type: 'expense', category: 'Transportation', description: 'Uber & fuel', date: '2025-06-04', created_at: '2025-06-04' },
  { id: '5', user_id: 'demo', amount: 89.99, type: 'expense', category: 'Entertainment', description: 'Netflix & Spotify', date: '2025-06-05', created_at: '2025-06-05' },
  { id: '6', user_id: 'demo', amount: 320, type: 'expense', category: 'Shopping', description: 'Clothes & accessories', date: '2025-06-07', created_at: '2025-06-07' },
  { id: '7', user_id: 'demo', amount: 200, type: 'expense', category: 'Bills & Utilities', description: 'Electricity & internet', date: '2025-06-08', created_at: '2025-06-08' },
  { id: '8', user_id: 'demo', amount: 60, type: 'expense', category: 'Health & Fitness', description: 'Gym membership', date: '2025-06-10', created_at: '2025-06-10' },
  { id: '9', user_id: 'demo', amount: 5500, type: 'income', category: 'Salary', description: 'Monthly salary', date: '2025-05-01', created_at: '2025-05-01' },
  { id: '10', user_id: 'demo', amount: 380, type: 'expense', category: 'Food & Dining', description: 'Groceries', date: '2025-05-05', created_at: '2025-05-05' },
  { id: '11', user_id: 'demo', amount: 120, type: 'expense', category: 'Transportation', description: 'Monthly pass', date: '2025-05-06', created_at: '2025-05-06' },
  { id: '12', user_id: 'demo', amount: 250, type: 'expense', category: 'Shopping', description: 'Electronics', date: '2025-05-12', created_at: '2025-05-12' },
  { id: '13', user_id: 'demo', amount: 800, type: 'income', category: 'Freelance', description: 'Logo design', date: '2025-05-15', created_at: '2025-05-15' },
  { id: '14', user_id: 'demo', amount: 180, type: 'expense', category: 'Bills & Utilities', description: 'Water & gas', date: '2025-05-18', created_at: '2025-05-18' },
  { id: '15', user_id: 'demo', amount: 5500, type: 'income', category: 'Salary', description: 'Monthly salary', date: '2025-04-01', created_at: '2025-04-01' },
  { id: '16', user_id: 'demo', amount: 420, type: 'expense', category: 'Food & Dining', description: 'Groceries & dining', date: '2025-04-04', created_at: '2025-04-04' },
  { id: '17', user_id: 'demo', amount: 500, type: 'income', category: 'Investments', description: 'Dividend income', date: '2025-04-10', created_at: '2025-04-10' },
  { id: '18', user_id: 'demo', amount: 190, type: 'expense', category: 'Travel', description: 'Weekend trip', date: '2025-04-15', created_at: '2025-04-15' },
  { id: '19', user_id: 'demo', amount: 95, type: 'expense', category: 'Personal Care', description: 'Haircut & grooming', date: '2025-04-20', created_at: '2025-04-20' },
  { id: '20', user_id: 'demo', amount: 5500, type: 'income', category: 'Salary', description: 'Monthly salary', date: '2025-03-01', created_at: '2025-03-01' },
  { id: '21', user_id: 'demo', amount: 350, type: 'expense', category: 'Food & Dining', description: 'Groceries', date: '2025-03-05', created_at: '2025-03-05' },
  { id: '22', user_id: 'demo', amount: 200, type: 'expense', category: 'Education', description: 'Online course', date: '2025-03-08', created_at: '2025-03-08' },
  { id: '23', user_id: 'demo', amount: 1500, type: 'income', category: 'Freelance', description: 'Web development', date: '2025-03-20', created_at: '2025-03-20' },
];

const DEMO_BUDGETS_RAW: Budget[] = [
  { id: 'b1', user_id: 'demo', category: 'Food & Dining', limit_amount: 500, month: '2025-06', created_at: '2025-06-01' },
  { id: 'b2', user_id: 'demo', category: 'Transportation', limit_amount: 200, month: '2025-06', created_at: '2025-06-01' },
  { id: 'b3', user_id: 'demo', category: 'Shopping', limit_amount: 300, month: '2025-06', created_at: '2025-06-01' },
  { id: 'b4', user_id: 'demo', category: 'Entertainment', limit_amount: 100, month: '2025-06', created_at: '2025-06-01' },
];

// Anchor demo data to the current month so the dashboard and charts are never stale.
const shiftDate = (iso: string, anchorY: number, anchorM: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const monthDiff = (anchorY - y) * 12 + (anchorM - m);
  const now = new Date();
  const dt = new Date(now.getFullYear(), now.getMonth() - monthDiff, Math.min(d, 28));
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
};
const DEMO_TRANSACTIONS: Transaction[] = DEMO_SEED.map(t => {
  const date = shiftDate(t.date, 2025, 6);
  return { ...t, date, created_at: date };
});
const CURRENT_MONTH = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
})();
const DEMO_BUDGETS: Budget[] = DEMO_BUDGETS_RAW.map(b => ({ ...b, month: CURRENT_MONTH, created_at: `${CURRENT_MONTH}-01` }));

const isDemoMode = !import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchData = useCallback(async (userId: string) => {
    if (isDemoMode) {
      setLoading(true);
      await new Promise(res => setTimeout(res, 460));
      const stored = loadDemoData();
      const txns = stored?.transactions ?? DEMO_TRANSACTIONS;
      const bgets = stored?.budgets ?? DEMO_BUDGETS;
      setTransactions(txns);
      setBudgets(bgets);
      saveDemoData(txns, bgets);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [{ data: txns }, { data: bgets }] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', userId),
      ]);
      setTransactions((txns as Transaction[]) || []);
      setBudgets((bgets as Budget[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      const auth = loadDemoAuth();
      if (auth) {
        const stored = loadDemoData();
        setUser(auth);
        setTransactions(stored?.transactions ?? DEMO_TRANSACTIONS);
        setBudgets(stored?.budgets ?? DEMO_BUDGETS);
        if (!stored) saveDemoData(DEMO_TRANSACTIONS, DEMO_BUDGETS);
      }
      const t = setTimeout(() => setAuthLoading(false), auth ? 260 : 420);
      return () => clearTimeout(t);
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '', name: session.user.user_metadata?.name });
        fetchData(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '', name: session.user.user_metadata?.name });
        fetchData(session.user.id);
      } else {
        setUser(null);
        setTransactions([]);
        setBudgets([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      const u: User = { id: 'demo', email: email, name: 'Mitchell' };
      setLoading(true);
      setUser(u);
      saveDemoAuth(u);
      toast.success('Welcome to PennyPal!');
      await new Promise(res => setTimeout(res, 460));
      const stored = loadDemoData();
      const txns = stored?.transactions ?? DEMO_TRANSACTIONS;
      const bgets = stored?.budgets ?? DEMO_BUDGETS;
      setTransactions(txns);
      setBudgets(bgets);
      saveDemoData(txns, bgets);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '', name: data.user.user_metadata?.name });
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (isDemoMode) {
      const u: User = { id: 'demo', email: email, name: name };
      setLoading(true);
      setUser(u);
      saveDemoAuth(u);
      toast.success('Account created!');
      await new Promise(res => setTimeout(res, 460));
      const stored = loadDemoData();
      const txns = stored?.transactions ?? DEMO_TRANSACTIONS;
      const bgets = stored?.budgets ?? DEMO_BUDGETS;
      setTransactions(txns);
      setBudgets(bgets);
      saveDemoData(txns, bgets);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    if (data.user) {
      toast.success('Account created! Please check your email to verify.');
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      clearDemoAuth();
      setTransactions([]);
      setBudgets([]);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    setBudgets([]);
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    if (isDemoMode) {
      const newT: Transaction = { ...t, id: Date.now().toString(), user_id: 'demo', created_at: new Date().toISOString() };
      const next = [newT, ...transactions];
      setTransactions(next);
      saveDemoData(next, budgets);
      toast.success('Transaction added!');
      return;
    }
    const { data, error } = await supabase.from('transactions').insert({ ...t, user_id: user.id }).select().single();
    if (error) throw error;
    setTransactions(prev => [data as Transaction, ...prev]);
    toast.success('Transaction added!');
  };

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    if (isDemoMode) {
      const next = transactions.map(tx => tx.id === id ? { ...tx, ...t } : tx);
      setTransactions(next);
      saveDemoData(next, budgets);
      toast.success('Transaction updated!');
      return;
    }
    const { error } = await supabase.from('transactions').update(t).eq('id', id);
    if (error) throw error;
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...t } : tx));
    toast.success('Transaction updated!');
  };

  const deleteTransaction = async (id: string) => {
    if (isDemoMode) {
      const next = transactions.filter(tx => tx.id !== id);
      setTransactions(next);
      saveDemoData(next, budgets);
      toast.success('Transaction deleted!');
      return;
    }
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast.success('Transaction deleted!');
  };

  const addBudget = async (b: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    if (isDemoMode) {
      const newB: Budget = { ...b, id: Date.now().toString(), user_id: 'demo', created_at: new Date().toISOString() };
      const next = [newB, ...budgets];
      setBudgets(next);
      saveDemoData(transactions, next);
      toast.success('Budget set!');
      return;
    }
    const { data, error } = await supabase.from('budgets').insert({ ...b, user_id: user.id }).select().single();
    if (error) throw error;
    setBudgets(prev => [data as Budget, ...prev]);
    toast.success('Budget set!');
  };

  const updateBudget = async (id: string, b: Partial<Budget>) => {
    if (isDemoMode) {
      const next = budgets.map(bg => bg.id === id ? { ...bg, ...b } : bg);
      setBudgets(next);
      saveDemoData(transactions, next);
      toast.success('Budget updated!');
      return;
    }
    const { error } = await supabase.from('budgets').update(b).eq('id', id);
    if (error) throw error;
    setBudgets(prev => prev.map(bg => bg.id === id ? { ...bg, ...b } : bg));
    toast.success('Budget updated!');
  };

  const deleteBudget = async (id: string) => {
    if (isDemoMode) {
      const next = budgets.filter(bg => bg.id !== id);
      setBudgets(next);
      saveDemoData(transactions, next);
      toast.success('Budget deleted!');
      return;
    }
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
    setBudgets(prev => prev.filter(bg => bg.id !== id));
    toast.success('Budget deleted!');
  };

  const refreshData = async () => {
    if (user) await fetchData(user.id);
  };

  return (
    <AppContext.Provider value={{
      user, transactions, budgets, currentView, loading, authLoading,
      setCurrentView, login, signup, logout,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget, refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
