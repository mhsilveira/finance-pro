"use client";

import { useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useAllTransactions } from "@/hooks/useTransactions";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
	const [selectedPeriod, setSelectedPeriod] = useState<"all" | "month" | "quarter">("all");

	const userId = "blanchimaah";

	const { data: transactions = [], isLoading: loading, error: queryError } = useAllTransactions(userId);
	const error = queryError ? (queryError as Error).message : "";

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const getFilteredTransactions = () => {
		const now = new Date();

		if (selectedPeriod === "month") {
			const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
			return transactions.filter((t) => new Date(t.date) >= monthAgo);
		}

		if (selectedPeriod === "quarter") {
			const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
			return transactions.filter((t) => new Date(t.date) >= quarterAgo);
		}

		return transactions;
	};

	const filteredTransactions = getFilteredTransactions();

	const getCategoryAnalysis = () => {
		const categoryMap = new Map<string, { total: number; count: number }>();

		filteredTransactions
			.filter((t) => t.type === "expense")
			.forEach((t) => {
				const category = t.category || "Outros";
				const current = categoryMap.get(category) || { total: 0, count: 0 };
				categoryMap.set(category, {
					total: current.total + t.amount,
					count: current.count + 1,
				});
			});

		return Array.from(categoryMap.entries())
			.map(([category, data]) => ({
				category,
				total: data.total,
				count: data.count,
				average: data.total / data.count,
			}))
			.sort((a, b) => b.total - a.total);
	};

	const categoryAnalysis = getCategoryAnalysis();

	const topExpenses = [...filteredTransactions]
		.filter((t) => t.type === "expense")
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 10);

	const getMonthlyComparison = () => {
		const monthlyMap = new Map<string, { income: number; expense: number }>();

		filteredTransactions.forEach((t) => {
			const monthYear = t.monthYear || t.date.substring(0, 7);
			if (!monthlyMap.has(monthYear)) {
				monthlyMap.set(monthYear, { income: 0, expense: 0 });
			}
			const data = monthlyMap.get(monthYear)!;
			if (t.type === "income") {
				data.income += t.amount;
			} else {
				data.expense += t.amount;
			}
		});

		return Array.from(monthlyMap.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.slice(-6);
	};

	const monthlyComparison = getMonthlyComparison();

	const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

	const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

	const getPreviousPeriodExpenses = () => {
		const now = new Date();
		let prevTransactions: typeof filteredTransactions;

		if (selectedPeriod === "month") {
			const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
			const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
			prevTransactions = transactions.filter((t) => {
				const d = new Date(t.date);
				return d >= twoMonthsAgo && d < oneMonthAgo;
			});
		} else if (selectedPeriod === "quarter") {
			const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
			const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
			prevTransactions = transactions.filter((t) => {
				const d = new Date(t.date);
				return d >= sixMonthsAgo && d < threeMonthsAgo;
			});
		} else {
			return 0;
		}

		return prevTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
	};

	const prevPeriodExpenses = getPreviousPeriodExpenses();
	const expenseVariation = prevPeriodExpenses > 0
		? ((totalExpenses - prevPeriodExpenses) / prevPeriodExpenses) * 100
		: 0;

	const categoryChartData = {
		labels: categoryAnalysis.map((c) => c.category),
		datasets: [
			{
				label: "Gastos por Categoria",
				data: categoryAnalysis.map((c) => c.total),
				backgroundColor: [
					"rgba(139, 92, 246, 0.8)",
					"rgba(96, 165, 250, 0.8)",
					"rgba(244, 114, 182, 0.8)",
					"rgba(251, 191, 36, 0.8)",
					"rgba(52, 211, 153, 0.8)",
					"rgba(167, 139, 250, 0.8)",
					"rgba(148, 163, 184, 0.8)",
				],
			},
		],
	};

	const monthlyChartData = {
		labels: monthlyComparison.map(([month]) => {
			const [year, m] = month.split("-");
			return `${m}/${year}`;
		}),
		datasets: [
			{
				label: "Receitas",
				data: monthlyComparison.map(([, data]) => data.income),
				backgroundColor: "rgba(52, 211, 153, 0.8)",
			},
			{
				label: "Despesas",
				data: monthlyComparison.map(([, data]) => data.expense),
				backgroundColor: "rgba(244, 114, 182, 0.8)",
			},
		],
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--accent-primary)] mx-auto mb-4" />
					<p className="text-[var(--text-muted)] font-medium">Carregando análises...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-8 max-w-md">
					<h3 className="text-xl font-semibold text-pink-400 mb-2">Erro ao carregar dados</h3>
					<p className="text-pink-300">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen animate-fade-in">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-[var(--text-primary)]">Análises e Insights</h1>
					<p className="mt-2 text-[var(--text-secondary)]">Entenda melhor seus padrões de gastos</p>
				</div>

				<div className="mb-6 flex gap-2">
					<button
						onClick={() => setSelectedPeriod("all")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedPeriod === "all"
								? "bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]"
								: "bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] border border-[var(--border-glass)]"
						}`}
					>
						Todos
					</button>
					<button
						onClick={() => setSelectedPeriod("month")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedPeriod === "month"
								? "bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]"
								: "bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] border border-[var(--border-glass)]"
						}`}
					>
						Último Mês
					</button>
					<button
						onClick={() => setSelectedPeriod("quarter")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedPeriod === "quarter"
								? "bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)]"
								: "bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] border border-[var(--border-glass)]"
						}`}
					>
						Último Trimestre
					</button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className="glass glass-hover rounded-xl p-6">
						<p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Total em Despesas</p>
						<p className="text-3xl font-semibold text-pink-400 tabular-nums">{formatCurrency(totalExpenses)}</p>
					</div>

					<div className="glass glass-hover rounded-xl p-6">
						<p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Total em Receitas</p>
						<p className="text-3xl font-semibold text-emerald-400 tabular-nums">{formatCurrency(totalIncome)}</p>
					</div>

					<div className="glass rounded-xl p-6 border border-purple-500/50 hover:border-purple-500 transition-all relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
						<div className="relative">
							<p className="text-sm font-medium text-purple-400 uppercase tracking-wide mb-2">Variação Mensal</p>
							{selectedPeriod === "all" ? (
								<p className="text-lg font-medium text-[var(--text-muted)]">Selecione um período</p>
							) : (
								<>
									<p className={`text-3xl font-semibold tabular-nums ${expenseVariation > 0 ? "text-pink-400" : expenseVariation < 0 ? "text-emerald-400" : "text-[var(--text-primary)]"}`}>
										{expenseVariation > 0 ? "+" : ""}{expenseVariation.toFixed(1)}%
									</p>
									<p className="text-xs text-[var(--text-muted)] mt-1">
										{expenseVariation > 0 ? "gastando mais" : expenseVariation < 0 ? "gastando menos" : "sem variação"} vs período anterior
									</p>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<div className="glass rounded-2xl p-6">
						<h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
							Distribuição por Categoria
						</h2>
						{categoryAnalysis.length > 0 ? (
							<Bar
								data={categoryChartData}
								options={{
									responsive: true,
									plugins: {
										legend: {
											display: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: "#6b6580" },
											grid: { color: "rgba(255, 255, 255, 0.05)" },
										},
										x: {
											ticks: { color: "#6b6580" },
											grid: { color: "rgba(255, 255, 255, 0.05)" },
										},
									},
								}}
							/>
						) : (
							<p className="text-[var(--text-muted)] text-center py-8">Sem dados de despesas</p>
						)}
					</div>

					<div className="glass rounded-2xl p-6">
						<h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Comparação Mensal</h2>
						{monthlyComparison.length > 0 ? (
							<Bar
								data={monthlyChartData}
								options={{
									responsive: true,
									plugins: {
										legend: {
											position: "bottom",
											labels: {
												color: "#9b95a8",
												font: { size: 12 },
											},
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: "#6b6580" },
											grid: { color: "rgba(255, 255, 255, 0.05)" },
										},
										x: {
											ticks: { color: "#6b6580" },
											grid: { color: "rgba(255, 255, 255, 0.05)" },
										},
									},
								}}
							/>
						) : (
							<p className="text-[var(--text-muted)] text-center py-8">Sem dados suficientes</p>
						)}
					</div>
				</div>

				<div className="glass rounded-2xl p-6 mb-8">
					<h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
						Detalhamento por Categoria
					</h2>
					{categoryAnalysis.length > 0 ? (
						<div className="space-y-4">
							{categoryAnalysis.map((cat, index) => {
								const percentage = (cat.total / totalExpenses) * 100;
								return (
									<div key={cat.category}>
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-3">
												<span className="text-2xl">{index === 0 ? "👑" : "📁"}</span>
												<div>
													<p className="font-medium text-[var(--text-primary)]">{cat.category}</p>
													<p className="text-sm text-[var(--text-secondary)]">
														<span className="tabular-nums">{cat.count}</span> transações • Média:{" "}
														<span className="tabular-nums">{formatCurrency(cat.average)}</span>
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-semibold text-[var(--text-primary)] tabular-nums">{formatCurrency(cat.total)}</p>
												<p className="text-sm text-[var(--text-muted)] tabular-nums">{percentage.toFixed(1)}%</p>
											</div>
										</div>
										<div className="w-full bg-white/5 rounded-full h-2">
											<div
												className="bg-gradient-to-r from-violet-500 to-purple-400 h-2 rounded-full transition-all"
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-[var(--text-muted)] text-center py-8">Nenhuma categoria de despesa encontrada</p>
					)}
				</div>

				<div className="glass rounded-2xl p-6">
					<h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Maiores Despesas</h2>
					{topExpenses.length > 0 ? (
						<div className="space-y-2">
							{topExpenses.map((t, index) => (
								<div
									key={t.id}
									className="flex items-center justify-between p-4 rounded-lg hover:bg-white/[0.03] transition-all border border-[var(--border-glass)] hover:border-[var(--border-glass)]"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center font-bold text-purple-400 border border-purple-500/30">
											{index + 1}
										</div>
										<div>
											<p className="font-medium text-[var(--text-primary)]">{t.description}</p>
											<p className="text-sm text-[var(--text-secondary)]">
												{new Date(t.date).toLocaleDateString("pt-BR")} • {t.category}
											</p>
										</div>
									</div>
									<p className="font-semibold text-pink-400 text-lg tabular-nums">{formatCurrency(t.amount)}</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-[var(--text-muted)] text-center py-8">Nenhuma despesa encontrada</p>
					)}
				</div>
			</div>
		</div>
	);
}
