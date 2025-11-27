"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/services/api";
import type { Transaction } from "@/types/transaction";

interface Budget {
	category: string;
	limit: number;
}

interface Goal {
	id: string;
	name: string;
	target: number;
	current: number;
	deadline: string;
}

export default function BudgetPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [budgets, setBudgets] = useState<Budget[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [showBudgetModal, setShowBudgetModal] = useState(false);
	const [showGoalModal, setShowGoalModal] = useState(false);

	const userId = "blanchimaah";

	// Load budgets and goals from localStorage
	useEffect(() => {
		const savedBudgets = localStorage.getItem("budgets");
		const savedGoals = localStorage.getItem("goals");

		if (savedBudgets) {
			setBudgets(JSON.parse(savedBudgets));
		} else {
			// Default budgets
			const defaultBudgets: Budget[] = [
				{ category: "Alimentação", limit: 1000 },
				{ category: "Transporte", limit: 500 },
				{ category: "Contas", limit: 800 },
			];
			setBudgets(defaultBudgets);
			localStorage.setItem("budgets", JSON.stringify(defaultBudgets));
		}

		if (savedGoals) {
			setGoals(JSON.parse(savedGoals));
		}
	}, []);

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

	// Get current month expenses by category
	const getCurrentMonthExpenses = () => {
		const now = new Date();
		const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

		const categoryMap = new Map<string, number>();

		transactions
			.filter((t) => {
				const monthYear = t.monthYear || t.date.substring(0, 7);
				return t.type === "expense" && monthYear === currentMonth;
			})
			.forEach((t) => {
				const category = t.category || "Outros";
				categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
			});

		return categoryMap;
	};

	const currentExpenses = getCurrentMonthExpenses();

	const handleAddBudget = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const category = formData.get("category") as string;
		const limit = Number.parseFloat(formData.get("limit") as string);

		const newBudgets = [...budgets, { category, limit }];
		setBudgets(newBudgets);
		localStorage.setItem("budgets", JSON.stringify(newBudgets));
		setShowBudgetModal(false);
		e.currentTarget.reset();
	};

	const handleRemoveBudget = (category: string) => {
		const newBudgets = budgets.filter((b) => b.category !== category);
		setBudgets(newBudgets);
		localStorage.setItem("budgets", JSON.stringify(newBudgets));
	};

	const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const goal: Goal = {
			id: Date.now().toString(),
			name: formData.get("name") as string,
			target: Number.parseFloat(formData.get("target") as string),
			current: Number.parseFloat(formData.get("current") as string) || 0,
			deadline: formData.get("deadline") as string,
		};

		const newGoals = [...goals, goal];
		setGoals(newGoals);
		localStorage.setItem("goals", JSON.stringify(newGoals));
		setShowGoalModal(false);
		e.currentTarget.reset();
	};

	const handleRemoveGoal = (id: string) => {
		const newGoals = goals.filter((g) => g.id !== id);
		setGoals(newGoals);
		localStorage.setItem("goals", JSON.stringify(newGoals));
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
					<p className="text-gray-600 font-medium">Carregando orçamentos...</p>
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
						Orçamento e Metas
					</h1>
					<p className="mt-2 text-gray-600">
						Defina limites e alcance seus objetivos financeiros
					</p>
				</div>

				{/* Budgets Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-gray-900">
							Orçamentos Mensais
						</h2>
						<button
							onClick={() => setShowBudgetModal(true)}
							className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
						>
							+ Adicionar Orçamento
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{budgets.map((budget) => {
							const spent = currentExpenses.get(budget.category) || 0;
							const percentage = (spent / budget.limit) * 100;
							const isOverBudget = percentage > 100;
							const isWarning = percentage > 80 && percentage <= 100;

							return (
								<div
									key={budget.category}
									className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-gray-900">
											{budget.category}
										</h3>
										<button
											onClick={() => handleRemoveBudget(budget.category)}
											className="text-gray-400 hover:text-red-500 transition-colors"
										>
											✕
										</button>
									</div>

									<div className="mb-3">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-gray-600">
												{formatCurrency(spent)} / {formatCurrency(budget.limit)}
											</span>
											<span
												className={`text-sm font-semibold ${
													isOverBudget
														? "text-red-600"
														: isWarning
															? "text-yellow-600"
															: "text-green-600"
												}`}
											>
												{percentage.toFixed(0)}%
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-3">
											<div
												className={`h-3 rounded-full transition-all ${
													isOverBudget
														? "bg-red-500"
														: isWarning
															? "bg-yellow-500"
															: "bg-gradient-to-r from-green-500 to-green-600"
												}`}
												style={{
													width: `${Math.min(percentage, 100)}%`,
												}}
											/>
										</div>
									</div>

									<div className="flex items-center gap-2 text-sm">
										{isOverBudget ? (
											<span className="text-red-600">⚠️ Acima do limite!</span>
										) : isWarning ? (
											<span className="text-yellow-600">
												⚡ Atenção aos gastos
											</span>
										) : (
											<span className="text-green-600">
												✓ Dentro do orçamento
											</span>
										)}
									</div>
								</div>
							);
						})}

						{budgets.length === 0 && (
							<div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
								<p className="text-gray-500 mb-4">
									Nenhum orçamento definido
								</p>
								<button
									onClick={() => setShowBudgetModal(true)}
									className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
								>
									Criar Primeiro Orçamento
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Goals Section */}
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-gray-900">
							Metas Financeiras
						</h2>
						<button
							onClick={() => setShowGoalModal(true)}
							className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
						>
							+ Adicionar Meta
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{goals.map((goal) => {
							const percentage = (goal.current / goal.target) * 100;
							const daysLeft = Math.ceil(
								(new Date(goal.deadline).getTime() - Date.now()) /
									(1000 * 60 * 60 * 24),
							);

							return (
								<div
									key={goal.id}
									className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<span className="text-2xl">🎯</span>
											<h3 className="font-semibold text-gray-900">
												{goal.name}
											</h3>
										</div>
										<button
											onClick={() => handleRemoveGoal(goal.id)}
											className="text-gray-400 hover:text-red-500 transition-colors"
										>
											✕
										</button>
									</div>

									<div className="mb-4">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-gray-600">Progresso</span>
											<span className="text-sm font-semibold text-blue-600">
												{percentage.toFixed(0)}%
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-3">
											<div
												className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
												style={{
													width: `${Math.min(percentage, 100)}%`,
												}}
											/>
										</div>
									</div>

									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-600">Atual:</span>
											<span className="font-semibold">
												{formatCurrency(goal.current)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Meta:</span>
											<span className="font-semibold">
												{formatCurrency(goal.target)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Faltam:</span>
											<span className="font-semibold">
												{formatCurrency(goal.target - goal.current)}
											</span>
										</div>
										<div className="flex justify-between pt-2 border-t border-gray-100">
											<span className="text-gray-600">Prazo:</span>
											<span
												className={`font-semibold ${
													daysLeft < 30 ? "text-red-600" : "text-gray-900"
												}`}
											>
												{daysLeft > 0
													? `${daysLeft} dias`
													: "Prazo expirado"}
											</span>
										</div>
									</div>
								</div>
							);
						})}

						{goals.length === 0 && (
							<div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
								<p className="text-gray-500 mb-4">Nenhuma meta definida</p>
								<button
									onClick={() => setShowGoalModal(true)}
									className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
								>
									Criar Primeira Meta
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Budget Modal */}
			{showBudgetModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							Adicionar Orçamento
						</h3>
						<form onSubmit={handleAddBudget} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Categoria
								</label>
								<input
									type="text"
									name="category"
									required
									placeholder="Ex: Alimentação"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Limite Mensal (R$)
								</label>
								<input
									type="number"
									name="limit"
									required
									step="0.01"
									min="0"
									placeholder="Ex: 1000.00"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowBudgetModal(false)}
									className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
								>
									Adicionar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Goal Modal */}
			{showGoalModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							Adicionar Meta
						</h3>
						<form onSubmit={handleAddGoal} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nome da Meta
								</label>
								<input
									type="text"
									name="name"
									required
									placeholder="Ex: Viagem de férias"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Valor da Meta (R$)
								</label>
								<input
									type="number"
									name="target"
									required
									step="0.01"
									min="0"
									placeholder="Ex: 5000.00"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Valor Atual (R$)
								</label>
								<input
									type="number"
									name="current"
									step="0.01"
									min="0"
									placeholder="Ex: 1000.00"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Prazo
								</label>
								<input
									type="date"
									name="deadline"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowGoalModal(false)}
									className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
								>
									Adicionar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
