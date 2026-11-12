import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget, EXPENSE_CATEGORIES } from '../../types';
import { Plus, Trash2, Target, User, Shield, Bell, Info } from 'lucide-react';
import Logo from '../Logo';
import { clearDemoData, clearDemoAuth } from '../../lib/demoStorage';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, budgets, addBudget, deleteBudget } = useApp();
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [activeTab, setActiveTab] = useState<'budgets' | 'profile' | 'notifications' | 'about'>('budgets');
  const [prefs, setPrefs] = useState<boolean[]>([true, true, false, false]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory || !budgetAmount || Number(budgetAmount) <= 0) {
      toast.error('Please fill in all fields');
      return;
    }
    const existing = budgets.find(b => b.category === budgetCategory && b.month === budgetMonth);
    if (existing) {
      toast.error('Budget for this category and month already exists');
      return;
    }
    await addBudget({
      category: budgetCategory,
      limit_amount: Number(budgetAmount),
      month: budgetMonth,
    });
    setBudgetCategory('');
    setBudgetAmount('');
  };

  const tabs = [
    { id: 'budgets' as const, label: 'Budgets', icon: <Target className="w-4 h-4" /> },
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'about' as const, label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i - 2);
    const value = format(d, 'yyyy-MM');
    const label = format(d, 'MMMM yyyy');
    return { value, label };
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex bg-card border border-line rounded-2xl p-1.5 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-card text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-5">
          {/* Add Budget */}
          <div className="bg-card border border-line rounded-2xl p-6">
            <h3 className="text-base font-semibold text-ink mb-1">Set Monthly Budget</h3>
            <p className="text-xs text-faint mb-5">Define spending limits for each category</p>
            <form onSubmit={handleAddBudget} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={budgetMonth}
                onChange={e => setBudgetMonth(e.target.value)}
                className="bg-fill border border-line-strong rounded-xl px-3 py-3 text-ink text-sm focus:outline-none focus:border-copper transition-all"
              >
                {monthOptions.map(o => (
                  <option key={o.value} value={o.value} className="bg-canvas">{o.label}</option>
                ))}
              </select>
              <select
                value={budgetCategory}
                onChange={e => setBudgetCategory(e.target.value)}
                className="bg-fill border border-line-strong rounded-xl px-3 py-3 text-ink text-sm focus:outline-none focus:border-copper transition-all"
              >
                <option value="" className="bg-canvas">Select category</option>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-canvas">{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Budget amount ($)"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                min="0"
                step="0.01"
                className="bg-fill border border-line-strong rounded-xl px-3 py-3 text-ink placeholder-faint text-sm focus:outline-none focus:border-copper transition-all"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-copper hover:bg-copper-deep text-paper px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm shadow-black/10"
              >
                <Plus className="w-4 h-4" />
                Add Budget
              </button>
            </form>
          </div>

          {/* Budget List */}
          <div className="bg-card border border-line rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-line">
              <h3 className="text-base font-semibold text-ink">Your Budgets</h3>
              <p className="text-xs text-faint mt-0.5">{budgets.length} budget{budgets.length !== 1 ? 's' : ''} configured</p>
            </div>
            {budgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-faint">
                <Target className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No budgets set yet</p>
                <p className="text-xs mt-1">Add a budget above to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {budgets.sort((a: Budget, b: Budget) => b.month.localeCompare(a.month)).map((b: Budget) => (
                  <div key={b.id} className="flex items-center justify-between px-6 py-4 hover:bg-fill transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-plum/12 flex items-center justify-center">
                        <Target className="w-4 h-4 text-plum" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{b.category}</p>
                        <p className="text-xs text-faint">{format(new Date(b.month + '-01'), 'MMMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink">
                          ${b.limit_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-faint">per month</p>
                      </div>
                      <button
                        onClick={() => void deleteBudget(b.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-fill hover:bg-terra/12 text-muted hover:text-terra transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-card border border-line rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-ink mb-1">Profile Information</h3>
            <p className="text-xs text-faint">Your account details</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-copper/15 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-copper-deep">
                {user?.name?.slice(0, 1).toUpperCase() || user?.email?.slice(0, 1).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">{user?.name || 'User'}</p>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || ''}
                disabled
                className="w-full bg-fill border border-line-strong rounded-xl px-4 py-3 text-body text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="w-full bg-fill border border-line-strong rounded-xl px-4 py-3 text-body text-sm disabled:opacity-50"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-line">
            <div className="flex items-center gap-2 text-faint text-xs">
              <Shield className="w-3.5 h-3.5" />
              Your data is securely stored and encrypted
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-card border border-line rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-ink mb-1">Notification Preferences</h3>
            <p className="text-xs text-faint">Choose what alerts you receive</p>
          </div>
          {[
            { label: 'Budget Alerts', desc: 'Get notified when you approach your budget limit' },
            { label: 'Monthly Summary', desc: 'Receive a monthly financial summary report' },
            { label: 'Large Transactions', desc: 'Alert for transactions over $500' },
            { label: 'Weekly Insights', desc: 'Weekly spending pattern analysis' },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-line last:border-0">
              <div>
                <p className="text-sm font-medium text-ink">{pref.label}</p>
                <p className="text-xs text-faint mt-0.5">{pref.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[i]}
                aria-label={pref.label}
                onClick={() => setPrefs(p => p.map((v, idx) => (idx === i ? !v : v)))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${prefs[i] ? 'bg-pine' : 'bg-line-strong'}`}
              >
                <span className={`absolute top-1 left-0 w-4 h-4 bg-paper rounded-full border border-black/[0.06] shadow-sm transition-transform duration-200 ease-out ${prefs[i] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-card border border-line rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-copper rounded-2xl flex items-center justify-center shadow-sm shadow-black/10">
              <Logo size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink font-display">PennyPal</h3>
              <p className="text-sm text-muted">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            PennyPal is your premium personal finance tracking companion. Track income and expenses, set budgets, analyze spending patterns, and generate detailed financial reports — all in one beautiful interface.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Transactions', value: 'Unlimited' },
              { label: 'Budgets', value: 'Per Category' },
              { label: 'Analytics', value: '6-12 Months' },
              { label: 'Export', value: 'CSV Format' },
            ].map((item, i) => (
              <div key={i} className="bg-fill rounded-xl p-4">
                <p className="text-xs text-faint">{item.label}</p>
                <p className="text-sm font-semibold text-ink mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-ghost">Built with React, Tailwind CSS, Recharts & Supabase</span>
            <button
              onClick={() => { clearDemoData(); clearDemoAuth(); window.location.reload(); }}
              className="self-start text-xs font-medium text-copper-deep bg-copper/10 hover:bg-copper/20 border border-copper/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset demo data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
