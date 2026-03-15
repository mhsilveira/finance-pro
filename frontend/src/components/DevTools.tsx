"use client";

import { useState } from "react";
import { createTransaction, deleteAllTransactions } from "@/services/api";

interface DevToolsProps {
	userId: string;
	onUpdate: () => void;
}

export function DevTools({ userId, onUpdate }: DevToolsProps) {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const seedData = async () => {
		if (!confirm("Isso vai criar transações de exemplo. Continuar?")) return;

		setLoading(true);
		try {
			const sampleTransactions = [
				// Receitas
				{
					description: "Salário Dezembro",
					amount: 5500,
					type: "income" as const,
					category: "INCOME",
					date: "2024-12-01",
					origin: "CASH" as const,
				},
				{
					description: "Freelance - Landing Page",
					amount: 1200,
					type: "income" as const,
					category: "FREELANCE",
					date: "2024-12-10",
					origin: "CASH" as const,
				},
				{
					description: "Rendimento Investimentos",
					amount: 350,
					type: "income" as const,
					category: "INVESTMENT",
					date: "2024-12-15",
					origin: "CASH" as const,
				},

				// Despesas Fixas
				{
					description: "Aluguel",
					amount: 1800,
					type: "expense" as const,
					category: "RENT",
					date: "2024-12-05",
					origin: "CASH" as const,
				},
				{
					description: "Conta de Luz",
					amount: 180,
					type: "expense" as const,
					category: "BILLS",
					date: "2024-12-08",
					origin: "CASH" as const,
				},
				{
					description: "Conta de Água",
					amount: 85,
					type: "expense" as const,
					category: "BILLS",
					date: "2024-12-08",
					origin: "CASH" as const,
				},
				{
					description: "Internet Fibra",
					amount: 120,
					type: "expense" as const,
					category: "BILLS",
					date: "2024-12-10",
					origin: "CASH" as const,
				},

				// Assinaturas
				{
					description: "Netflix",
					amount: 55,
					type: "expense" as const,
					category: "SUBSCRIPTIONS",
					date: "2024-12-12",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Spotify Premium",
					amount: 34.9,
					type: "expense" as const,
					category: "SUBSCRIPTIONS",
					date: "2024-12-15",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Amazon Prime",
					amount: 19.9,
					type: "expense" as const,
					category: "SUBSCRIPTIONS",
					date: "2024-12-18",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},

				// Alimentação
				{
					description: "Mercado Dia",
					amount: 320,
					type: "expense" as const,
					category: "FOOD",
					date: "2024-12-03",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "iFood - Almoço",
					amount: 45,
					type: "expense" as const,
					category: "FOOD",
					date: "2024-12-07",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Padaria",
					amount: 28.5,
					type: "expense" as const,
					category: "FOOD",
					date: "2024-12-09",
					origin: "CASH" as const,
				},
				{
					description: "Restaurante - Jantar",
					amount: 95,
					type: "expense" as const,
					category: "FOOD",
					date: "2024-12-14",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Supermercado Extra",
					amount: 280,
					type: "expense" as const,
					category: "FOOD",
					date: "2024-12-16",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},

				// Transporte
				{
					description: "Uber para o trabalho",
					amount: 35,
					type: "expense" as const,
					category: "TRANSPORT",
					date: "2024-12-04",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Gasolina",
					amount: 220,
					type: "expense" as const,
					category: "TRANSPORT",
					date: "2024-12-11",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "99 - Volta",
					amount: 28,
					type: "expense" as const,
					category: "TRANSPORT",
					date: "2024-12-17",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},

				// Saúde
				{
					description: "Farmácia - Remédios",
					amount: 125,
					type: "expense" as const,
					category: "HEALTH",
					date: "2024-12-06",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Consulta Dentista",
					amount: 200,
					type: "expense" as const,
					category: "HEALTH",
					date: "2024-12-13",
					origin: "CASH" as const,
				},

				// Educação
				{
					description: "Udemy - Curso React",
					amount: 89.9,
					type: "expense" as const,
					category: "EDUCATION",
					date: "2024-12-02",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Livros Técnicos",
					amount: 150,
					type: "expense" as const,
					category: "EDUCATION",
					date: "2024-12-19",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},

				// Lazer
				{
					description: "Cinema - Ingressos",
					amount: 78,
					type: "expense" as const,
					category: "ENTERTAINMENT",
					date: "2024-12-08",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Bar com amigos",
					amount: 95,
					type: "expense" as const,
					category: "ENTERTAINMENT",
					date: "2024-12-14",
					origin: "CASH" as const,
				},
				{
					description: "PlayStation Plus",
					amount: 34.9,
					type: "expense" as const,
					category: "ENTERTAINMENT",
					date: "2024-12-20",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},

				// Compras
				{
					description: "Roupas - Zara",
					amount: 340,
					type: "expense" as const,
					category: "SHOPPING",
					date: "2024-12-09",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Amazon - Eletrônicos",
					amount: 220,
					type: "expense" as const,
					category: "SHOPPING",
					date: "2024-12-15",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},
				{
					description: "Presente Aniversário",
					amount: 180,
					type: "expense" as const,
					category: "SHOPPING",
					date: "2024-12-18",
					origin: "CREDIT_CARD" as const,
					card: "Nubank",
				},

				// Gastos Gerais
				{
					description: "Manutenção Notebook",
					amount: 150,
					type: "expense" as const,
					category: "GENERAL",
					date: "2024-12-12",
					origin: "CASH" as const,
				},
				{
					description: "Produtos de Limpeza",
					amount: 65,
					type: "expense" as const,
					category: "GENERAL",
					date: "2024-12-16",
					origin: "CASH" as const,
				},
			];

			let success = 0;
			let failed = 0;

			for (const transaction of sampleTransactions) {
				try {
					await createTransaction({
						...transaction,
						userId,
						date: new Date(transaction.date).toISOString(),
					});
					success++;
				} catch (error) {
					console.error("Erro ao criar transação:", error);
					failed++;
				}
			}

			alert(`Seed concluído!\n✅ ${success} transações criadas\n❌ ${failed} erros`);
			onUpdate();
		} catch (error) {
			alert("Erro ao criar transações de exemplo");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const clearAll = async () => {
		if (!confirm("⚠️ ATENÇÃO: Isso vai DELETAR TODAS as transações! Tem certeza?")) return;

		setLoading(true);
		try {
			const result = await deleteAllTransactions(userId);
			alert(`${result.deletedCount} transações deletadas com sucesso!`);
			onUpdate();
		} catch (error) {
			alert("Erro ao limpar transações");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed bottom-4 right-4 z-50">
			{!open ? (
				<button
					onClick={() => setOpen(true)}
					className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-colors"
					title="Ferramentas de Desenvolvedor"
				>
					🛠️
				</button>
			) : (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">🛠️ Dev Tools</h3>
						<button
							onClick={() => setOpen(false)}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							✕
						</button>
					</div>

					<div className="space-y-2">
						<button
							onClick={seedData}
							disabled={loading}
							className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							<span>🌱</span>
							<span>{loading ? "Criando..." : "Seed (30 transações)"}</span>
						</button>

						<button
							onClick={clearAll}
							disabled={loading}
							className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							<span>🗑️</span>
							<span>{loading ? "Deletando..." : "Limpar Tudo"}</span>
						</button>
					</div>

					<p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Ferramentas apenas para desenvolvimento</p>
				</div>
			)}
		</div>
	);
}
