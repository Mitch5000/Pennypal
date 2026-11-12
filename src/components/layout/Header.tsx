import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { View } from '../../types';
import { Bell, Search, Menu, AlertTriangle, TrendingDown } from 'lucide-react';

const viewTitles: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your financial overview at a glance' },
  transactions: { title: 'Transactions', subtitle: 'Manage your income and expenses' },
  analytics: { title: 'Analytics', subtitle: 'Deep dive into your spending patterns' },
  reports: { title: 'Reports', subtitle: 'Generate and export financial reports' },
  settings: { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

interface Notif {
  id: string;
  kind: 'budget' | 'large';
  text: string;
  detail: string;
  view: View;
}

interface Props {
  onOpenMobile: () => void;
}

export const Header: React.FC<Props> = ({ onOpenMobile }) => {
  const { currentView, setCurrentView, user, transactions, budgets } = useApp();
  const info = viewTitles[currentView];
  const [query, setQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  // Close the bell on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Real notifications derived from the actual data: over/near budgets + large expenses.
  const notifs = useMemo<Notif[]>(() => {
    const now = new Date();
    const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const list: Notif[] = [];

    budgets
      .filter(b => b.month === cm)
      .forEach(b => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(cm))
          .reduce((s, t) => s + t.amount, 0);
        if (spent > b.limit_amount) {
          list.push({ id: `b-${b.id}`, kind: 'budget', text: `Over budget · ${b.category}`, detail: `${fmt(spent)} spent of ${fmt(b.limit_amount)}`, view: 'reports' });
        } else if (spent > b.limit_amount * 0.8) {
          list.push({ id: `b-${b.id}`, kind: 'budget', text: `Almost at limit · ${b.category}`, detail: `${fmt(spent)} spent of ${fmt(b.limit_amount)}`, view: 'reports' });
        }
      });

    transactions
      .filter(t => t.type === 'expense' && t.amount > 500)
      .slice(0, 4)
      .forEach(t => {
        list.push({ id: `t-${t.id}`, kind: 'large', text: `Large expense · ${t.description || t.category}`, detail: `${fmt(t.amount)} · ${t.category}`, view: 'transactions' });
      });

    return list.slice(0, 6);
  }, [transactions, budgets]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const runSearch = () => {
    setCurrentView('transactions');
    window.dispatchEvent(new CustomEvent('pp-search', { detail: query }));
  };

  const openNotifications = () => {
    setBellOpen(false);
  };

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 px-4 sm:px-8 py-4 border-b border-line bg-canvas/85 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-fill text-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-ink truncate">
            {currentView === 'dashboard' ? `${greeting()}, ${user?.name?.split(' ')[0] || 'there'}` : info.title}
          </h1>
          <p className="text-sm text-muted mt-0.5 truncate hidden sm:block">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search - real: jumps to Transactions and applies the query */}
        <div className="hidden md:flex items-center gap-2 bg-fill border border-line rounded-xl px-3 h-9 w-52 lg:w-64 focus-within:border-copper transition-colors">
          <Search className="w-4 h-4 text-faint flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
            placeholder="Search transactions…"
            className="bg-transparent text-sm text-ink placeholder-faint outline-none w-full"
          />
        </div>
        <button
          onClick={runSearch}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-fill hover:bg-fill-strong text-muted hover:text-ink border border-line transition-all"
          aria-label="Search transactions"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications - real popover from live data */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(o => !o)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-fill hover:bg-fill-strong text-muted hover:text-ink border border-line transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifs.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-copper rounded-full text-[9px] font-bold text-paper flex items-center justify-center border border-canvas">
                {notifs.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-line rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <span className="text-[10px] text-faint bg-fill px-2 py-0.5 rounded-full">{notifs.length} active</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted">You're all caught up.</p>
                    <p className="text-xs text-faint mt-1">No budget or large-spend alerts.</p>
                  </div>
                ) : (
                  notifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { setCurrentView(n.view); openNotifications(); }}
                      className="w-full px-4 py-3 flex items-start gap-3 border-b border-line-faint last:border-0 hover:bg-fill transition-colors text-left"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.kind === 'budget' ? 'bg-ochre/12 text-ochre' : 'bg-terra/12 text-terra'}`}>
                        {n.kind === 'budget' ? <AlertTriangle className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-medium text-ink leading-snug">{n.text}</span>
                        <span className="block text-[11px] text-faint mt-0.5">{n.detail}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 bg-fill/60">
                <p className="text-[10px] text-ghost">Alerts are generated from your budgets and spending.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-1 sm:pl-3 sm:border-l border-line">
          <div className="w-8 h-8 bg-copper/15 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-copper-deep">
              {user?.name?.slice(0, 1).toUpperCase() || user?.email?.slice(0, 1).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
