"use client";

import { useEffect, useState, useCallback } from "react";
import type { RecurringTransaction, RecurringFrequency } from "@/types/recurring";
import {
	getRecurringTransactions,
	createRecurringTransaction,
	deleteRecurringTransaction,
	toggleRecurringActive,
} from "@/services/recurring";
import { createTransaction } from "@/services/api";

export default function RecurringPage() {
	const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [generating, setGenerating] = useState<string | null>(null);

	const userId = "blanchimaah";

	const loadRecurring = useCallback(() => {
		const data = getRecurringTransactions();
		setRecurring(data);
	}, []);

	useEffect(() => {
		loadRecurring();
	}, [loadRecurring]);

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const cardValue = formData.get("card") as string;
		const endDateValue = formData.get("endDate") as string;

		const payload = {
			userId,
			description: formData.get("description") as string,
			amount: formData.get("amount") as string,
			type: formData.get("type") as "income" | "expense",
			origin: formData.get("origin") as "CREDIT_CARD" | "CASH",
			category: formData.get("category") as string,
			card: cardValue && cardValue.trim() !== "" ? cardValue.trim() : undefined,
			frequency: formData.get("frequency") as RecurringFrequency,
			startDate: formData.get("startDate") as string,
			endDate: endDateValue && endDateValue.trim() !== "" ? endDateValue.trim() : undefined,
		};

		createRecurringTransaction(payload);
		loadRecurring();
		setShowModal(false);
		e.currentTarget.reset();
	};

	const handleDelete = (id: string) => {
		if (confirm("Tem certeza que deseja excluir esta transação recorrente?")) {
			deleteRecurringTransaction(id);
			loadRecurring();
		}
	};

	const handleToggle = (id: string) => {
		toggleRecurringActive(id);
		loadRecurring();
	};

	const handleGenerateNow = async (rec: RecurringTransaction) => {
		try {
			setGenerating(rec.id);

			await createTransaction({
				userId: rec.userId,
				description: rec.description,
				amount: rec.amount,
				type: rec.type,
				origin: rec.origin,
				category: rec.category,
				card: rec.card && rec.card.trim() !== "" ? rec.card : undefined,
				date: new Date().toISOString().split("T")[0],
			});

			alert("Transação gerada com sucesso!");
		} catch (err) {
			alert(err instanceof Error ? err.message : "Erro ao gerar transação");
		} finally {
			setGenerating(null);
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const getFrequencyLabel = (freq: RecurringFrequency) => {
		const labels = {
			daily: "Diário",
			weekly: "Semanal",
			monthly: "Mensal",
			yearly: "Anual",
		};
		return labels[freq];
	};

	return (
		<div className="min-h-screen animate-fade-in">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div className="mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
								Transações Recorrentes
							</h1>
							<p className="mt-2 text-[var(--text-secondary)]">
								Gerencie contas mensais, salário e outras transações que se repetem
							</p>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] shadow-[0_0_20px_var(--accent-glow)] transition-all font-medium"
						>
							+ Nova Recorrente
						</button>
					</div>
				</div>

				{recurring.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{recurring.map((rec) => (
							<div
								key={rec.id}
								className={`glass glass-hover rounded-xl p-6 ${!rec.isActive ? "opacity-60" : ""}`}
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-2xl">{rec.type === "income" ? "📈" : "📉"}</span>
											<h3 className="font-semibold text-[var(--text-primary)]">{rec.description}</h3>
										</div>
										<p className={`text-2xl font-bold ${rec.type === "income" ? "text-emerald-400" : "text-pink-400"}`}>
											{rec.type === "income" ? "+" : "-"}
											{formatCurrency(rec.amount)}
										</p>
									</div>
									<div className="flex gap-1">
										<button
											onClick={() => handleToggle(rec.id)}
											className={`p-2 rounded-lg transition-colors ${
												rec.isActive
													? "bg-emerald-500/15 text-emerald-400"
													: "bg-white/5 text-[var(--text-muted)]"
											}`}
											title={rec.isActive ? "Ativo" : "Inativo"}
										>
											{rec.isActive ? "✓" : "○"}
										</button>
										<button
											onClick={() => handleDelete(rec.id)}
											className="p-2 rounded-lg hover:bg-pink-500/10 text-[var(--text-muted)] hover:text-pink-400 transition-colors"
										>
											✕
										</button>
									</div>
								</div>

								<div className="space-y-2 text-sm mb-4">
									<div className="flex justify-between">
										<span className="text-[var(--text-secondary)]">Categoria:</span>
										<span className="font-medium text-[var(--text-primary)]">{rec.category}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-[var(--text-secondary)]">Frequência:</span>
										<span className="font-medium text-[var(--text-primary)]">
											{getFrequencyLabel(rec.frequency)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-[var(--text-secondary)]">Origem:</span>
										<span className="font-medium text-[var(--text-primary)]">
											{rec.origin === "CREDIT_CARD" ? "Cartão de Crédito" : "Dinheiro"}
										</span>
									</div>
									{rec.card && (
										<div className="flex justify-between">
											<span className="text-[var(--text-secondary)]">Cartão:</span>
											<span className="font-medium text-[var(--text-primary)]">{rec.card}</span>
										</div>
									)}
								</div>

								<button
									onClick={() => handleGenerateNow(rec)}
									disabled={!rec.isActive || generating === rec.id}
									className="w-full py-2 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{generating === rec.id ? "Gerando..." : "Gerar Transação Agora"}
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="glass rounded-xl p-12 text-center">
						<span className="text-6xl mb-4 block">🔄</span>
						<p className="text-[var(--text-secondary)] mb-4 text-lg">Nenhuma transação recorrente cadastrada</p>
						<p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
							Cadastre contas mensais, salário e outras transações que se repetem para facilitar seu controle financeiro
						</p>
						<button
							onClick={() => setShowModal(true)}
							className="px-8 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] shadow-[0_0_20px_var(--accent-glow)] transition-all font-medium"
						>
							Criar Primeira Recorrente
						</button>
					</div>
				)}
			</div>

			{showModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
					<div className="glass-elevated rounded-[20px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] max-w-2xl w-full p-6 my-8">
						<h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Nova Transação Recorrente</h3>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição</label>
									<input
										type="text"
										name="description"
										required
										placeholder="Ex: Aluguel, Salário..."
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Valor (R$)</label>
									<input
										type="number"
										name="amount"
										required
										step="0.01"
										min="0"
										placeholder="0.00"
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tipo</label>
									<select
										name="type"
										required
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									>
										<option value="expense">Despesa</option>
										<option value="income">Receita</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Categoria</label>
									<input
										type="text"
										name="category"
										required
										placeholder="Ex: Contas"
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequência</label>
									<select
										name="frequency"
										required
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									>
										<option value="monthly">Mensal</option>
										<option value="weekly">Semanal</option>
										<option value="yearly">Anual</option>
										<option value="daily">Diário</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Origem</label>
									<select
										name="origin"
										required
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									>
										<option value="CASH">Dinheiro</option>
										<option value="CREDIT_CARD">Cartão de Crédito</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
										Cartão (opcional)
									</label>
									<input
										type="text"
										name="card"
										placeholder="Ex: Nubank"
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
										Data de Início
									</label>
									<input
										type="date"
										name="startDate"
										required
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
										Data de Término (opcional)
									</label>
									<input
										type="date"
										name="endDate"
										className="w-full px-4 py-2 border border-[var(--border-glass)] rounded-xl bg-[rgba(0,0,0,0.3)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_12px_var(--accent-glow)] transition-all"
									/>
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="flex-1 px-4 py-3 border border-[var(--border-glass)] text-[var(--text-secondary)] rounded-xl hover:bg-white/5 transition-all font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-3 bg-[var(--accent-primary)] text-white rounded-xl hover:bg-[var(--accent-primary-hover)] shadow-[0_0_20px_var(--accent-glow)] transition-all font-medium"
								>
									Criar Recorrente
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
