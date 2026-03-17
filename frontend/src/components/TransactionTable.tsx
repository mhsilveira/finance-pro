"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Transaction } from "@/types/transaction";
import { TrashIcon, Pencil1Icon, CaretSortIcon, CaretUpIcon, CaretDownIcon } from "@radix-ui/react-icons";

type SortField = "description" | "category" | "type" | "origin" | "amount" | "date";
type SortDirection = "asc" | "desc";

interface TransactionTableProps {
	transactions: Transaction[];
	onDelete?: (id: string) => void;
	onEdit?: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onDelete, onEdit }: TransactionTableProps) {
	const [sortField, setSortField] = useState<SortField>("amount");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDirection(field === "amount" ? "desc" : "asc");
		}
	};

	const sortedTransactions = useMemo(() => [...transactions].sort((a, b) => {
		const dir = sortDirection === "asc" ? 1 : -1;

		switch (sortField) {
			case "description":
				return dir * a.description.localeCompare(b.description, "pt-BR");
			case "category":
				return dir * (a.category || "").localeCompare(b.category || "", "pt-BR");
			case "type":
				return dir * a.type.localeCompare(b.type);
			case "origin":
				return dir * (a.origin || "").localeCompare(b.origin || "");
			case "amount":
				return dir * (a.amount - b.amount);
			case "date":
				return dir * (a.date || "").localeCompare(b.date || "");
			default:
				return 0;
		}
	}), [transactions, sortField, sortDirection]);

	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) return <CaretSortIcon className="w-3.5 h-3.5 opacity-40" />;
		return sortDirection === "asc" ? (
			<CaretUpIcon className="w-3.5 h-3.5 text-purple-400" />
		) : (
			<CaretDownIcon className="w-3.5 h-3.5 text-purple-400" />
		);
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
		} catch {
			return dateString;
		}
	};

	const summaryStats = useMemo(() => {
		let income = 0;
		let expense = 0;
		for (const t of transactions) {
			if (t.type === "income") income += t.amount;
			else expense += t.amount;
		}
		return { income, expense, balance: income - expense };
	}, [transactions]);

	if (transactions.length === 0) {
		return (
			<div className="glass p-12 text-center">
				<div className="text-[var(--text-muted)] mb-2">
					<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Nenhuma transação encontrada</h3>
				<p className="text-[var(--text-secondary)]">Adicione sua primeira transação para começar</p>
			</div>
		);
	}

	const thClass = "px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] cursor-pointer select-none hover:text-[var(--text-secondary)] transition-colors";

	return (
		<div className="glass rounded-2xl overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-[var(--bg-glass-subtle)] border-b border-[var(--border-glass)]">
							<th className={thClass} onClick={() => handleSort("description")}>
								<span className="inline-flex items-center gap-1">
									Descrição <SortIcon field="description" />
								</span>
							</th>
							<th className={thClass} onClick={() => handleSort("category")}>
								<span className="inline-flex items-center gap-1">
									Categoria <SortIcon field="category" />
								</span>
							</th>
							<th className={thClass} onClick={() => handleSort("type")}>
								<span className="inline-flex items-center gap-1">
									Tipo <SortIcon field="type" />
								</span>
							</th>
							<th className={thClass} onClick={() => handleSort("origin")}>
								<span className="inline-flex items-center gap-1">
									Origem <SortIcon field="origin" />
								</span>
							</th>
							<th
								className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] cursor-pointer select-none hover:text-[var(--text-secondary)] transition-colors"
								onClick={() => handleSort("amount")}
							>
								<span className="inline-flex items-center gap-1 justify-end">
									Valor <SortIcon field="amount" />
								</span>
							</th>
							<th className={thClass} onClick={() => handleSort("date")}>
								<span className="inline-flex items-center gap-1">
									Data <SortIcon field="date" />
								</span>
							</th>
							<th className="px-6 py-4 text-center text-xs font-semibold text-[var(--text-muted)]">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-glass)]">
						{sortedTransactions.map((transaction) => (
							<tr key={transaction.id} className="hover:bg-white/[0.03] transition-all">
								<td className="px-6 py-4">
									<div className="text-sm font-medium text-[var(--text-primary)]">{transaction.description}</div>
									{transaction.card && <div className="text-xs text-[var(--text-muted)] mt-1">{transaction.card}</div>}
								</td>
								<td className="px-6 py-4">
									<span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-white/5 text-[var(--text-secondary)] border border-white/[0.08]">
										{transaction.category}
									</span>
								</td>
								<td className="px-6 py-4">
									<span
										className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
											transaction.type === "income"
												? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
												: "bg-pink-500/10 text-pink-400 border border-pink-500/20"
										}`}
									>
										{transaction.type === "income" ? "Receita" : "Despesa"}
									</span>
								</td>
								<td className="px-6 py-4">
									<span className="text-sm text-[var(--text-secondary)]">
										{transaction.origin === "CREDIT_CARD" ? "Cartão" : "Dinheiro"}
									</span>
								</td>
								<td className="px-6 py-4 text-right">
									<span
										className={`text-sm font-semibold tabular-nums ${
											transaction.type === "income" ? "text-green-400" : "text-pink-400"
										}`}
									>
										{transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
									</span>
								</td>
								<td className="px-6 py-4 text-sm text-[var(--text-secondary)] tabular-nums">{formatDate(transaction.date)}</td>
								<td className="px-6 py-4 text-center">
									<div className="flex items-center justify-center gap-2">
										{onEdit && (
											<button
												onClick={() => onEdit(transaction)}
												className="text-[var(--text-muted)] hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-purple-500/10"
												title="Editar transação"
											>
												<Pencil1Icon className="w-4 h-4" />
											</button>
										)}
										{onDelete && (
											<button
												onClick={() => onDelete(transaction.id)}
												className="text-[var(--text-muted)] hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-pink-500/10"
												title="Excluir transação"
											>
												<TrashIcon className="w-4 h-4" />
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="bg-[var(--bg-glass-subtle)] border-t border-[var(--border-glass)] px-6 py-4">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium text-[var(--text-secondary)]">
						Total de transações: <span className="text-purple-400 tabular-nums">{transactions.length}</span>
					</span>
					<div className="flex gap-6">
						<div className="text-right">
							<div className="text-xs text-[var(--text-muted)]">Receitas</div>
							<div className="text-sm font-semibold text-emerald-400 tabular-nums">
								{formatCurrency(summaryStats.income)}
							</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-[var(--text-muted)]">Despesas</div>
							<div className="text-sm font-semibold text-pink-400 tabular-nums">
								{formatCurrency(summaryStats.expense)}
							</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-[var(--text-muted)]">Saldo</div>
							<div className="text-sm font-semibold text-purple-400 tabular-nums">
								{formatCurrency(summaryStats.balance)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
