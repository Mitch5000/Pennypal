import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../types';
import { X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<Props> = ({ onClose, editTransaction }) => {
  const { addTransaction, updateTransaction } = useApp();
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!categories.includes(category)) setCategory('');
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!category) { toast.error('Please select a category'); return; }
    setLoading(true);
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, {
          type, amount: Number(amount), category, description, date,
        });
      } else {
        await addTransaction({ type, amount: Number(amount), category, description, date });
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-line rounded-3xl shadow-xl shadow-black/10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-fill hover:bg-fill-strong text-muted hover:text-ink transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex bg-fill rounded-2xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              type === 'expense'
                ? 'bg-terra text-paper shadow-sm shadow-black/10'
                : 'text-muted hover:text-ink'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              type === 'income'
                ? 'bg-pine text-paper shadow-sm shadow-black/10'
                : 'text-muted hover:text-ink'
            }`}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-4 py-3.5 text-ink placeholder-faint focus:outline-none focus:border-copper transition-all text-sm"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-4 py-3.5 text-ink focus:outline-none focus:border-copper transition-all text-sm appearance-none"
            >
              <option value="" className="bg-canvas">Select category</option>
              {categories.map(c => (
                <option key={c} value={c} className="bg-canvas">{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-4 py-3.5 text-ink placeholder-faint focus:outline-none focus:border-copper transition-all text-sm"
            />
          </div>

          {/* Date */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-4 py-3.5 text-ink focus:outline-none focus:border-copper transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-paper transition-all duration-200 disabled:opacity-50 ${
              type === 'income'
                ? 'bg-pine hover:bg-pine-light shadow-sm shadow-black/10'
                : 'bg-terra hover:bg-terra-light shadow-sm shadow-black/10'
            }`}
          >
            {loading ? 'Saving...' : editTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};
