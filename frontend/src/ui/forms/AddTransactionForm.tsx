'use client';
import React from 'react';
import { useDispatch } from 'react-redux';
import { addTransaction } from '@/store/transactions/transactionsSlice';
import type { Transaction } from '@/services/mockData';
import type { AppDispatch } from '@/store/store';
import { Card, Stack, Input, Select, Button, Text } from '@/ui/design/atoms';

const categories = ['Food','Housing','Transport','Leisure','Health','Income','Other'];

export default function AddTransactionForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = React.useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString(),
    monthYear: new Date().toISOString().slice(0,7),
    name: '',
    description: '',
    category: 'Food',
    amount: 0,
    type: 'expense',
  });
  const [submitting, setSubmitting] = React.useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.monthYear) return;
    setSubmitting(true);
    try {
      await dispatch(addTransaction(form)).unwrap();
      setForm((f) => ({
        ...f,
        name: '',
        description: '',
        amount: 0,
        date: new Date().toISOString(),
        monthYear: f.monthYear, // mantém mês/ano selecionado
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <Stack gap={12}>
          <Text size={16} weight={600}>Add Expense/Income</Text>
          <div className="grid-3">
            <Input label="Name" placeholder="e.g., Groceries" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <Input label="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => update('amount', Number(e.target.value))} />
            <Select label="Type" value={form.type} onChange={(e) => update('type', e.target.value as any)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </div>
          <div className="grid-3">
            <Select label="Category" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Month/Year" type="month" value={form.monthYear} onChange={(e) => update('monthYear', e.target.value)} />
            <Input label="Date" type="date" value={form.date.slice(0,10)} onChange={(e) => update('date', new Date(e.target.value).toISOString())} />
          </div>
          <Input label="Description" placeholder="Optional details..." value={form.description} onChange={(e) => update('description', e.target.value)} />
          <Stack direction="row" justify="flex-end">
            <Button type="submit" disabled={submitting || !form.name || form.amount <= 0}>
              {submitting ? 'Saving...' : 'Add'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}