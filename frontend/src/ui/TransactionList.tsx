// src/ui/TransactionList.tsx
"use client";
import React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import type { Transaction } from "@/store/transactions/transactions";
// ajuste: importar do arquivo correto
import { removeTransaction } from "@/store/transactions/transactions";
import { Button, Text } from "./design/atoms";
import { formatCurrencyBR, formatMonthYearBR } from "./utils/format";

type Props = { items: Transaction[] };

const TransactionRow = React.memo(function TransactionRow({
	t,
	onDelete,
}: {
	t: Transaction;
	onDelete: (id: string) => void;
}) {
	return (
		<tr>
			<td>
				<Text weight={600}>{t.name}</Text>
				<div className="muted" style={{ fontSize: 12 }}>
					{t.description}
				</div>
			</td>
			<td>{t.category}</td>
			<td>{formatMonthYearBR(t.monthYear)}</td>
			<td style={{ color: t.type === "income" ? "var(--success)" : "var(--danger)" }}>{formatCurrencyBR(t.amount)}</td>
			<td>
				<Button variant="ghost" onClick={() => onDelete(t.id)}>
					Delete
				</Button>
			</td>
		</tr>
	);
});

export default function TransactionList({ items }: Props) {
	const dispatch = useDispatch<AppDispatch>();
	const handleDelete = React.useCallback(
		(id: string) => {
			dispatch(removeTransaction(id));
		},
		[dispatch],
	);

	// dedupe defensivo por id para evitar keys duplicadas
	const uniqueItems = React.useMemo(() => {
		const map = new Map<string, Transaction>();
		for (const it of items) {
			if (!map.has(it.id)) map.set(it.id, it);
		}
		return Array.from(map.values());
	}, [items]);

	return (
		<table className="table">
			<thead>
				<tr>
					<th>Item</th>
					<th>Category</th>
					<th>Month</th>
					<th>Amount</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{uniqueItems.map((t) => (
					<TransactionRow key={`${t.id}-${t.date}`} t={t} onDelete={handleDelete} />
				))}
			</tbody>
		</table>
	);
}
