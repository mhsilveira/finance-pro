"use client";

import Link from "next/link";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useAllTransactions } from "@/hooks/useTransactions";
import { SpendingInsights } from "@/components/SpendingInsights";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardPage() {
	const userId = "blanchimaah";

	const { data: transactions = [], isLoading: loading, error: queryError } = useAllTransactions(userId);
	const error = queryError ? (queryError as Error).message : "";

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

	const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

	const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

	const now = new Date();
	const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	const currentMonthTransactions = transactions.filter((t) => {
		const tMonth = t.monthYear || t.date.substring(0, 7);
		return tMonth === currentMonth;
	});

	const currentMonthIncome = currentMonthTransactions
		.filter((t) => t.type === "income")
		.reduce((sum, t) => sum + t.amount, 0);

	const currentMonthExpense = currentMonthTransactions
		.filter((t) => t.type === "expense")
		.reduce((sum, t) => sum + t.amount, 0);

	const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
	const prevMonthTransactions = transactions.filter((t) => {
		const tMonth = t.monthYear || t.date.substring(0, 7);
		return tMonth === prevMonth;
	});

	const prevMonthExpense = prevMonthTransactions
		.filter((t) => t.type === "expense")
		.reduce((sum, t) => sum + t.amount, 0);

	const expenseChange = prevMonthExpense > 0 ? ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100 : 0;

	const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
	const currentDay = now.getDate();
	const avgDailyExpense = currentDay > 0 ? currentMonthExpense / currentDay : 0;

	const currentMonthExpenses = currentMonthTransactions.filter((t) => t.type === "expense");
	const categoryTotals = new Map<string, number>();
	currentMonthExpenses.forEach((t) => {
		const cat = t.category || "Outros";
		categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + t.amount);
	});
	const topCategory = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0];

	const FIXED_COST_CATEGORIES = ["Contas", "Assinaturas", "Aluguel"];
	const fixedCosts = currentMonthExpenses
		.filter((t) => FIXED_COST_CATEGORIES.includes(t.category))
		.reduce((sum, t) => sum + t.amount, 0);

	const recentTransactions = [...transactions]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	const getMonthlyData = () => {
		const monthlyMap = new Map<string, { income: number; expense: number }>();

		transactions.forEach((t) => {
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

		const sorted = Array.from(monthlyMap.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.slice(-6);

		return {
			labels: sorted.map(([month]) => {
				const [year, m] = month.split("-");
				return `${m}/${year}`;
			}),
			incomes: sorted.map(([, data]) => data.income),
			expenses: sorted.map(([, data]) => data.expense),
		};
	};

	const monthlyData = getMonthlyData();

	const getCategoryData = () => {
		const categoryMap = new Map<string, number>();

		transactions
			.filter((t) => t.type === "expense")
			.forEach((t) => {
				const category = t.category || "Outros";
				categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
			});

		const sorted = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

		return {
			labels: sorted.map(([cat]) => cat),
			values: sorted.map(([, val]) => val),
		};
	};

	const categoryData = getCategoryData();

	const lineChartData = {
		labels: monthlyData.labels,
		datasets: [
			{
				label: "Receitas",
				data: monthlyData.incomes,
				borderColor: "#34d399",
				backgroundColor: "rgba(52, 211, 153, 0.1)",
				tension: 0.4,
				fill: true,
			},
			{
				label: "Despesas",
				data: monthlyData.expenses,
				borderColor: "#f472b6",
				backgroundColor: "rgba(244, 114, 182, 0.1)",
				tension: 0.4,
				fill: true,
			},
		],
	};

	const doughnutChartData = {
		labels: categoryData.labels,
		datasets: [
			{
				data: categoryData.values,
				backgroundColor: [
					"#8b5cf6",
					"#f472b6",
					"#34d399",
					"#60a5fa",
					"#fbbf24",
					"#a78bfa",
					"#6b6580",
				],
				borderWidth: 0,
			},
		],
	};

	const lineChartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: {
					color: "var(--text-secondary)",
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
	};

	const doughnutChartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: {
					color: "#a8a3b8",
					font: { size: 11 },
				},
			},
		},
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--accent-primary)] mx-auto mb-4" />
					<p className="text-[var(--text-secondary)] font-medium">Carregando dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-8 max-w-md">
					<h3 className="text-xl font-semibold text-pink-400 mb-2">Erro ao carregar dados</h3>
					<p className="text-pink-300">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen animate-fade-in">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
					<p className="mt-2 text-[var(--text-secondary)]">Visão geral das suas finanças</p>
				</div>

				{/* Hero row: magazine grid on lg, stacked on mobile */}
				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
					{/* Hero chart - line chart */}
					<div className="glass p-6 order-2 lg:order-1">
						<h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Tendência Mensal</h2>
						{monthlyData.labels.length > 0 ? (
							<Line data={lineChartData} options={lineChartOptions} />
						) : (
							<p className="text-[var(--text-secondary)] text-center py-8">Sem dados suficientes</p>
						)}
					</div>

					{/* Metrics 2x2 grid */}
					<div className="grid grid-cols-2 gap-4 order-1 lg:order-2">
						{/* Total Transações */}
						<div className="glass glass-hover p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-[var(--text-muted)]">Total</p>
									<p className="text-xl font-semibold text-[var(--text-primary)] mt-1 tabular-nums">
										{transactions.length}
									</p>
									<p className="text-xs text-[var(--text-muted)] mt-1">transações</p>
								</div>
								<div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
									<span className="text-lg">💳</span>
								</div>
							</div>
						</div>

						{/* Receitas */}
						<div className="glass glass-hover p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-[var(--text-muted)]">Receitas</p>
									<p className="text-xl font-semibold text-emerald-400 mt-1 tabular-nums">
										{formatCurrency(income)}
									</p>
									<p className="text-xs text-[var(--text-muted)] mt-1">no período</p>
								</div>
								<div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
									<span className="text-lg">📈</span>
								</div>
							</div>
						</div>

						{/* Despesas */}
						<div className="glass glass-hover p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-[var(--text-muted)]">Despesas</p>
									<p className="text-xl font-semibold text-pink-400 mt-1 tabular-nums">
										{formatCurrency(expense)}
									</p>
									<p className="text-xs text-[var(--text-muted)] mt-1">no período</p>
								</div>
								<div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
									<span className="text-lg">📉</span>
								</div>
							</div>
						</div>

						{/* Maior Gasto - highlighted card */}
						<div className="glass glass-hover p-4 border-[var(--border-accent)] relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
							<div className="relative flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-purple-400">Maior Gasto</p>
									<p className="text-xl font-semibold text-[var(--text-primary)] mt-1 tabular-nums">
										{topCategory ? formatCurrency(topCategory[1]) : "—"}
									</p>
									<p className="text-xs text-[var(--text-muted)] mt-1">
										{topCategory ? topCategory[0] : "sem dados"}
									</p>
								</div>
								<div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
									<span className="text-lg">👑</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Secondary metrics row */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{/* Taxa de Economia */}
					<div className="glass glass-hover p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-[var(--text-muted)]">Taxa de Economia</p>
								<p
									className={`text-xl font-semibold mt-1 tabular-nums ${savingsRate >= 0 ? "text-blue-400" : "text-pink-400"}`}
								>
									{savingsRate.toFixed(1)}%
								</p>
								<p className="text-xs text-[var(--text-muted)] mt-1">do total de receitas</p>
							</div>
							<div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
								<span className="text-lg">🎯</span>
							</div>
						</div>
					</div>

					{/* Despesas do Mês */}
					<div className="glass glass-hover p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-[var(--text-muted)]">Despesas do Mês</p>
								<p className="text-xl font-semibold text-purple-400 mt-1 tabular-nums">
									{formatCurrency(currentMonthExpense)}
								</p>
								{expenseChange !== 0 && (
									<p className={`text-xs mt-1 ${expenseChange > 0 ? "text-pink-400" : "text-emerald-400"}`}>
										{expenseChange > 0 ? "↑" : "↓"} {Math.abs(expenseChange).toFixed(1)}% vs mês anterior
									</p>
								)}
							</div>
							<div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
								<span className="text-lg">📊</span>
							</div>
						</div>
					</div>

					{/* Média Diária */}
					<div className="glass glass-hover p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-[var(--text-muted)]">Média Diária</p>
								<p className="text-xl font-semibold text-cyan-400 mt-1 tabular-nums">
									{formatCurrency(avgDailyExpense)}
								</p>
								<p className="text-xs text-[var(--text-muted)] mt-1">em {currentDay} dias do mês</p>
							</div>
							<div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
								<span className="text-lg">📅</span>
							</div>
						</div>
					</div>

					{/* Gastos Fixos */}
					<div className="glass glass-hover p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-[var(--text-muted)]">Gastos Fixos</p>
								<p className="text-xl font-semibold text-orange-400 mt-1 tabular-nums">
									{formatCurrency(fixedCosts)}
								</p>
								<p className="text-xs text-[var(--text-muted)] mt-1">contas, assinaturas, aluguel</p>
							</div>
							<div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
								<span className="text-lg">📌</span>
							</div>
						</div>
					</div>
				</div>

				{/* Third row: category doughnut + recent transactions */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Doughnut chart */}
					<div className="glass p-6">
						<h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Despesas por Categoria</h2>
						{categoryData.labels.length > 0 ? (
							<div className="flex justify-center">
								<div className="w-64 h-64">
									<Doughnut data={doughnutChartData} options={doughnutChartOptions} />
								</div>
							</div>
						) : (
							<p className="text-[var(--text-secondary)] text-center py-8">Sem despesas registradas</p>
						)}
					</div>

					{/* Recent transactions */}
					<div className="glass p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">Transações Recentes</h2>
							<Link
								href="/transactions"
								className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
							>
								Ver todas →
							</Link>
						</div>

						{recentTransactions.length > 0 ? (
							<div className="space-y-2">
								{recentTransactions.map((t) => (
									<div
										key={t.id}
										className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-all border border-[var(--border-glass)] hover:border-[var(--border-glass-hover)]"
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-10 h-10 rounded-xl flex items-center justify-center ${
													t.type === "income" ? "bg-emerald-500/10" : "bg-pink-500/10"
												}`}
											>
												<span className="text-lg">{t.type === "income" ? "📈" : "📉"}</span>
											</div>
											<div>
												<p className="font-medium text-[var(--text-primary)]">{t.description}</p>
												<p className="text-sm text-[var(--text-secondary)]">
													{new Date(t.date).toLocaleDateString("pt-BR")} • {t.category}
												</p>
											</div>
										</div>
										<p
											className={`font-semibold tabular-nums ${t.type === "income" ? "text-emerald-400" : "text-pink-400"}`}
										>
											{t.type === "income" ? "+" : "-"}
											{formatCurrency(t.amount)}
										</p>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-[var(--text-secondary)] mb-4">Nenhuma transação registrada</p>
								<Link
									href="/transactions"
									className="inline-block px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl shadow-[0_0_20px_var(--accent-glow)] hover:opacity-90 transition-all font-semibold"
								>
									Adicionar Transação
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Fourth row: AI Insights */}
				<div className="mb-8">
					<SpendingInsights userId={userId} currentMonth={currentMonth} />
				</div>
			</div>
		</div>
	);
}
