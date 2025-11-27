"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/services/api";
import type { Transaction } from "@/types/transaction";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
);

export default function AnalyticsPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedPeriod, setSelectedPeriod] = useState<"all" | "month" | "quarter">("all");

	const userId = "blanchimaah";

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				setLoading(true);
				setError("");
				const data = await getTransactions(userId);
				setTransactions(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Erro ao carregar dados");
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();
	}, []);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	// Filter transactions by period
	const getFilteredTransactions = () => {
		const now = new Date();

		if (selectedPeriod === "month") {
			const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
			return transactions.filter(t => new Date(t.date) >= monthAgo);
		}

		if (selectedPeriod === "quarter") {
			const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
			return transactions.filter(t => new Date(t.date) >= quarterAgo);
		}

		return transactions;
	};

	const filteredTransactions = getFilteredTransactions();

	// Category analysis
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

	// Top expenses
	const topExpenses = [...filteredTransactions]
		.filter((t) => t.type === "expense")
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 10);

	// Monthly comparison
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

	// Calculate totals
	const totalExpenses = filteredTransactions
		.filter((t) => t.type === "expense")
		.reduce((sum, t) => sum + t.amount, 0);

	const totalIncome = filteredTransactions
		.filter((t) => t.type === "income")
		.reduce((sum, t) => sum + t.amount, 0);

	const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

	// Chart data
	const categoryChartData = {
		labels: categoryAnalysis.map((c) => c.category),
		datasets: [
			{
				label: "Gastos por Categoria",
				data: categoryAnalysis.map((c) => c.total),
				backgroundColor: [
					"rgba(59, 130, 246, 0.8)",
					"rgba(147, 51, 234, 0.8)",
					"rgba(236, 72, 153, 0.8)",
					"rgba(245, 158, 11, 0.8)",
					"rgba(34, 197, 94, 0.8)",
					"rgba(239, 68, 68, 0.8)",
					"rgba(156, 163, 175, 0.8)",
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
				backgroundColor: "rgba(34, 197, 94, 0.8)",
			},
			{
				label: "Despesas",
				data: monthlyComparison.map(([, data]) => data.expense),
				backgroundColor: "rgba(239, 68, 68, 0.8)",
			},
		],
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
					<p className="text-gray-600 font-medium">Carregando análises...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
					<h3 className="text-xl font-semibold text-red-800 mb-2">
						Erro ao carregar dados
					</h3>
					<p className="text-red-700">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-4">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Análises e Insights
					</h1>
					<p className="mt-2 text-gray-600">
						Entenda melhor seus padrões de gastos
					</p>
				</div>

				{/* Period Filter */}
				<div className="mb-6 flex gap-2">
					<button
						onClick={() => setSelectedPeriod("all")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedPeriod === "all"
								? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
								: "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
						}`}
					>
						Todos
					</button>
					<button
						onClick={() => setSelectedPeriod("month")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedPeriod === "month"
								? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
								: "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
						}`}
					>
						Último Mês
					</button>
					<button
						onClick={() => setSelectedPeriod("quarter")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedPeriod === "quarter"
								? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
								: "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
						}`}
					>
						Último Trimestre
					</button>
				</div>

				{/* Key Metrics */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<p className="text-sm font-medium text-gray-600 mb-2">
							Total em Despesas
						</p>
						<p className="text-3xl font-bold text-red-600">
							{formatCurrency(totalExpenses)}
						</p>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<p className="text-sm font-medium text-gray-600 mb-2">
							Total em Receitas
						</p>
						<p className="text-3xl font-bold text-green-600">
							{formatCurrency(totalIncome)}
						</p>
					</div>

					<div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6">
						<p className="text-sm font-medium text-white/90 mb-2">
							Taxa de Economia
						</p>
						<p className="text-3xl font-bold text-white">
							{savingsRate.toFixed(1)}%
						</p>
					</div>
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Category Breakdown */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
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
										},
									},
								}}
							/>
						) : (
							<p className="text-gray-500 text-center py-8">
								Sem dados de despesas
							</p>
						)}
					</div>

					{/* Monthly Comparison */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Comparação Mensal
						</h2>
						{monthlyComparison.length > 0 ? (
							<Bar
								data={monthlyChartData}
								options={{
									responsive: true,
									plugins: {
										legend: {
											position: "bottom",
										},
									},
									scales: {
										y: {
											beginAtZero: true,
										},
									},
								}}
							/>
						) : (
							<p className="text-gray-500 text-center py-8">
								Sem dados suficientes
							</p>
						)}
					</div>
				</div>

				{/* Category Details */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-6">
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
													<p className="font-medium text-gray-900">
														{cat.category}
													</p>
													<p className="text-sm text-gray-500">
														{cat.count} transações • Média: {formatCurrency(cat.average)}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-semibold text-gray-900">
													{formatCurrency(cat.total)}
												</p>
												<p className="text-sm text-gray-500">
													{percentage.toFixed(1)}%
												</p>
											</div>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-gray-500 text-center py-8">
							Nenhuma categoria de despesa encontrada
						</p>
					)}
				</div>

				{/* Top Expenses */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-6">
						Maiores Despesas
					</h2>
					{topExpenses.length > 0 ? (
						<div className="space-y-3">
							{topExpenses.map((t, index) => (
								<div
									key={t.id}
									className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600">
											{index + 1}
										</div>
										<div>
											<p className="font-medium text-gray-900">
												{t.description}
											</p>
											<p className="text-sm text-gray-500">
												{new Date(t.date).toLocaleDateString("pt-BR")} •{" "}
												{t.category}
											</p>
										</div>
									</div>
									<p className="font-semibold text-red-600 text-lg">
										{formatCurrency(t.amount)}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500 text-center py-8">
							Nenhuma despesa encontrada
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
