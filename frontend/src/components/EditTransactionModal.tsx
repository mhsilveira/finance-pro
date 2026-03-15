"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { CATEGORIES, type CreateTransactionPayload } from "../types/transaction";
import type { Transaction } from "../types/transaction";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { useUpdateTransaction, useCategories } from "@/hooks/useTransactions";
import { saveCategoryCorrection } from "@/services/api";

interface EditTransactionModalProps {
	transaction: Transaction;
	userId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function EditTransactionModal({
	transaction,
	userId,
	open,
	onOpenChange,
	onSuccess,
}: EditTransactionModalProps) {
	const [error, setError] = useState("");
	const updateMutation = useUpdateTransaction();
	const { data: backendCategories = [] } = useCategories();

	const [formData, setFormData] = useState<Omit<CreateTransactionPayload, "userId">>({
		description: transaction.description,
		amount: transaction.amount.toString(),
		type: transaction.type,
		origin: transaction.origin || "CASH",
		category: transaction.category,
		date: transaction.date,
		card: transaction.card || "",
	});

	// Update form when transaction changes
	useEffect(() => {
		setFormData({
			description: transaction.description,
			amount: transaction.amount.toString(),
			type: transaction.type,
			origin: transaction.origin || "CASH",
			category: transaction.category,
			date: transaction.date,
			card: transaction.card || "",
		});
	}, [transaction]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const payload: Partial<CreateTransactionPayload> = {
				description: formData.description,
				amount: formData.amount,
				type: formData.type,
				origin: formData.origin,
				category: formData.category,
				date: formData.date,
				card: formData.origin === "CREDIT_CARD" && formData.card ? formData.card : undefined,
			};

			await updateMutation.mutateAsync({ id: transaction.id, userId, payload });

			// Save category correction if the user changed the category
			if (formData.category !== transaction.category && formData.description) {
				saveCategoryCorrection(userId, formData.description, formData.category).catch((err) =>
					console.warn("Failed to save category correction:", err),
				);
			}

			onOpenChange(false);
			onSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao atualizar transação");
		}
	};

	const handleChange = (field: keyof typeof formData, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />

				<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-50">
					<Dialog.Title className="text-2xl font-bold text-gray-100 mb-6 uppercase tracking-wide">
						Editar Transação
					</Dialog.Title>

					<Dialog.Close asChild>
						<button
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 transition-colors"
							aria-label="Fechar"
						>
							<Cross2Icon className="w-5 h-5" />
						</button>
					</Dialog.Close>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Descrição */}
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide"
							>
								Descrição *
							</label>
							<Input
								id="description"
								type="text"
								required
								value={formData.description}
								onChange={(e) => handleChange("description", e.target.value)}
								placeholder="Ex: Compras no supermercado"
							/>
						</div>

						{/* Valor */}
						<div>
							<label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
								Valor (R$) *
							</label>
							<Input
								id="amount"
								type="number"
								step="0.01"
								required
								value={formData.amount}
								onChange={(e) => handleChange("amount", e.target.value)}
								placeholder="0,00"
								className="tabular-nums"
							/>
						</div>

						{/* Tipo */}
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Tipo *</label>
							<div className="flex gap-4">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="type"
										value="expense"
										checked={formData.type === "expense"}
										onChange={(e) => handleChange("type", e.target.value)}
										className="w-4 h-4 text-yellow-500 accent-yellow-500"
									/>
									<span className="text-sm text-gray-100">Despesa</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="type"
										value="income"
										checked={formData.type === "income"}
										onChange={(e) => handleChange("type", e.target.value)}
										className="w-4 h-4 text-yellow-500 accent-yellow-500"
									/>
									<span className="text-sm text-gray-100">Receita</span>
								</label>
							</div>
						</div>

						{/* Origem */}
						<div>
							<label htmlFor="origin" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
								Origem *
							</label>
							<Select id="origin" value={formData.origin} onChange={(e) => handleChange("origin", e.target.value)}>
								<option value="CASH">Dinheiro</option>
								<option value="CREDIT_CARD">Cartão de Crédito</option>
							</Select>
						</div>

						{/* Card (condicional) */}
						{formData.origin === "CREDIT_CARD" && (
							<div>
								<label htmlFor="card" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
									Cartão
								</label>
								<Input
									id="card"
									type="text"
									value={formData.card}
									onChange={(e) => handleChange("card", e.target.value)}
									placeholder="Nome do cartão"
								/>
							</div>
						)}

						{/* Categoria */}
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide"
							>
								Categoria *
							</label>
							<Select
								id="category"
								value={formData.category || ""}
								onChange={(e) => handleChange("category", e.target.value)}
							>
								{backendCategories.length > 0
									? backendCategories
										.filter((cat) => cat.type === formData.type || cat.type === "both")
										.map((cat) => (
											<option key={cat.key} value={cat.name}>
												{cat.icon ? `${cat.icon} ` : ""}{cat.name}
											</option>
										))
									: Object.entries(CATEGORIES).map(([key, label]) => (
										<option key={key} value={label}>
											{label}
										</option>
									))
								}
							</Select>
						</div>

						{/* Data */}
						<div>
							<label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
								Data *
							</label>
							<Input
								id="date"
								type="date"
								required
								value={formData.date}
								onChange={(e) => handleChange("date", e.target.value)}
							/>
						</div>

						{/* Error message */}
						{error && (
							<div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
						)}

						{/* Actions */}
						<div className="flex gap-3 pt-4">
							<Dialog.Close asChild>
								<Button type="button" variant="outline" className="flex-1">
									Cancelar
								</Button>
							</Dialog.Close>
							<Button type="submit" disabled={updateMutation.isPending} className="flex-1">
								{updateMutation.isPending ? "Salvando..." : "Salvar"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
