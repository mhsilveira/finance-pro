"use client";

import { useEffect, useState } from "react";
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

	useEffect(() => {
		loadRecurring();
	}, []);

	const loadRecurring = () => {
		const data = getRecurringTransactions();
		setRecurring(data);
	};

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const payload = {
			userId,
			description: formData.get("description") as string,
			amount: formData.get("amount") as string,
			type: formData.get("type") as "income" | "expense",
			origin: formData.get("origin") as "CREDIT_CARD" | "CASH",
			category: formData.get("category") as string,
			card: formData.get("card") as string | undefined,
			frequency: formData.get("frequency") as RecurringFrequency,
			startDate: formData.get("startDate") as string,
			endDate: formData.get("endDate") as string | undefined,
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
				card: rec.card,
				date: new Date().toISOString(),
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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 pt-4">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Transações Recorrentes
							</h1>
							<p className="mt-2 text-gray-600 dark:text-gray-400">
								Gerencie contas mensais, salário e outras transações que se
								repetem
							</p>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
						>
							+ Nova Recorrente
						</button>
					</div>
				</div>

				{/* Recurring List */}
				{recurring.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{recurring.map((rec) => (
							<div
								key={rec.id}
								className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-6 hover:shadow-md transition-all ${
									rec.isActive
										? "border-gray-200 dark:border-gray-700"
										: "border-gray-300 dark:border-gray-600 opacity-60"
								}`}
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-2xl">
												{rec.type === "income" ? "📈" : "📉"}
											</span>
											<h3 className="font-semibold text-gray-900 dark:text-gray-100">
												{rec.description}
											</h3>
										</div>
										<p
											className={`text-2xl font-bold ${
												rec.type === "income"
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{rec.type === "income" ? "+" : "-"}
											{formatCurrency(rec.amount)}
										</p>
									</div>
									<div className="flex gap-1">
										<button
											onClick={() => handleToggle(rec.id)}
											className={`p-2 rounded-lg transition-colors ${
												rec.isActive
													? "bg-green-100 dark:bg-green-900/30 text-green-600"
													: "bg-gray-100 dark:bg-gray-800 text-gray-400"
											}`}
											title={rec.isActive ? "Ativo" : "Inativo"}
										>
											{rec.isActive ? "✓" : "○"}
										</button>
										<button
											onClick={() => handleDelete(rec.id)}
											className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
										>
											✕
										</button>
									</div>
								</div>

								<div className="space-y-2 text-sm mb-4">
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">
											Categoria:
										</span>
										<span className="font-medium text-gray-900 dark:text-gray-100">
											{rec.category}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">
											Frequência:
										</span>
										<span className="font-medium text-gray-900 dark:text-gray-100">
											{getFrequencyLabel(rec.frequency)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">
											Origem:
										</span>
										<span className="font-medium text-gray-900 dark:text-gray-100">
											{rec.origin === "CREDIT_CARD"
												? "Cartão de Crédito"
												: "Dinheiro"}
										</span>
									</div>
									{rec.card && (
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">
												Cartão:
											</span>
											<span className="font-medium text-gray-900 dark:text-gray-100">
												{rec.card}
											</span>
										</div>
									)}
								</div>

								<button
									onClick={() => handleGenerateNow(rec)}
									disabled={!rec.isActive || generating === rec.id}
									className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{generating === rec.id
										? "Gerando..."
										: "Gerar Transação Agora"}
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
						<span className="text-6xl mb-4 block">🔄</span>
						<p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
							Nenhuma transação recorrente cadastrada
						</p>
						<p className="text-gray-400 dark:text-gray-500 mb-6 max-w-md mx-auto">
							Cadastre contas mensais, salário e outras transações que se
							repetem para facilitar seu controle financeiro
						</p>
						<button
							onClick={() => setShowModal(true)}
							className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
						>
							Criar Primeira Recorrente
						</button>
					</div>
				)}
			</div>

			{/* Create Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
						<h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
							Nova Transação Recorrente
						</h3>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Descrição
									</label>
									<input
										type="text"
										name="description"
										required
										placeholder="Ex: Aluguel, Salário..."
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Valor (R$)
									</label>
									<input
										type="number"
										name="amount"
										required
										step="0.01"
										min="0"
										placeholder="0.00"
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Tipo
									</label>
									<select
										name="type"
										required
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									>
										<option value="expense">Despesa</option>
										<option value="income">Receita</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Categoria
									</label>
									<input
										type="text"
										name="category"
										required
										placeholder="Ex: Contas"
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Frequência
									</label>
									<select
										name="frequency"
										required
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									>
										<option value="monthly">Mensal</option>
										<option value="weekly">Semanal</option>
										<option value="yearly">Anual</option>
										<option value="daily">Diário</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Origem
									</label>
									<select
										name="origin"
										required
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									>
										<option value="CASH">Dinheiro</option>
										<option value="CREDIT_CARD">Cartão de Crédito</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Cartão (opcional)
									</label>
									<input
										type="text"
										name="card"
										placeholder="Ex: Nubank"
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Data de Início
									</label>
									<input
										type="date"
										name="startDate"
										required
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Data de Término (opcional)
									</label>
									<input
										type="date"
										name="endDate"
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
									/>
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
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
