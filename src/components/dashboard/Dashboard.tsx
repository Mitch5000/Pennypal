import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useMountSkeleton, StatCardSkeleton, ChartSkeleton, SkeletonCard, RowsSkeleton } from '../Skeleton';
import { CATEGORY_COLORS } from '../../types';
import {
  TrendingUp, TrendingDown, DollarSign, Target,
  ArrowUpRight, ArrowDownRight, Wallet,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

const StatCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
}> = ({ title, value, change, icon, iconBg }) => (
  <div className="relative overflow-hidden rounded-2xl p-6 bg-card border border-line">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted font-medium">{title}</p>
        <p className="text-2xl font-bold text-ink mt-1 font-display">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-pine' : 'text-terra'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}% vs last month
          </div>
        )}
      </div>
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { transactions, budgets, loading } = useApp();
  const mounting = useMountSkeleton();
  const busy = loading || mounting;

  const now = new Date();
  const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const lastMonth = {
    start: startOfMonth(subMonths(now, 1)),
    end: endOfMonth(subMonths(now, 1)),
  };

  const thisMonthTxns = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), thisMonth)
  );
  const lastMonthTxns = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), lastMonth)
  );

  const stats = useMemo(() => {
    const income = thisMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastExpenses = lastMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeChange = lastIncome ? ((income - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses ? ((expenses - lastExpenses) / lastExpenses) * 100 : 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return { income, expenses, savings, savingsRate, incomeChange, expenseChange };
  }, [thisMonthTxns, lastMonthTxns]);

  // Monthly trend data (last 6 months)
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const interval = { start: startOfMonth(monthDate), end: endOfMonth(monthDate) };
      const monthTxns = transactions.filter(t => isWithinInterval(parseISO(t.date), interval));
      const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: format(monthDate, 'MMM'), income, expenses, savings: income - expenses };
    });
  }, [transactions]);

  // Expense by category (this month)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [thisMonthTxns]);

  // Recent transactions
  const recent = transactions.slice(0, 5);

  // Budget progress
  const currentMonth = format(now, 'yyyy-MM');
  const currentBudgets = budgets.filter(b => b.month === currentMonth);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  if (busy) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ChartSkeleton className="xl:col-span-2" height={220} />
          <ChartSkeleton height={160} />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonCard className="p-6"><RowsSkeleton n={5} /></SkeletonCard>
          <SkeletonCard className="p-6"><RowsSkeleton n={4} /></SkeletonCard>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Income"
          value={fmt(stats.income)}
          change={stats.incomeChange}
          iconBg="bg-pine/12"
          icon={<TrendingUp className="w-5 h-5 text-pine" />}
        />
        <StatCard
          title="Monthly Expenses"
          value={fmt(stats.expenses)}
          change={stats.expenseChange}
          iconBg="bg-terra/12"
          icon={<TrendingDown className="w-5 h-5 text-terra" />}
        />
        <StatCard
          title="Net Savings"
          value={fmt(stats.savings)}
          iconBg="bg-slateblue/12"
          icon={<Wallet className="w-5 h-5 text-slateblue" />}
        />
        <StatCard
          title="Savings Rate"
          value={`${stats.savingsRate.toFixed(1)}%`}
          iconBg="bg-plum/12"
          icon={<Target className="w-5 h-5 text-plum" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-ink">Cash Flow</h3>
              <p className="text-xs text-faint mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-pine" />Income
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-terra" />Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f6f4f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2f6f4f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b4553c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#b4553c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000009" />
              <XAxis dataKey="month" tick={{ fill: '#8b8175', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b8175', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#fffdf8', border: '1px solid #e6dfd2', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#8b8175' }}
                formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="income" stroke="#2f6f4f" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expenses" stroke="#b4553c" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-ink">Spending Breakdown</h3>
            <p className="text-xs text-faint mt-0.5">This month by category</p>
          </div>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#8b8175'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[item.name] || '#8b8175' }} />
                      <span className="text-xs text-muted truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-ink">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-faint">
              <DollarSign className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No expenses this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-ink">Recent Transactions</h3>
            <span className="text-xs text-faint">{recent.length} shown</span>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-faint text-sm text-center py-6">No transactions yet</p>
            ) : (
              recent.map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${CATEGORY_COLORS[t.category] || '#8b8175'}22` }}
                  >
                    <span className="text-sm">{t.type === 'income' ? '💰' : getCategoryEmoji(t.category)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{t.description || t.category}</p>
                    <p className="text-xs text-faint">{format(parseISO(t.date), 'MMM d, yyyy')} · {t.category}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-pine' : 'text-terra'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-ink">Budget Status</h3>
            <span className="text-xs text-faint">{format(now, 'MMMM yyyy')}</span>
          </div>
          {currentBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-faint">
              <Target className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No budgets set for this month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentBudgets.map(b => {
                const spent = thisMonthTxns
                  .filter(t => t.type === 'expense' && t.category === b.category)
                  .reduce((s, t) => s + t.amount, 0);
                const pct = Math.min((spent / b.limit_amount) * 100, 100);
                const over = spent > b.limit_amount;
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-body">{b.category}</span>
                      <div className="text-right">
                        <span className={`text-xs font-medium ${over ? 'text-terra' : 'text-muted'}`}>
                          {fmt(spent)} / {fmt(b.limit_amount)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-fill rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          over ? 'bg-terra' : pct > 80 ? 'bg-ochre' : 'bg-pine'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-ghost">{pct.toFixed(0)}% used</span>
                      {over && <span className="text-xs text-terra font-medium">Over budget!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    'Food & Dining': '🍽️', 'Transportation': '🚗', 'Shopping': '🛍️',
    'Entertainment': '🎬', 'Bills & Utilities': '⚡', 'Health & Fitness': '💪',
    'Travel': '✈️', 'Education': '📚', 'Personal Care': '💅', 'Other': '💳',
  };
  return map[cat] || '💳';
}
