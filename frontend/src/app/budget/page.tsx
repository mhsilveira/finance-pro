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

	useEffect(() => {
		const savedBudgets = localStorage.getItem("budgets");
		const savedGoals = localStorage.getItem("goals");

		if (savedBudgets) {
			setBudgets(JSON.parse(savedBudgets));
		} else {
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
				const amount = Math.abs(Number(t.amount) || 0);
				categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
			});

		return categoryMap;
	};

	const currentExpenses = getCurrentMonthExpenses();

	useEffect(() => {
		if (currentExpenses.size > 0) {
			console.log("Current Month Expenses by Category:");
			const expensesData = Array.from(currentExpenses.entries()).map(([category, amount]) => {
				const budget = budgets.find((b) => b.category === category);
				return {
					Category: category,
					Spent: `R$ ${amount.toFixed(2)}`,
					Budget: budget ? `R$ ${budget.limit.toFixed(2)}` : "Sem orçamento",
					Status: budget
						? amount > budget.limit
							? "Acima"
							: amount > budget.limit * 0.8
								? "Atenção"
								: "OK"
						: "N/A",
				};
			});
			console.table(expensesData);
		}
	}, [currentExpenses, budgets]);

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
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--accent-primary)] mx-auto mb-4" />
					<p className="text-[var(--text-muted)] font-medium">Carregando orçamentos...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen animate-fade-in">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-[var(--text-primary)]">Orçamento e Metas</h1>
					<p className="mt-2 text-[var(--text-secondary)]">Defina limites e alcance seus objetivos financeiros</p>
				</div>

				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-[var(--text-primary)]">Orçamentos Mensais</h2>
						<button
							onClick={() => setShowBudgetModal(true)}
							className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all font-semibold shadow-[0_0_20px_var(--accent-glow)]"
						>
							+ Adicionar Orçamento
						</button>
					</div>

					{(() => {
						const categoriesWithoutBudget = Array.from(currentExpenses.keys()).filter(
							(cat) => !budgets.some((b) => b.category === cat),
						);
						if (categoriesWithoutBudget.length > 0) {
							return (
								<div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
									<div className="flex items-start gap-3">
										<span className="text-amber-400 text-xl">⚠️</span>
										<div className="flex-1">
											<p className="text-amber-400 font-semibold mb-2">
												Categorias sem orçamento definido:
											</p>
											<div className="flex flex-wrap gap-2">
												{categoriesWithoutBudget.map((cat) => (
													<span
														key={cat}
														className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium"
													>
														{cat} - {formatCurrency(currentExpenses.get(cat) || 0)}
													</span>
												))}
											</div>
										</div>
									</div>
								</div>
							);
						}
						return null;
					})()}

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{budgets.map((budget) => {
							const spent = currentExpenses.get(budget.category) || 0;
							const percentage = (spent / budget.limit) * 100;
							const isOverBudget = percentage > 100;
							const isWarning = percentage > 80 && percentage <= 100;

							return (
								<div
									key={budget.category}
									className="glass glass-hover rounded-xl p-6"
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-[var(--text-primary)] uppercase tracking-wide">{budget.category}</h3>
										<button
											onClick={() => handleRemoveBudget(budget.category)}
											className="text-[var(--text-muted)] hover:text-pink-400 transition-colors"
										>
											✕
										</button>
									</div>

									<div className="mb-3">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-[var(--text-secondary)] tabular-nums">
												{formatCurrency(spent)} / {formatCurrency(budget.limit)}
											</span>
											<span
												className={`text-sm font-semibold tabular-nums ${
													isOverBudget ? "text-pink-400" : isWarning ? "text-amber-400" : "text-emerald-400"
												}`}
											>
												{percentage.toFixed(0)}%
											</span>
										</div>
										<div className="w-full bg-white/5 rounded-full h-3">
											<div
												className={`h-3 rounded-full transition-all ${
													isOverBudget
														? "bg-gradient-to-r from-pink-500 to-pink-400"
														: isWarning
															? "bg-gradient-to-r from-amber-500 to-amber-400"
															: "bg-gradient-to-r from-emerald-500 to-emerald-400"
												}`}
												style={{
													width: `${Math.min(percentage, 100)}%`,
												}}
											/>
										</div>
									</div>

									<div className="flex items-center gap-2 text-sm">
										{isOverBudget ? (
											<span className="text-pink-400">⚠️ Acima do limite!</span>
										) : isWarning ? (
											<span className="text-amber-400">⚡ Atenção aos gastos</span>
										) : (
											<span className="text-emerald-400">✓ Dentro do orçamento</span>
										)}
									</div>
								</div>
							);
						})}

						{budgets.length === 0 && (
							<div className="col-span-full text-center py-12 glass rounded-xl">
								<p className="text-[var(--text-muted)] mb-4">Nenhum orçamento definido</p>
								<button
									onClick={() => setShowBudgetModal(true)}
									className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all font-semibold shadow-[0_0_20px_var(--accent-glow)]"
								>
									Criar Primeiro Orçamento
								</button>
							</div>
						)}
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-[var(--text-primary)]">Metas Financeiras</h2>
						<button
							onClick={() => setShowGoalModal(true)}
							className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all font-semibold shadow-[0_0_20px_var(--accent-glow)]"
						>
							+ Adicionar Meta
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{goals.map((goal) => {
							const percentage = (goal.current / goal.target) * 100;
							const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

							return (
								<div
									key={goal.id}
									className="glass glass-hover rounded-xl p-6"
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<span className="text-2xl">🎯</span>
											<h3 className="font-semibold text-[var(--text-primary)]">{goal.name}</h3>
										</div>
										<button
											onClick={() => handleRemoveGoal(goal.id)}
											className="text-[var(--text-muted)] hover:text-pink-400 transition-colors"
										>
											✕
										</button>
									</div>

									<div className="mb-4">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-[var(--text-secondary)] uppercase tracking-wide">Progresso</span>
											<span className="text-sm font-semibold text-purple-400 tabular-nums">
												{percentage.toFixed(0)}%
											</span>
										</div>
										<div className="w-full bg-white/5 rounded-full h-3">
											<div
												className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all"
												style={{
													width: `${Math.min(percentage, 100)}%`,
												}}
											/>
										</div>
									</div>

									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-[var(--text-secondary)]">Atual:</span>
											<span className="font-semibold text-[var(--text-primary)] tabular-nums">{formatCurrency(goal.current)}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-[var(--text-secondary)]">Meta:</span>
											<span className="font-semibold text-[var(--text-primary)] tabular-nums">{formatCurrency(goal.target)}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-[var(--text-secondary)]">Faltam:</span>
											<span className="font-semibold text-[var(--text-primary)] tabular-nums">
												{formatCurrency(goal.target - goal.current)}
											</span>
										</div>
										<div className="flex justify-between pt-2 border-t border-[var(--border-glass)]">
											<span className="text-[var(--text-secondary)]">Prazo:</span>
											<span
												className={`font-semibold tabular-nums ${daysLeft < 30 ? "text-pink-400" : "text-[var(--text-primary)]"}`}
											>
												{daysLeft > 0 ? `${daysLeft} dias` : "Prazo expirado"}
											</span>
										</div>
									</div>
								</div>
							);
						})}

						{goals.length === 0 && (
							<div className="col-span-full text-center py-12 glass rounded-xl">
								<p className="text-[var(--text-muted)] mb-4">Nenhuma meta definida</p>
								<button
									onClick={() => setShowGoalModal(true)}
									className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all font-semibold shadow-[0_0_20px_var(--accent-glow)]"
								>
									Criar Primeira Meta
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{showBudgetModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="glass-elevated rounded-[20px] shadow-2xl border border-[var(--border-glass)] max-w-md w-full p-6">
						<h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Adicionar Orçamento</h3>
						<form onSubmit={handleAddBudget} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Categoria
								</label>
								<input
									type="text"
									name="category"
									required
									placeholder="Ex: Alimentação"
									className="w-full px-4 py-2 bg-[rgba(0,0,0,0.3)] border border-[var(--border-glass)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Limite Mensal (R$)
								</label>
								<input
									type="number"
									name="limit"
									required
									step="0.01"
									min="0"
									placeholder="Ex: 1000.00"
									className="w-full px-4 py-2 bg-[rgba(0,0,0,0.3)] border border-[var(--border-glass)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)] placeholder-[var(--text-muted)] tabular-nums transition-all"
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowBudgetModal(false)}
									className="flex-1 px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all font-semibold shadow-[0_0_20px_var(--accent-glow)]"
								>
									Adicionar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showGoalModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="glass-elevated rounded-[20px] shadow-2xl border border-[var(--border-glass)] max-w-md w-full p-6">
						<h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Adicionar Meta</h3>
						<form onSubmit={handleAddGoal} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Nome da Meta
								</label>
								<input
									type="text"
									name="name"
									required
									placeholder="Ex: Viagem de férias"
									className="w-full px-4 py-2 bg-[rgba(0,0,0,0.3)] border border-[var(--border-glass)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Valor da Meta (R$)
								</label>
								<input
									type="number"
									name="target"
									required
									step="0.01"
									min="0"
									placeholder="Ex: 5000.00"
									className="w-full px-4 py-2 bg-[rgba(0,0,0,0.3)] border border-[var(--border-glass)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)] placeholder-[var(--text-muted)] tabular-nums transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Valor Atual (R$)
								</label>
								<input
									type="number"
									name="current"
									step="0.01"
									min="0"
									placeholder="Ex: 1000.00"
									className="w-full px-4 py-2 bg-[rgba(0,0,0,0.3)] border border-[var(--border-glass)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)] placeholder-[var(--text-muted)] tabular-nums transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Prazo</label>
								<input
									type="date"
									name="deadline"
									required
									className="w-full px-4 py-2 bg-[rgba(0,0,0,0.3)] border border-[var(--border-glass)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)] transition-all"
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowGoalModal(false)}
									className="flex-1 px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all font-semibold shadow-[0_0_20px_var(--accent-glow)]"
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
