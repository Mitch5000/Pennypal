import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useMountSkeleton, Skeleton, SkeletonCard, RowsSkeleton } from '../Skeleton';
import { Transaction, CATEGORY_COLORS } from '../../types';
import { TransactionModal } from './TransactionModal';
import { Plus, Search, Filter, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Transactions: React.FC = () => {
  const { transactions, deleteTransaction, loading } = useApp();
  const mounting = useMountSkeleton();
  const busy = loading || mounting;
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Header search jumps here and prefills the query
  useEffect(() => {
    const on = (e: Event) => { setSearch((e as CustomEvent).detail as string); setPage(1); };
    window.addEventListener('pp-search', on);
    return () => window.removeEventListener('pp-search', on);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(transactions.map(t => t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search) list = list.filter(t =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    );
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory);
    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.amount - a.amount;
    });
    return list;
  }, [transactions, search, filterType, filterCategory, sortBy]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (busy) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <SkeletonCard key={i} className="p-5 space-y-2.5">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </SkeletonCard>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <SkeletonCard className="p-6"><RowsSkeleton n={8} divider /></SkeletonCard>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-line rounded-2xl p-5">
          <p className="text-xs text-muted font-medium">Filtered Transactions</p>
          <p className="text-2xl font-bold text-ink mt-1">{filtered.length}</p>
        </div>
        <div className="bg-pine/10 border border-pine/20 rounded-2xl p-5">
          <p className="text-xs text-pine font-medium">Total Income</p>
          <p className="text-2xl font-bold text-pine mt-1 font-display">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-terra/10 border border-terra/20 rounded-2xl p-5">
          <p className="text-xs text-terra font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-terra mt-1 font-display">{fmt(totalExpense)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-card border border-line rounded-xl pl-10 pr-4 py-2.5 text-ink placeholder-faint focus:outline-none focus:border-copper text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <div className="flex bg-card border border-line rounded-xl overflow-hidden">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setFilterType(t); setPage(1); }}
                className={`px-3 py-2 text-xs font-medium capitalize transition-all ${
                  filterType === t
                    ? t === 'income' ? 'bg-pine text-paper' : t === 'expense' ? 'bg-terra text-paper' : 'bg-fill-strong text-ink'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
          className="bg-card border border-line rounded-xl px-3 py-2.5 text-sm text-body focus:outline-none focus:border-copper transition-all"
        >
          <option value="all" className="bg-canvas">All Categories</option>
          {categories.map(c => <option key={c} value={c} className="bg-canvas">{c}</option>)}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'amount')}
          className="bg-card border border-line rounded-xl px-3 py-2.5 text-sm text-body focus:outline-none focus:border-copper transition-all"
        >
          <option value="date" className="bg-canvas">Sort: Date</option>
          <option value="amount" className="bg-canvas">Sort: Amount</option>
        </select>

        <button
          onClick={() => { setEditTx(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-copper hover:bg-copper-deep text-paper px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-black/10 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Transaction</th>
                <th className="text-left px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">Amount</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-faint">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginated.map(t => (
                  <tr key={t.id} className="hover:bg-fill transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${CATEGORY_COLORS[t.category] || '#8b8175'}22` }}
                        >
                          {t.type === 'income'
                            ? <ArrowUpRight className="w-4 h-4 text-pine" />
                            : <ArrowDownRight className="w-4 h-4 text-terra" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{t.description || t.category}</p>
                          <p className="text-xs text-faint capitalize">{t.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${CATEGORY_COLORS[t.category] || '#8b8175'}22`,
                          color: CATEGORY_COLORS[t.category] || '#8b8175',
                        }}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {format(parseISO(t.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-pine' : 'text-terra'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditTx(t); setShowModal(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-fill hover:bg-slateblue/12 text-muted hover:text-slateblue transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => void deleteTransaction(t.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-fill hover:bg-terra/12 text-muted hover:text-terra transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-line">
            <p className="text-xs text-faint">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === p
                      ? 'bg-copper text-paper'
                      : 'bg-fill text-muted hover:text-ink hover:bg-fill-strong'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditTx(null); }}
          editTransaction={editTx}
        />
      )}
    </div>
  );
};
