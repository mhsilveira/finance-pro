"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/services/api";
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
					<p className="text-gray-600 font-medium">Carregando dashboard...</p>
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
						Dashboard
					</h1>
					<p className="mt-2 text-gray-600">
						Visão geral das suas finanças
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Total</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">
									{transactions.length}
								</p>
								<p className="text-xs text-gray-500 mt-1">transações</p>
							</div>
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
								<span className="text-2xl">💳</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Receitas</p>
								<p className="text-2xl font-bold text-green-600 mt-1">
									{formatCurrency(income)}
								</p>
								<p className="text-xs text-gray-500 mt-1">no período</p>
							</div>
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
								<span className="text-2xl">📈</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Despesas</p>
								<p className="text-2xl font-bold text-red-600 mt-1">
									{formatCurrency(expense)}
								</p>
								<p className="text-xs text-gray-500 mt-1">no período</p>
							</div>
							<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
								<span className="text-2xl">📉</span>
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-white/90">Saldo</p>
								<p className="text-2xl font-bold text-white mt-1">
									{formatCurrency(balance)}
								</p>
								<p className="text-xs text-white/80 mt-1">disponível</p>
							</div>
							<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
								<span className="text-2xl">💰</span>
							</div>
						</div>
					</div>
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Monthly Trends */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
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

					{/* Category Breakdown */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
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
												},
											},
										}}
									/>
								</div>
							</div>
						) : (
							<p className="text-gray-500 text-center py-8">
								Sem despesas registradas
							</p>
						)}
					</div>
				</div>

				{/* Recent Transactions */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-lg font-semibold text-gray-900">
							Transações Recentes
						</h2>
						<Link
							href="/transactions"
							className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
						>
							Ver todas →
						</Link>
					</div>

					{recentTransactions.length > 0 ? (
						<div className="space-y-3">
							{recentTransactions.map((t) => (
								<div
									key={t.id}
									className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
								>
									<div className="flex items-center gap-3">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center ${
												t.type === "income"
													? "bg-green-100"
													: "bg-red-100"
											}`}
										>
											<span className="text-lg">
												{t.type === "income" ? "📈" : "📉"}
											</span>
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
									<p
										className={`font-semibold ${
											t.type === "income"
												? "text-green-600"
												: "text-red-600"
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
							<p className="text-gray-500 mb-4">
								Nenhuma transação registrada
							</p>
							<Link
								href="/transactions"
								className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
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
