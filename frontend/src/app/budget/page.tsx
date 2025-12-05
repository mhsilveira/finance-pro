"use client";

import { useEffect, useState } from "react";
import { useAllTransactions } from "@/hooks/useTransactions";

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
	const [budgets, setBudgets] = useState<Budget[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [showBudgetModal, setShowBudgetModal] = useState(false);
	const [showGoalModal, setShowGoalModal] = useState(false);

	const userId = "blanchimaah";

	const { data: transactions = [], isLoading: loading, error: queryError } = useAllTransactions(userId);
	const error = queryError ? (queryError as Error).message : "";

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
			<div className="min-h-screen bg-slate-950 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4" />
					<p className="text-gray-400 font-medium">Carregando orçamentos...</p>
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
						Orçamento e Metas
					</h1>
					<p className="mt-2 text-gray-400">
						Defina limites e alcance seus objetivos financeiros
					</p>
				</div>

				{/* Budgets Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-gray-100 uppercase tracking-wide">
							Orçamentos Mensais
						</h2>
						<button
							onClick={() => setShowBudgetModal(true)}
							className="px-4 py-2 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20"
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
									className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all"
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-gray-100 uppercase tracking-wide">
											{budget.category}
										</h3>
										<button
											onClick={() => handleRemoveBudget(budget.category)}
											className="text-gray-500 hover:text-red-400 transition-colors"
										>
											✕
										</button>
									</div>

									<div className="mb-3">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-gray-400 tabular-nums">
												{formatCurrency(spent)} / {formatCurrency(budget.limit)}
											</span>
											<span
												className={`text-sm font-semibold tabular-nums ${
													isOverBudget
														? "text-red-400"
														: isWarning
															? "text-yellow-400"
															: "text-green-400"
												}`}
											>
												{percentage.toFixed(0)}%
											</span>
										</div>
										<div className="w-full bg-slate-800 rounded-full h-3">
											<div
												className={`h-3 rounded-full transition-all ${
													isOverBudget
														? "bg-red-500"
														: isWarning
															? "bg-yellow-500"
															: "bg-gradient-to-r from-green-500 to-green-400"
												}`}
												style={{
													width: `${Math.min(percentage, 100)}%`,
												}}
											/>
										</div>
									</div>

									<div className="flex items-center gap-2 text-sm">
										{isOverBudget ? (
											<span className="text-red-400">⚠️ Acima do limite!</span>
										) : isWarning ? (
											<span className="text-yellow-400">
												⚡ Atenção aos gastos
											</span>
										) : (
											<span className="text-green-400">
												✓ Dentro do orçamento
											</span>
										)}
									</div>
								</div>
							);
						})}

						{budgets.length === 0 && (
							<div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
								<p className="text-gray-400 mb-4">
									Nenhum orçamento definido
								</p>
								<button
									onClick={() => setShowBudgetModal(true)}
									className="px-6 py-3 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20"
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
						<h2 className="text-2xl font-semibold text-gray-100 uppercase tracking-wide">
							Metas Financeiras
						</h2>
						<button
							onClick={() => setShowGoalModal(true)}
							className="px-4 py-2 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20"
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
									className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all"
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<span className="text-2xl">🎯</span>
											<h3 className="font-semibold text-gray-100">
												{goal.name}
											</h3>
										</div>
										<button
											onClick={() => handleRemoveGoal(goal.id)}
											className="text-gray-500 hover:text-red-400 transition-colors"
										>
											✕
										</button>
									</div>

									<div className="mb-4">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-gray-400 uppercase tracking-wide">Progresso</span>
											<span className="text-sm font-semibold text-yellow-400 tabular-nums">
												{percentage.toFixed(0)}%
											</span>
										</div>
										<div className="w-full bg-slate-800 rounded-full h-3">
											<div
												className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
												style={{
													width: `${Math.min(percentage, 100)}%`,
												}}
											/>
										</div>
									</div>

									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-400">Atual:</span>
											<span className="font-semibold text-gray-100 tabular-nums">
												{formatCurrency(goal.current)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Meta:</span>
											<span className="font-semibold text-gray-100 tabular-nums">
												{formatCurrency(goal.target)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Faltam:</span>
											<span className="font-semibold text-gray-100 tabular-nums">
												{formatCurrency(goal.target - goal.current)}
											</span>
										</div>
										<div className="flex justify-between pt-2 border-t border-slate-800">
											<span className="text-gray-400">Prazo:</span>
											<span
												className={`font-semibold tabular-nums ${
													daysLeft < 30 ? "text-red-400" : "text-gray-100"
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
							<div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
								<p className="text-gray-400 mb-4">Nenhuma meta definida</p>
								<button
									onClick={() => setShowGoalModal(true)}
									className="px-6 py-3 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20"
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
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6">
						<h3 className="text-xl font-semibold text-gray-100 mb-4 uppercase tracking-wide">
							Adicionar Orçamento
						</h3>
						<form onSubmit={handleAddBudget} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Categoria
								</label>
								<input
									type="text"
									name="category"
									required
									placeholder="Ex: Alimentação"
									className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 placeholder-gray-500 transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Limite Mensal (R$)
								</label>
								<input
									type="number"
									name="limit"
									required
									step="0.01"
									min="0"
									placeholder="Ex: 1000.00"
									className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 placeholder-gray-500 tabular-nums transition-all"
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowBudgetModal(false)}
									className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-gray-100 rounded-lg hover:bg-slate-700 transition-all font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20"
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
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6">
						<h3 className="text-xl font-semibold text-gray-100 mb-4 uppercase tracking-wide">
							Adicionar Meta
						</h3>
						<form onSubmit={handleAddGoal} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Nome da Meta
								</label>
								<input
									type="text"
									name="name"
									required
									placeholder="Ex: Viagem de férias"
									className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 placeholder-gray-500 transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Valor da Meta (R$)
								</label>
								<input
									type="number"
									name="target"
									required
									step="0.01"
									min="0"
									placeholder="Ex: 5000.00"
									className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 placeholder-gray-500 tabular-nums transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Valor Atual (R$)
								</label>
								<input
									type="number"
									name="current"
									step="0.01"
									min="0"
									placeholder="Ex: 1000.00"
									className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 placeholder-gray-500 tabular-nums transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Prazo
								</label>
								<input
									type="date"
									name="deadline"
									required
									className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 transition-all"
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowGoalModal(false)}
									className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-gray-100 rounded-lg hover:bg-slate-700 transition-all font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20"
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
