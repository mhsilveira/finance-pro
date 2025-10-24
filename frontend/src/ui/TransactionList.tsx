'use client';
import React from 'react';
import { Transaction, removeTransaction } from '@/store/transactions/transactionsSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { Button, Text } from './design/atoms';
import { formatCurrencyBR, formatMonthYearBR } from './utils/format';

type Props = { items: Transaction[] };

const TransactionRow = React.memo(function TransactionRow({ t, onDelete }: { t: Transaction; onDelete: (id: string) => void }) {
  return (
    <tr>
      <td><Text weight={600}>{t.name}</Text><div className="muted" style={{ fontSize: 12 }}>{t.description}</div></td>
      <td>{t.category}</td>
      <td>{formatMonthYearBR(t.monthYear)}</td>
      <td style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
        {formatCurrencyBR(t.amount)}
      </td>
      <td><Button variant="ghost" onClick={() => onDelete(t.id)}>Delete</Button></td>
    </tr>
  );
});

export default function TransactionList({ items }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const handleDelete = React.useCallback((id: string) => {
    dispatch(removeTransaction(id));
  }, [dispatch]);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Item</th><th>Category</th><th>Month</th><th>Amount</th><th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <TransactionRow key={t.id} t={t} onDelete={handleDelete} />
        ))}
      </tbody>
    </table>
  );
}