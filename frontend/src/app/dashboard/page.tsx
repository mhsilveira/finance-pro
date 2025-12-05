"use client";

import { useEffect, useState } from "react";
import { getAllTransactions } from "@/services/api";
import type { Transaction } from "@/types/transaction";
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

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
);

export default function DashboardPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const userId = "blanchimaah";

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				setLoading(true);
				setError("");
				const data = await getAllTransactions(userId);
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

	// Calculate stats
	const income = transactions
		.filter((t) => t.type === "income")
		.reduce((sum, t) => sum + t.amount, 0);

	const expense = transactions
		.filter((t) => t.type === "expense")
		.reduce((sum, t) => sum + t.amount, 0);

	const balance = income - expense;

	// Get recent transactions (last 5)
	const recentTransactions = [...transactions]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	// Calculate monthly trends (last 6 months)
	const getMonthlyData = () => {
		const monthlyMap = new Map<
			string,
			{ income: number; expense: number }
		>();

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

	// Category breakdown for expenses
	const getCategoryData = () => {
		const categoryMap = new Map<string, number>();

		transactions
			.filter((t) => t.type === "expense")
			.forEach((t) => {
				const category = t.category || "Outros";
				categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
			});

		const sorted = Array.from(categoryMap.entries()).sort(
			(a, b) => b[1] - a[1],
		);

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
				borderColor: "rgb(34, 197, 94)",
				backgroundColor: "rgba(34, 197, 94, 0.1)",
				tension: 0.4,
			},
			{
				label: "Despesas",
				data: monthlyData.expenses,
				borderColor: "rgb(239, 68, 68)",
				backgroundColor: "rgba(239, 68, 68, 0.1)",
				tension: 0.4,
			},
		],
	};

	const doughnutChartData = {
		labels: categoryData.labels,
		datasets: [
			{
				data: categoryData.values,
				backgroundColor: [
					"rgba(59, 130, 246, 0.8)",
					"rgba(147, 51, 234, 0.8)",
					"rgba(236, 72, 153, 0.8)",
					"rgba(245, 158, 11, 0.8)",
					"rgba(34, 197, 94, 0.8)",
					"rgba(239, 68, 68, 0.8)",
					"rgba(156, 163, 175, 0.8)",
				],
				borderWidth: 0,
			},
		],
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-950 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4" />
					<p className="text-gray-400 font-medium">Carregando dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
				<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-md">
					<h3 className="text-xl font-semibold text-red-400 mb-2">
						Erro ao carregar dados
					</h3>
					<p className="text-red-300">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950 pt-4">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-100">
						Dashboard
					</h1>
					<p className="mt-2 text-gray-400">
						Visão geral das suas finanças
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total</p>
								<p className="text-2xl font-semibold text-gray-100 mt-2 tabular-nums">
									{transactions.length}
								</p>
								<p className="text-xs text-gray-500 mt-1">transações</p>
							</div>
							<div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
								<span className="text-2xl">💳</span>
							</div>
						</div>
					</div>

					<div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-green-500/30 transition-all">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Receitas</p>
								<p className="text-2xl font-semibold text-green-400 mt-2 tabular-nums">
									{formatCurrency(income)}
								</p>
								<p className="text-xs text-gray-500 mt-1">no período</p>
							</div>
							<div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
								<span className="text-2xl">📈</span>
							</div>
						</div>
					</div>

					<div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-red-500/30 transition-all">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Despesas</p>
								<p className="text-2xl font-semibold text-red-400 mt-2 tabular-nums">
									{formatCurrency(expense)}
								</p>
								<p className="text-xs text-gray-500 mt-1">no período</p>
							</div>
							<div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
								<span className="text-2xl">📉</span>
							</div>
						</div>
					</div>

					<div className="bg-slate-900 border border-yellow-500/50 rounded-lg p-6 hover:border-yellow-500 transition-all relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
						<div className="relative flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-yellow-400 uppercase tracking-wide">Saldo</p>
								<p className="text-2xl font-semibold text-gray-100 mt-2 tabular-nums">
									{formatCurrency(balance)}
								</p>
								<p className="text-xs text-gray-400 mt-1">disponível</p>
							</div>
							<div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
								<span className="text-2xl">💰</span>
							</div>
						</div>
					</div>
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Monthly Trends */}
					<div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
						<h2 className="text-lg font-semibold text-gray-100 mb-6 uppercase tracking-wide">
							Tendência Mensal
						</h2>
						{monthlyData.labels.length > 0 ? (
							<Line
								data={lineChartData}
								options={{
									responsive: true,
									plugins: {
										legend: {
											position: "bottom",
											labels: {
												color: '#9CA3AF',
												font: {
													size: 12
												}
											}
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: '#6B7280' },
											grid: { color: 'rgba(71, 85, 105, 0.3)' }
										},
										x: {
											ticks: { color: '#6B7280' },
											grid: { color: 'rgba(71, 85, 105, 0.3)' }
										}
									},
								}}
							/>
						) : (
							<p className="text-gray-400 text-center py-8">
								Sem dados suficientes
							</p>
						)}
					</div>

					{/* Category Breakdown */}
					<div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
						<h2 className="text-lg font-semibold text-gray-100 mb-6 uppercase tracking-wide">
							Despesas por Categoria
						</h2>
						{categoryData.labels.length > 0 ? (
							<div className="flex justify-center">
								<div className="w-64 h-64">
									<Doughnut
										data={doughnutChartData}
										options={{
											responsive: true,
											maintainAspectRatio: true,
											plugins: {
												legend: {
													position: "bottom",
													labels: {
														color: '#9CA3AF',
														font: {
															size: 11
														}
													}
												},
											},
										}}
									/>
								</div>
							</div>
						) : (
							<p className="text-gray-400 text-center py-8">
								Sem despesas registradas
							</p>
						)}
					</div>
				</div>

				{/* Recent Transactions */}
				<div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
							Transações Recentes
						</h2>
						<Link
							href="/transactions"
							className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
						>
							Ver todas →
						</Link>
					</div>

					{recentTransactions.length > 0 ? (
						<div className="space-y-2">
							{recentTransactions.map((t) => (
								<div
									key={t.id}
									className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/50 transition-all border border-slate-800 hover:border-slate-700"
								>
									<div className="flex items-center gap-3">
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center ${
												t.type === "income"
													? "bg-green-500/10"
													: "bg-red-500/10"
											}`}
										>
											<span className="text-lg">
												{t.type === "income" ? "📈" : "📉"}
											</span>
										</div>
										<div>
											<p className="font-medium text-gray-100">
												{t.description}
											</p>
											<p className="text-sm text-gray-400">
												{new Date(t.date).toLocaleDateString("pt-BR")} •{" "}
												{t.category}
											</p>
										</div>
									</div>
									<p
										className={`font-semibold tabular-nums ${
											t.type === "income"
												? "text-green-400"
												: "text-red-400"
										}`}
									>
										{t.type === "income" ? "+" : "-"}
										{formatCurrency(t.amount)}
									</p>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-gray-400 mb-4">
								Nenhuma transação registrada
							</p>
							<Link
								href="/transactions"
								className="inline-block px-6 py-3 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold"
							>
								Adicionar Transação
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
