"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sparkles, AlertTriangle, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import type { CreateTransactionPayload, Category } from "@/types/transaction";

export interface ReviewItem {
	index: number;
	description: string;
	amount: string;
	date: string;
	currentCategory: string;
	aiSuggestedCategory: string;
	confidence: number;
}

interface ReviewCategoriesModalProps {
	isOpen: boolean;
	onClose: () => void;
	items: ReviewItem[];
	categories: Category[];
	onConfirm: (updatedCategories: Map<number, string>) => void;
	isSubmitting: boolean;
}

export function ReviewCategoriesModal({
	isOpen,
	onClose,
	items,
	categories,
	onConfirm,
	isSubmitting,
}: ReviewCategoriesModalProps) {
	const [selections, setSelections] = useState<Map<number, string>>(() => {
		const map = new Map<number, string>();
		for (const item of items) {
			map.set(item.index, item.aiSuggestedCategory || item.currentCategory);
		}
		return map;
	});

	const handleChange = (index: number, category: string) => {
		setSelections((prev) => {
			const next = new Map(prev);
			next.set(index, category);
			return next;
		});
	};

	const handleConfirm = () => {
		onConfirm(selections);
	};

	const formatCurrency = (value: string) => {
		const num = parseFloat(value);
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(num);
	};

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.7) return "text-emerald-400";
		if (confidence >= 0.4) return "text-amber-400";
		return "text-pink-400";
	};

	const getConfidenceLabel = (confidence: number) => {
		if (confidence >= 0.7) return "Alta";
		if (confidence >= 0.4) return "Média";
		if (confidence > 0) return "Baixa";
		return "Sem sugestão";
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 glass-elevated rounded-[20px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] p-6 w-full max-w-3xl max-h-[85vh] z-50 flex flex-col">
					<Dialog.Title className="text-xl font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-purple-400" />
						Revisão de Categorias (IA)
					</Dialog.Title>

					<p className="text-sm text-[var(--text-secondary)] mb-4">
						A IA não conseguiu categorizar {items.length} transaç{items.length === 1 ? "ão" : "ões"} com confiança. Revise e ajuste as categorias abaixo.
					</p>

					<Dialog.Close
						className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
						disabled={isSubmitting}
					>
						<X size={20} />
					</Dialog.Close>

					<div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
						{items.map((item) => (
							<div
								key={item.index}
								className="bg-white/[0.03] border border-[var(--border-glass)] rounded-lg p-4 space-y-3"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-[var(--text-primary)] truncate">
											{item.description}
										</p>
										<div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
											<span>{item.date}</span>
											<span className="text-purple-400 font-medium">
												{formatCurrency(item.amount)}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-1.5 shrink-0">
										{item.confidence > 0 ? (
											<Sparkles className={`w-3.5 h-3.5 ${getConfidenceColor(item.confidence)}`} />
										) : (
											<AlertTriangle className="w-3.5 h-3.5 text-pink-400" />
										)}
										<span className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
											{getConfidenceLabel(item.confidence)}
										</span>
									</div>
								</div>

								<Select
									value={selections.get(item.index) || ""}
									onChange={(e) => handleChange(item.index, e.target.value)}
									disabled={isSubmitting}
									className="text-sm"
								>
									<option value="" disabled>
										Selecione uma categoria
									</option>
									{categories.map((cat) => (
										<option key={cat.key} value={cat.name}>
											{cat.name}
										</option>
									))}
								</Select>
							</div>
						))}
					</div>

					<div className="flex gap-3 pt-4 border-t border-[var(--border-glass)] mt-4">
						<Button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							variant="outline"
							className="flex-1"
						>
							Cancelar
						</Button>
						<Button
							type="button"
							onClick={handleConfirm}
							disabled={isSubmitting}
							className="flex-1"
						>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
									<span>Importando...</span>
								</>
							) : (
								<>
									<Check size={18} />
									<span>Confirmar e Importar</span>
								</>
							)}
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
