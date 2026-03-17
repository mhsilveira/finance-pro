"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { useCategories, categoryKeys } from "@/hooks/useTransactions";
import { createCategory, updateCategory, deleteCategory } from "@/services/api";
import type { Category } from "@/types/transaction";
import { useQueryClient } from "@tanstack/react-query";

interface ManageCategoriesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EMPTY_FORM = {
	key: "",
	name: "",
	type: "expense" as "income" | "expense" | "both",
	icon: "",
	color: "#6366f1",
	keywords: "" as string,
	sortOrder: 100,
};

export function ManageCategoriesModal({ open, onOpenChange }: ManageCategoriesModalProps) {
	const queryClient = useQueryClient();
	const { data: categories = [], isLoading } = useCategories();
	const [editing, setEditing] = useState<Category | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState(EMPTY_FORM);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState<"all" | "income" | "expense" | "both">("all");

	const filteredCategories = filter === "all"
		? categories
		: categories.filter((c) => c.type === filter || c.type === "both");

	const resetForm = () => {
		setFormData(EMPTY_FORM);
		setEditing(null);
		setShowForm(false);
		setError("");
	};

	const handleEdit = (cat: Category) => {
		setEditing(cat);
		setFormData({
			key: cat.key,
			name: cat.name,
			type: cat.type,
			icon: cat.icon || "",
			color: cat.color || "#6366f1",
			keywords: (cat.keywords || []).join(", "),
			sortOrder: cat.sortOrder ?? 100,
		});
		setShowForm(true);
		setError("");
	};

	const handleDelete = async (cat: Category) => {
		if (!confirm(`Tem certeza que deseja excluir a categoria "${cat.name}"?`)) return;

		try {
			await deleteCategory(cat.key);
			queryClient.invalidateQueries({ queryKey: categoryKeys.all });
		} catch (err) {
			alert(err instanceof Error ? err.message : "Erro ao excluir categoria");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSaving(true);

		try {
			const keywordsArray = formData.keywords
				.split(",")
				.map((k) => k.trim().toUpperCase())
				.filter(Boolean);

			if (editing) {
				await updateCategory(editing.key, {
					name: formData.name,
					type: formData.type,
					icon: formData.icon || undefined,
					color: formData.color || undefined,
					keywords: keywordsArray,
					sortOrder: formData.sortOrder,
				});
			} else {
				if (!formData.key.trim()) {
					setError("A chave da categoria é obrigatória");
					setSaving(false);
					return;
				}
				await createCategory({
					key: formData.key.toUpperCase().replace(/\s+/g, "_"),
					name: formData.name,
					type: formData.type,
					icon: formData.icon || undefined,
					color: formData.color || undefined,
					keywords: keywordsArray,
					sortOrder: formData.sortOrder,
				});
			}

			queryClient.invalidateQueries({ queryKey: categoryKeys.all });
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao salvar categoria");
		} finally {
			setSaving(false);
		}
	};

	const typeLabel = (type: string) => {
		switch (type) {
			case "income": return "Receita";
			case "expense": return "Despesa";
			case "both": return "Ambos";
			default: return type;
		}
	};

	const typeBadgeColor = (type: string) => {
		switch (type) {
			case "income": return "bg-emerald-500/15 text-emerald-400";
			case "expense": return "bg-pink-500/15 text-pink-400";
			case "both": return "bg-blue-500/20 text-blue-400";
			default: return "bg-white/5 text-[var(--text-muted)]";
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
				<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-elevated rounded-[20px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
					<Dialog.Title className="text-xl font-semibold text-[var(--text-primary)] mb-6">
						Gerenciar Categorias
					</Dialog.Title>

					<Dialog.Close asChild>
						<button
							className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
							aria-label="Fechar"
						>
							<Cross2Icon className="w-5 h-5" />
						</button>
					</Dialog.Close>

					<div className="flex items-center justify-between mb-4 gap-4">
						<Select
							value={filter}
							onChange={(e) => setFilter(e.target.value as typeof filter)}
							className="w-40"
						>
							<option value="all">Todas</option>
							<option value="income">Receitas</option>
							<option value="expense">Despesas</option>
							<option value="both">Ambos</option>
						</Select>

						{!showForm && (
							<Button onClick={() => { resetForm(); setShowForm(true); }}>
								+ Nova Categoria
							</Button>
						)}
					</div>

					{showForm && (
						<form onSubmit={handleSubmit} className="bg-white/5 border border-[var(--border-glass)] rounded-xl p-4 mb-4 space-y-3">
							<h3 className="text-sm font-semibold text-[var(--text-secondary)]">
								{editing ? "Editar Categoria" : "Nova Categoria"}
							</h3>

							<div className="grid grid-cols-2 gap-3">
								{!editing && (
									<div>
										<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Chave</label>
										<Input
											type="text"
											value={formData.key}
											onChange={(e) => setFormData((p) => ({ ...p, key: e.target.value }))}
											placeholder="Ex: RENT"
											required
										/>
									</div>
								)}
								<div className={editing ? "col-span-2" : ""}>
									<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nome</label>
									<Input
										type="text"
										value={formData.name}
										onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
										placeholder="Ex: Aluguel"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<div>
									<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Tipo</label>
									<Select
										value={formData.type}
										onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as typeof formData.type }))}
									>
										<option value="expense">Despesa</option>
										<option value="income">Receita</option>
										<option value="both">Ambos</option>
									</Select>
								</div>
								<div>
									<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Icone</label>
									<Input
										type="text"
										value={formData.icon}
										onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
										placeholder="Ex: 🏠"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Cor</label>
									<div className="flex gap-2">
										<Input
											type="color"
											value={formData.color}
											onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
											className="w-10 h-9 p-0.5 cursor-pointer"
										/>
										<Input
											type="text"
											value={formData.color}
											onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
											className="flex-1"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-4 gap-3">
								<div className="col-span-3">
									<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Palavras-chave</label>
									<Input
										type="text"
										value={formData.keywords}
										onChange={(e) => setFormData((p) => ({ ...p, keywords: e.target.value }))}
										placeholder="IFOOD, RAPPI, UBER EATS (separados por vírgula)"
									/>
									<p className="text-xs text-[var(--text-muted)] mt-1">Usadas na auto-categorização de importações CSV</p>
								</div>
								<div>
									<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Prioridade</label>
									<Input
										type="number"
										value={formData.sortOrder}
										onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
										min={1}
										max={999}
									/>
									<p className="text-xs text-[var(--text-muted)] mt-1">Menor = maior prioridade</p>
								</div>
							</div>

							{error && (
								<div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-400 text-sm">{error}</div>
							)}

							<div className="flex gap-2 justify-end">
								<Button type="button" variant="outline" size="sm" onClick={resetForm}>
									Cancelar
								</Button>
								<Button type="submit" size="sm" disabled={saving}>
									{saving ? "Salvando..." : editing ? "Atualizar" : "Criar"}
								</Button>
							</div>
						</form>
					)}

					{isLoading ? (
						<div className="text-center text-[var(--text-secondary)] py-8">Carregando categorias...</div>
					) : filteredCategories.length === 0 ? (
						<div className="text-center text-[var(--text-secondary)] py-8">Nenhuma categoria encontrada.</div>
					) : (
						<div className="space-y-1">
							{filteredCategories.map((cat) => (
								<div
									key={cat.key}
									className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors group"
								>
									<div className="flex items-center gap-3">
										{cat.color && (
											<div
												className="w-3 h-3 rounded-full flex-shrink-0"
												style={{ backgroundColor: cat.color }}
											/>
										)}
										<span className="text-lg">{cat.icon || ""}</span>
										<div>
											<span className="text-[var(--text-primary)] font-medium">{cat.name}</span>
											<span className="text-[var(--text-muted)] text-xs ml-2">{cat.key}</span>
											{cat.keywords && cat.keywords.length > 0 && (
												<span className="text-[var(--text-muted)] text-xs ml-2" title={cat.keywords.join(", ")}>
													({cat.keywords.length} keywords)
												</span>
											)}
										</div>
										<span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor(cat.type)}`}>
											{typeLabel(cat.type)}
										</span>
									</div>
									<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											onClick={() => handleEdit(cat)}
											className="p-1.5 text-[var(--text-muted)] hover:text-purple-400 transition-colors"
											title="Editar"
										>
											<Pencil1Icon className="w-4 h-4" />
										</button>
										<button
											onClick={() => handleDelete(cat)}
											className="p-1.5 text-[var(--text-muted)] hover:text-pink-400 transition-colors"
											title="Excluir"
										>
											<TrashIcon className="w-4 h-4" />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
