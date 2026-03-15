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
			<CaretUpIcon className="w-3.5 h-3.5 text-yellow-400" />
		) : (
			<CaretDownIcon className="w-3.5 h-3.5 text-yellow-400" />
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
			<div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
				<div className="text-gray-600 mb-2">
					<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-gray-100 mb-1">Nenhuma transação encontrada</h3>
				<p className="text-gray-400">Adicione sua primeira transação para começar</p>
			</div>
		);
	}

	const thClass = "px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-200 transition-colors";

	return (
		<div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-slate-950 border-b border-slate-800">
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
								className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-200 transition-colors"
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
							<th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-800">
						{sortedTransactions.map((transaction) => (
							<tr key={transaction.id} className="hover:bg-slate-800/50 transition-all">
								<td className="px-6 py-4">
									<div className="text-sm font-medium text-gray-100">{transaction.description}</div>
									{transaction.card && <div className="text-xs text-gray-500 mt-1">{transaction.card}</div>}
								</td>
								<td className="px-6 py-4">
									<span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-800 text-gray-300 border border-slate-700">
										{transaction.category}
									</span>
								</td>
								<td className="px-6 py-4">
									<span
										className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
											transaction.type === "income"
												? "bg-green-500/10 text-green-400 border border-green-500/30"
												: "bg-red-500/10 text-red-400 border border-red-500/30"
										}`}
									>
										{transaction.type === "income" ? "Receita" : "Despesa"}
									</span>
								</td>
								<td className="px-6 py-4">
									<span className="text-sm text-gray-400">
										{transaction.origin === "CREDIT_CARD" ? "Cartão" : "Dinheiro"}
									</span>
								</td>
								<td className="px-6 py-4 text-right">
									<span
										className={`text-sm font-semibold tabular-nums ${
											transaction.type === "income" ? "text-green-400" : "text-red-400"
										}`}
									>
										{transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
									</span>
								</td>
								<td className="px-6 py-4 text-sm text-gray-400 tabular-nums">{formatDate(transaction.date)}</td>
								<td className="px-6 py-4 text-center">
									<div className="flex items-center justify-center gap-2">
										{onEdit && (
											<button
												onClick={() => onEdit(transaction)}
												className="text-gray-500 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-yellow-500/10"
												title="Editar transação"
											>
												<Pencil1Icon className="w-4 h-4" />
											</button>
										)}
										{onDelete && (
											<button
												onClick={() => onDelete(transaction.id)}
												className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
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

			{/* Summary footer */}
			<div className="bg-slate-950 border-t border-slate-800 px-6 py-4">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
						Total de transações: <span className="text-yellow-400 tabular-nums">{transactions.length}</span>
					</span>
					<div className="flex gap-6">
						<div className="text-right">
							<div className="text-xs text-gray-500 uppercase tracking-wide">Receitas</div>
							<div className="text-sm font-semibold text-green-400 tabular-nums">
								{formatCurrency(summaryStats.income)}
							</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-gray-500 uppercase tracking-wide">Despesas</div>
							<div className="text-sm font-semibold text-red-400 tabular-nums">
								{formatCurrency(summaryStats.expense)}
							</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-gray-500 uppercase tracking-wide">Saldo</div>
							<div className="text-sm font-semibold text-yellow-400 tabular-nums">
								{formatCurrency(summaryStats.balance)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
