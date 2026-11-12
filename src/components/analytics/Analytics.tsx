import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useMountSkeleton, Skeleton, ChartSkeleton } from '../Skeleton';
import { CATEGORY_COLORS } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import {
  format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval,
  eachDayOfInterval,
} from 'date-fns';

const COLORS = ['#2f6f4f', '#b4553c', '#4f7a8c', '#7a5c74', '#b5842b', '#a8586f', '#3d8a8a'];

export const Analytics: React.FC = () => {
  const { transactions, loading } = useApp();
  const mounting = useMountSkeleton();
  const busy = loading || mounting;
  const [monthRange, setMonthRange] = useState(6);

  const now = new Date();

  // Monthly income vs expense
  const monthlyData = useMemo(() => {
    return Array.from({ length: monthRange }, (_, i) => {
      const d = subMonths(now, monthRange - 1 - i);
      const interval = { start: startOfMonth(d), end: endOfMonth(d) };
      const txns = transactions.filter(t => isWithinInterval(parseISO(t.date), interval));
      const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: format(d, 'MMM yy'), income, expenses, net: income - expenses };
    });
  }, [transactions, monthRange]);

  // Category breakdown (all time)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Income sources
  const incomeData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Daily spending (last 30 days)
  const dailyData = useMemo(() => {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    const days = eachDayOfInterval({ start, end: now });
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTxns = transactions.filter(t => t.date === dateStr && t.type === 'expense');
      return {
        day: format(day, 'MMM d'),
        amount: dayTxns.reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);



  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  if (busy) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-52 rounded" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <ChartSkeleton height={280} />
        <ChartSkeleton height={220} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartSkeleton height={200} />
          <ChartSkeleton height={220} />
        </div>
        <ChartSkeleton height={200} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Month Range Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Financial Analytics</h2>
        <div className="flex bg-card border border-line rounded-xl overflow-hidden">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonthRange(m)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                monthRange === m ? 'bg-copper text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Income vs Expense Bar Chart */}
      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="text-base font-semibold text-ink mb-1">Income vs Expenses</h3>
        <p className="text-xs text-faint mb-5">Monthly comparison over the last {monthRange} months</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000009" />
            <XAxis dataKey="month" tick={{ fill: '#8b8175', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b8175', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#fffdf8', border: '1px solid #e6dfd2', borderRadius: 12, fontSize: 12 }}
              formatter={(val: unknown) => [fmt(Number(val)), '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8b8175' }} />
            <Bar dataKey="income" name="Income" fill="#2f6f4f" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#b4553c" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net savings trend */}
      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="text-base font-semibold text-ink mb-1">Net Savings Trend</h3>
        <p className="text-xs text-faint mb-5">Monthly net savings (income – expenses)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f7a8c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f7a8c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000009" />
            <XAxis dataKey="month" tick={{ fill: '#8b8175', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b8175', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: '#fffdf8', border: '1px solid #e6dfd2', borderRadius: 12, fontSize: 12 }}
              formatter={(val: unknown) => [fmt(Number(val)), 'Net Savings']}
            />
            <Area type="monotone" dataKey="net" stroke="#4f7a8c" strokeWidth={2} fill="url(#netGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category + Income split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card border border-line rounded-2xl p-6">
          <h3 className="text-base font-semibold text-ink mb-1">Expense Categories</h3>
          <p className="text-xs text-faint mb-5">All-time spending by category</p>
          {categoryData.length > 0 ? (
            <div className="flex gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-52">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: Object.values(CATEGORY_COLORS)[i % Object.values(CATEGORY_COLORS).length] }} />
                      <span className="text-xs text-muted truncate">{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-ink">{fmt(item.value)}</p>
                      <p className="text-xs text-ghost">{item.pct.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-faint text-sm text-center py-10">No expense data</p>
          )}
        </div>

        {/* Income Sources */}
        <div className="bg-card border border-line rounded-2xl p-6">
          <h3 className="text-base font-semibold text-ink mb-1">Income Sources</h3>
          <p className="text-xs text-faint mb-5">All-time income by category</p>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={incomeData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000009" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8b8175', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8b8175', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ background: '#fffdf8', border: '1px solid #e6dfd2', borderRadius: 12, fontSize: 12 }}
                  formatter={(val: unknown) => [fmt(Number(val)), '']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {incomeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-faint text-sm text-center py-10">No income data</p>
          )}
        </div>
      </div>

      {/* Daily spending */}
      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="text-base font-semibold text-ink mb-1">Daily Spending</h3>
        <p className="text-xs text-faint mb-5">Last 30 days expense activity</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000009" />
            <XAxis dataKey="day" tick={{ fill: '#8b8175', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: '#8b8175', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#fffdf8', border: '1px solid #e6dfd2', borderRadius: 12, fontSize: 12 }}
              formatter={(val: unknown) => [fmt(Number(val)), 'Expenses']}
            />
            <Line type="monotone" dataKey="amount" stroke="#b0673a" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#b0673a' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
