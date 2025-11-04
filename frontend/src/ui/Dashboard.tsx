// src/ui/Dashboard.tsx
"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategory, setMonthYear, setQuery, setType } from "@/store/transactions/filtersSlice";
import { selectFiltered, selectTotals } from "@/store/transactions/selectors";
import { Card, H1, Input, Select, Stack, Text } from "./design/atoms";
import AddTransactionForm from "./forms/AddTransactionForm";
import { useDashboard } from "./hooks/useDashboard";
import TransactionList from "./TransactionList";
import { formatCurrencyBR } from "./utils/format";

const categories = ["all", "Income", "Food", "Housing", "Transport", "Leisure", "Health", "Other"];

export default function Dashboard() {
	const dispatch = useDispatch();
	const items = useSelector(selectFiltered);
	const totals = useSelector(selectTotals);
	const { currentMonth, changes, totalTransactions, loading } = useDashboard();

	// badge de ambiente
	const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
	const userId = process.env.NEXT_PUBLIC_USER_ID;

	return (
		<div className="container">
			<Stack direction="row" justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<H1>Finance Pro</H1>
				<Text muted>
					{apiBase ? `API: ${apiBase}` : "API: (não configurada)"} • user: {userId || "anon"}
				</Text>
			</Stack>

			<div className="grid-3">
				<Card>
					<Text muted>Receitas</Text>
					<Text size={22} weight={700} style={{ color: "var(--success)" }}>
						{formatCurrencyBR(currentMonth.income)}
					</Text>
					{changes.incomeChange !== 0 && (
						<Text size={12} style={{ color: changes.incomeChange > 0 ? "var(--success)" : "var(--danger)" }}>
							{changes.incomeChange > 0 ? "+" : ""}
							{changes.incomeChange.toFixed(1)}% vs mês anterior
						</Text>
					)}
				</Card>
				<Card>
					<Text muted>Despesas</Text>
					<Text size={22} weight={700} style={{ color: "var(--danger)" }}>
						{formatCurrencyBR(currentMonth.expense)}
					</Text>
					{changes.expenseChange !== 0 && (
						<Text size={12} style={{ color: changes.expenseChange > 0 ? "var(--danger)" : "var(--success)" }}>
							{changes.expenseChange > 0 ? "+" : ""}
							{changes.expenseChange.toFixed(1)}% vs mês anterior
						</Text>
					)}
				</Card>
				<Card>
					<Text muted>Saldo</Text>
					<Text
						size={22}
						weight={700}
						style={{ color: currentMonth.balance >= 0 ? "var(--success)" : "var(--danger)" }}
					>
						{formatCurrencyBR(currentMonth.balance)}
					</Text>
					<Text size={12} muted>
						{totalTransactions} transações este mês
					</Text>
				</Card>
			</div>

			{/* Cards de Estatísticas Adicionais */}
			<div className="grid-3" style={{ marginTop: 16 }}>
				<Card>
					<Text muted>Taxa de Poupança</Text>
					<Text
						size={20}
						weight={600}
						style={{
							color:
								(currentMonth.balance / currentMonth.income) * 100 >= 20
									? "var(--success)"
									: (currentMonth.balance / currentMonth.income) * 100 >= 10
										? "#f59e0b"
										: "var(--danger)",
						}}
					>
						{currentMonth.income > 0 ? ((currentMonth.balance / currentMonth.income) * 100).toFixed(1) : 0}%
					</Text>
					<Text size={12} muted>
						{currentMonth.balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
					</Text>
				</Card>
				<Card>
					<Text muted>Gasto Médio Diário</Text>
					<Text size={20} weight={600} style={{ color: "var(--danger)" }}>
						{formatCurrencyBR(currentMonth.expense / 30)}
					</Text>
					<Text size={12} muted>
						Baseado no mês atual
					</Text>
				</Card>
				<Card>
					<Text muted>Status Financeiro</Text>
					<Text
						size={18}
						weight={600}
						style={{
							color: currentMonth.balance >= 0 ? "var(--success)" : "var(--danger)",
						}}
					>
						{currentMonth.balance >= 0 ? "✅ Saudável" : "⚠️ Atenção"}
					</Text>
					<Text size={12} muted>
						{currentMonth.balance >= 0 ? "Contas em dia" : "Gastos acima da receita"}
					</Text>
				</Card>
			</div>

			<Card style={{ marginTop: 16 }}>
				<Stack direction="row" gap={12}>
					<Input placeholder="Buscar..." onChange={(e) => dispatch(setQuery(e.target.value))} />
					<Select defaultValue="all" onChange={(e) => dispatch(setCategory(e.target.value as any))}>
						{categories.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</Select>
					<Select defaultValue="all" onChange={(e) => dispatch(setType(e.target.value as any))}>
						<option value="all">Todos</option>
						<option value="income">Receitas</option>
						<option value="expense">Despesas</option>
					</Select>
					<Input type="month" onChange={(e) => dispatch(setMonthYear(e.target.value || "all"))} />
				</Stack>
			</Card>

			<div style={{ marginTop: 16 }}>
				<AddTransactionForm />
			</div>

			<Card style={{ marginTop: 16 }}>
				<TransactionList items={items} />
			</Card>
		</div>
	);
}
