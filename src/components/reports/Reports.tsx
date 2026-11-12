import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useMountSkeleton, Skeleton, SkeletonCard, StatCardSkeleton, RowsSkeleton } from '../Skeleton';
import { CATEGORY_COLORS } from '../../types';
import {
  format, startOfMonth, endOfMonth, parseISO, isWithinInterval, subMonths,
} from 'date-fns';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Budget } from '../../types';

export const Reports: React.FC = () => {
  const { transactions, budgets, loading } = useApp();
  const mounting = useMountSkeleton();
  const busy = loading || mounting;
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthDate = new Date(selectedMonth + '-01');
  const interval = { start: startOfMonth(monthDate), end: endOfMonth(monthDate) };

  const monthTxns = transactions.filter(t => {
    try { return isWithinInterval(parseISO(t.date), interval); } catch { return false; }
  });

  const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const byCategory = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    monthTxns.forEach(t => {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 };
      map[t.category][t.type] += t.amount;
    });
    return Object.entries(map).map(([cat, v]) => ({ category: cat, ...v })).sort((a, b) => (b.expense + b.income) - (a.expense + a.income));
  }, [monthTxns]);

  const currentBudgets = budgets.filter(b => b.month === selectedMonth);

  // Month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = monthTxns.map(t => [t.date, t.type, t.category, t.description, t.amount.toString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pennypal-report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SummaryCard: React.FC<{ label: string; value: string; sub?: string; positive?: boolean; icon: React.ReactNode; color: string }> = ({
    label, value, sub, positive, icon, color,
  }) => (
    <div className={`bg-card border border-line rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold font-display ${positive === true ? 'text-pine' : positive === false ? 'text-terra' : 'text-ink'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-faint mt-1">{sub}</p>}
    </div>
  );

  if (busy) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-56 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <SkeletonCard className="p-6"><RowsSkeleton n={7} divider /></SkeletonCard>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted" />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-card border border-line rounded-xl px-4 py-2.5 text-ink text-sm focus:outline-none focus:border-copper transition-all"
          >
            {monthOptions.map(o => (
              <option key={o.value} value={o.value} className="bg-canvas">{o.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-card hover:bg-fill-strong border border-line text-body hover:text-ink px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Income" value={fmt(income)} sub={`${monthTxns.filter(t => t.type === 'income').length} transactions`}
          positive={true} icon={<TrendingUp className="w-4 h-4 text-pine" />} color="bg-pine/12"
        />
        <SummaryCard
          label="Total Expenses" value={fmt(expenses)} sub={`${monthTxns.filter(t => t.type === 'expense').length} transactions`}
          positive={false} icon={<TrendingDown className="w-4 h-4 text-terra" />} color="bg-terra/12"
        />
        <SummaryCard
          label="Net Savings" value={fmt(savings)} sub={savings >= 0 ? 'Great job!' : 'Over budget'}
          positive={savings >= 0} icon={<DollarSign className="w-4 h-4 text-slateblue" />} color="bg-slateblue/12"
        />
        <SummaryCard
          label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} sub="Of income saved"
          icon={<FileText className="w-4 h-4 text-plum" />} color="bg-plum/12"
        />
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h3 className="text-base font-semibold text-ink">Category Breakdown</h3>
          <p className="text-xs text-faint mt-0.5">{format(monthDate, 'MMMM yyyy')} report</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-6 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Income</th>
                <th className="text-right px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Expenses</th>
                <th className="text-right px-6 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {byCategory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-faint text-sm">No transactions for this month</td>
                </tr>
              ) : (
                byCategory.map((row, i) => (
                  <tr key={i} className="hover:bg-fill transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${CATEGORY_COLORS[row.category] || '#8b8175'}22` }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[row.category] || '#8b8175' }} />
                        </div>
                        <span className="text-sm font-medium text-ink">{row.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-pine">
                      {row.income > 0 ? fmt(row.income) : '—'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-terra">
                      {row.expense > 0 ? fmt(row.expense) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">
                      <span className={row.income - row.expense >= 0 ? 'text-pine' : 'text-terra'}>
                        {fmt(row.income - row.expense)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {byCategory.length > 0 && (
              <tfoot className="border-t border-line-strong">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold text-ink">Total</td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-pine">{fmt(income)}</td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-terra">{fmt(expenses)}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold">
                    <span className={savings >= 0 ? 'text-pine' : 'text-terra'}>{fmt(savings)}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Budget vs Actual */}
      {currentBudgets.length > 0 && (
        <div className="bg-card border border-line rounded-2xl p-6">
          <h3 className="text-base font-semibold text-ink mb-1">Budget vs Actual</h3>
          <p className="text-xs text-faint mb-5">How you tracked against your budgets this month</p>
          <div className="space-y-5">
            {currentBudgets.map((b: Budget) => {
              const spent = monthTxns
                .filter(t => t.type === 'expense' && t.category === b.category)
                .reduce((s, t) => s + t.amount, 0);
              const pct = Math.min((spent / b.limit_amount) * 100, 100);
              const over = spent > b.limit_amount;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[b.category] || '#8b8175' }} />
                      <span className="text-sm font-medium text-ink">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted">Budget: <span className="text-ink font-medium">{fmt(b.limit_amount)}</span></span>
                      <span className={`font-medium ${over ? 'text-terra' : 'text-body'}`}>
                        Spent: {fmt(spent)}
                      </span>
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${over ? 'bg-terra/12 text-terra' : 'bg-pine/12 text-pine'}`}>
                        {over ? `+${fmt(spent - b.limit_amount)} over` : `${fmt(b.limit_amount - spent)} left`}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-fill rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-terra' : pct > 80 ? 'bg-ochre' : 'bg-pine'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h3 className="text-base font-semibold text-ink">All Transactions</h3>
          <p className="text-xs text-faint mt-0.5">{monthTxns.length} transactions in {format(monthDate, 'MMMM yyyy')}</p>
        </div>
        <div className="divide-y divide-line max-h-96 overflow-y-auto">
          {monthTxns.length === 0 ? (
            <p className="text-center py-12 text-faint text-sm">No transactions this month</p>
          ) : (
            monthTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-fill transition-colors">
                <span className="text-xs text-faint w-24 flex-shrink-0">{format(parseISO(t.date), 'MMM d, yyyy')}</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[t.category] || '#8b8175'}22`, color: CATEGORY_COLORS[t.category] || '#8b8175' }}
                >
                  {t.category}
                </span>
                <span className="flex-1 text-sm text-body truncate">{t.description || '—'}</span>
                <span className={`text-sm font-semibold flex-shrink-0 ${t.type === 'income' ? 'text-pine' : 'text-terra'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
