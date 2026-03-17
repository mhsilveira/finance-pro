"use client";

import { useState, useMemo } from "react";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { ImportCSVModal, type CSVSource } from "@/components/ImportCSVModal";
import { ReviewCategoriesModal, type ReviewItem } from "@/components/ReviewCategoriesModal";
import { TransactionTable } from "@/components/TransactionTable";
import { DevTools } from "@/components/DevTools";
import { ManageCategoriesModal } from "@/components/ManageCategoriesModal";
import type { Transaction, Category, CreateTransactionPayload } from "@/types/transaction";
import { exportTransactionsToCSV, parseCSV } from "@/services/csv";
import { reprocessCategories, getCategoryCorrections, batchCreateTransactions, getCategories, aiCategorize } from "@/services/api";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
	usePaginatedTransactions,
	useAllTransactions,
	useDeleteTransaction,
	useTransactionStats,
} from "@/hooks/useTransactions";
import { usePersistedFilters } from "@/hooks/usePersistedFilters";

export default function TransactionsPage() {
	const [currentPage, setCurrentPage] = useState(1);

	const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);

	const [showImportModal, setShowImportModal] = useState(false);
	const [importing, setImporting] = useState(false);

	const [reprocessing, setReprocessing] = useState(false);

	const [showCategoriesModal, setShowCategoriesModal] = useState(false);

	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
	const [pendingTransactions, setPendingTransactions] = useState<CreateTransactionPayload[]>([]);
	const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

	const { filters, setFilters, resetFilters, hasActiveFilters, isLoaded } = usePersistedFilters();

	const userId = "blanchimaah";

	const {
		data: paginatedData,
		isLoading,
		error: queryError,
		refetch: refetchPaginated,
	} = usePaginatedTransactions(userId, currentPage, filters.pageSize);
	const { data: allTransactions = [], refetch: refetchAll } = useAllTransactions(userId);
	const deleteMutation = useDeleteTransaction();
	const { data: serverStats, refetch: refetchStats } = useTransactionStats(userId, {
		monthFrom: filters.monthFrom || undefined,
		monthTo: filters.monthTo || undefined,
	});

	const loading = isLoading || !isLoaded;
	const error = queryError ? (queryError as Error).message : "";

	const refetchTransactions = async () => {
		await Promise.all([refetchPaginated(), refetchAll(), refetchStats()]);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir esta transação?")) {
			return;
		}

		try {
			await deleteMutation.mutateAsync({ id, userId });
		} catch (err) {
			alert(err instanceof Error ? err.message : "Erro ao excluir transação");
		}
	};

	const handleEdit = (transaction: Transaction) => {
		setEditingTransaction(transaction);
		setShowEditModal(true);
	};

	const handleExport = () => {
		exportTransactionsToCSV(filteredTransactions);
	};

	const handleImportClick = () => {
		setShowImportModal(true);
	};

	const handleImport = async (file: File, source: CSVSource) => {
		setImporting(true);

		try {
			const text = await file.text();

			const [corrections, categories] = await Promise.all([
				getCategoryCorrections(userId).catch(() => undefined),
				getCategories().catch(() => undefined),
			]);

			const newTransactions = parseCSV(text, source, corrections, categories);

			if (newTransactions.length === 0) {
				alert("Nenhuma transação encontrada no arquivo.");
				return;
			}

			const uncategorizedIndexes = newTransactions
				.map((t, i) => (t.category === "A Categorizar" ? i : -1))
				.filter((i) => i !== -1);

			let aiResults: { description: string; suggestedCategory: string; confidence: number }[] = [];

			if (uncategorizedIndexes.length > 0) {
				const uncategorizedDescriptions = uncategorizedIndexes.map((i) => newTransactions[i].description);
				try {
					aiResults = await aiCategorize(uncategorizedDescriptions);
				} catch {
					console.warn("AI categorization unavailable, skipping AI step");
				}
			}

			const CONFIDENCE_THRESHOLD = 0.7;
			const needsReview: ReviewItem[] = [];

			for (const i of uncategorizedIndexes) {
				const aiResult = aiResults.find((r) => r.description === newTransactions[i].description);
				const confidence = aiResult?.confidence || 0;
				const aiCategory = aiResult?.suggestedCategory || "";

				if (aiResult && confidence >= CONFIDENCE_THRESHOLD && aiCategory !== "A Categorizar") {
					newTransactions[i].category = aiCategory;
				} else {
					needsReview.push({
						index: i,
						description: newTransactions[i].description,
						amount: String(newTransactions[i].amount),
						date: newTransactions[i].date,
						currentCategory: newTransactions[i].category,
						aiSuggestedCategory: aiCategory,
						confidence,
					});
				}
			}

			if (needsReview.length > 0 && categories && categories.length > 0) {
				setPendingTransactions(newTransactions);
				setReviewItems(needsReview);
				setAvailableCategories(categories);
				setShowImportModal(false);
				setShowReviewModal(true);
				setImporting(false);
				return;
			}

			await submitTransactions(newTransactions, source);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Erro ao importar CSV";
			console.error("CRITICAL ERROR during CSV import:", err);
			alert(errorMessage);
		} finally {
			setImporting(false);
		}
	};

	const handleReviewConfirm = async (updatedCategories: Map<number, string>) => {
		setImporting(true);
		try {
			const transactions = [...pendingTransactions];
			for (const [index, category] of updatedCategories) {
				transactions[index].category = category;
			}
			await submitTransactions(transactions, "REVIEW");
			setShowReviewModal(false);
			setPendingTransactions([]);
			setReviewItems([]);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Erro ao importar";
			alert(errorMessage);
		} finally {
			setImporting(false);
		}
	};

	const submitTransactions = async (newTransactions: CreateTransactionPayload[], source: string) => {
		const result = await batchCreateTransactions(newTransactions);

		const dupsMsg = result.duplicates ? `\n${result.duplicates} duplicatas ignoradas.` : "";

		if (result.failed > 0 && result.errors.length > 0) {
			const errors = result.errors.map((e) => ({
				row: e.index + 2,
				transaction: newTransactions[e.index],
				error: e.error,
			}));

			const shouldDownload = confirm(
				`Importação concluída!\n${result.success} transações importadas.${dupsMsg}\n${result.failed} erros encontrados.\n\nDeseja baixar o log de erros?`,
			);

			if (shouldDownload) {
				downloadErrorLog(errors, source);
			}
		} else {
			alert(`Importação concluída com sucesso!\n${result.success} transações importadas.${dupsMsg}`);
		}

		await refetchTransactions();
		setShowImportModal(false);
	};

	const downloadErrorLog = (
		errors: Array<{ row: number; transaction: any; error: string }>,
		source: string,
	) => {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const logContent = [
			`CSV IMPORT ERROR LOG`,
			`Source: ${source}`,
			`Date: ${new Date().toLocaleString()}`,
			`Total Errors: ${errors.length}`,
			`\n${"=".repeat(80)}\n`,
			...errors.map(
				(e) =>
					`ROW ${e.row}:\n` +
					`  Description: ${e.transaction.description}\n` +
					`  Amount: ${e.transaction.amount}\n` +
					`  Type: ${e.transaction.type}\n` +
					`  Date: ${e.transaction.date}\n` +
					`  Error: ${e.error}\n` +
					`  Full Data: ${JSON.stringify(e.transaction, null, 2)}\n` +
					`${"-".repeat(80)}\n`,
			),
		].join("\n");

		const blob = new Blob([logContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `import-errors_${source}_${timestamp}.txt`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleReprocessCategories = async () => {
		if (
			!confirm(
				"Isto irá reprocessar TODAS as transações e atualizar suas categorias automaticamente. Continuar?",
			)
		) {
			return;
		}

		setReprocessing(true);
		console.log("Starting category reprocessing...");

		try {
			const result = await reprocessCategories(userId);

			console.log("Reprocessing complete:");
			console.log(`   Total: ${result.total} transactions`);
			console.log(`   Updated: ${result.updated} transactions`);
			console.log(`   Unchanged: ${result.unchanged} transactions`);

			alert(
				`Categorias reprocessadas com sucesso!\n\n` +
					`Total: ${result.total} transações\n` +
					`Atualizadas: ${result.updated}\n` +
					`Sem alteração: ${result.unchanged}`,
			);

			await refetchTransactions();
		} catch (error) {
			console.error("Error reprocessing categories:", error);
			alert(
				`Erro ao reprocessar categorias:\n${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		} finally {
			setReprocessing(false);
		}
	};

	const hasClientFilters = !!(filters.searchTerm || filters.typeFilter !== "all" || filters.categoryFilter !== "all" || filters.originFilter !== "all" || filters.cardFilter !== "all");

	const filteredTransactions = useMemo(() => {
		return allTransactions.filter((t) => {
			if (filters.searchTerm && !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
			if (filters.typeFilter !== "all" && t.type !== filters.typeFilter) return false;
			if (filters.categoryFilter !== "all" && t.category !== filters.categoryFilter) return false;
			if (filters.originFilter !== "all" && t.origin !== filters.originFilter) return false;
			if (filters.cardFilter !== "all" && t.card !== filters.cardFilter) return false;
			const transactionMonth = t.monthYear || t.date.substring(0, 7);
			if (filters.monthFrom && transactionMonth < filters.monthFrom) return false;
			if (filters.monthTo && transactionMonth > filters.monthTo) return false;
			return true;
		});
	}, [allTransactions, filters.searchTerm, filters.typeFilter, filters.categoryFilter, filters.originFilter, filters.cardFilter, filters.monthFrom, filters.monthTo]);

	const uniqueCategories = useMemo(
		() => Array.from(new Set(allTransactions.map((t) => t.category).filter(Boolean))),
		[allTransactions],
	);
	const uniqueCards = useMemo(
		() => Array.from(new Set(allTransactions.map((t) => t.card).filter(Boolean))),
		[allTransactions],
	);

	const stats = useMemo(() => {
		if (!hasClientFilters && serverStats) {
			return { total: serverStats.totalCount, income: serverStats.income, expense: serverStats.expense };
		}
		let income = 0;
		let expense = 0;
		for (const t of filteredTransactions) {
			if (t.type === "income") income += t.amount;
			else expense += t.amount;
		}
		return { total: filteredTransactions.length, income, expense };
	}, [hasClientFilters, serverStats, filteredTransactions]);

	const displayTransactions = hasActiveFilters ? filteredTransactions : paginatedData?.data || [];

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	return (
		<div className="min-h-screen animate-fade-in">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Transações</h1>
							<p className="mt-2 text-[var(--text-secondary)]">Gerencie suas receitas e despesas de forma inteligente</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								onClick={handleExport}
								disabled={allTransactions.length === 0}
								variant="outline"
								className="hover:border-emerald-500/30"
							>
								<span>📥</span>
								<span>Exportar CSV</span>
							</Button>

							<Button
								onClick={handleImportClick}
								disabled={importing}
								variant="outline"
								className="hover:border-purple-500/30"
							>
								<span>📤</span>
								<span>{importing ? "Importando..." : "Importar CSV"}</span>
							</Button>

							<Button
								onClick={handleReprocessCategories}
								variant="outline"
								disabled={reprocessing}
								className="hover:border-purple-500/50"
							>
								<span>🔄</span>
								<span>{reprocessing ? "Reprocessando..." : "Reprocessar Categorias"}</span>
							</Button>

							<Button
								onClick={() => setShowCategoriesModal(true)}
								variant="outline"
								className="hover:border-blue-500/50"
							>
								<span>🏷️</span>
								<span>Categorias</span>
							</Button>

							<AddTransactionModal userId={userId} onSuccess={refetchTransactions} />
						</div>
					</div>
				</div>

				{!loading && !error && allTransactions.length > 0 && (
					<div className="glass p-6 mb-8">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">Filtros</h2>
							{hasActiveFilters && (
								<Button
									onClick={resetFilters}
									variant="ghost"
									size="sm"
									className="text-purple-400 hover:text-purple-300"
								>
									Limpar filtros
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Buscar</label>
								<Input
									type="text"
									value={filters.searchTerm}
									onChange={(e) => setFilters({ searchTerm: e.target.value })}
									placeholder="Descrição..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tipo</label>
								<Select
									value={filters.typeFilter}
									onChange={(e) => setFilters({ typeFilter: e.target.value as "all" | "income" | "expense" })}
								>
									<option value="all">Todos</option>
									<option value="income">Receitas</option>
									<option value="expense">Despesas</option>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Categoria
								</label>
								<Select value={filters.categoryFilter} onChange={(e) => setFilters({ categoryFilter: e.target.value })}>
									<option value="all">Todas</option>
									{uniqueCategories.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Origem</label>
								<Select
									value={filters.originFilter}
									onChange={(e) => setFilters({ originFilter: e.target.value as "all" | "CREDIT_CARD" | "CASH" })}
								>
									<option value="all">Todas</option>
									<option value="CREDIT_CARD">Cartão de Crédito</option>
									<option value="CASH">Dinheiro</option>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cartão</label>
								<Select value={filters.cardFilter} onChange={(e) => setFilters({ cardFilter: e.target.value })}>
									<option value="all">Todos</option>
									{uniqueCards.map((card) => (
										<option key={card} value={card}>
											{card}
										</option>
									))}
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Período De
								</label>
								<Input
									type="month"
									value={filters.monthFrom}
									onChange={(e) => setFilters({ monthFrom: e.target.value })}
									placeholder="Mês inicial"
									title="Mês inicial"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
									Período Até
								</label>
								<Input
									type="month"
									value={filters.monthTo}
									onChange={(e) => setFilters({ monthTo: e.target.value })}
									placeholder="Mês final"
									title="Mês final"
								/>
							</div>
						</div>

						{hasActiveFilters && (
							<div className="mt-4 text-sm text-[var(--text-secondary)]">
								Exibindo <span className="text-purple-400 font-semibold tabular-nums">{stats.total}</span> de{" "}
								<span className="tabular-nums">{allTransactions.length}</span> transações
							</div>
						)}
					</div>
				)}

				{!loading && !error && allTransactions.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
						<div className="glass glass-hover p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Total</p>
									<p className="text-2xl font-bold text-[var(--text-primary)] mt-2 tabular-nums">{stats.total}</p>
								</div>
								<div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div className="glass glass-hover p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Receitas</p>
									<p className="text-2xl font-bold text-emerald-400 mt-2 tabular-nums">
										{formatCurrency(stats.income)}
									</p>
								</div>
								<div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
									</svg>
								</div>
							</div>
						</div>

						<div className="glass glass-hover p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Despesas</p>
									<p className="text-2xl font-bold text-pink-400 mt-2 tabular-nums">
										{formatCurrency(stats.expense)}
									</p>
								</div>
								<div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
									</svg>
								</div>
							</div>
						</div>

						</div>
				)}

				{loading && <TableSkeleton rows={10} />}

				{error && !loading && (
					<div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-6 mb-6">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg className="h-6 w-6 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3 flex-1">
								<h3 className="text-base font-semibold text-pink-400">Erro ao carregar transações</h3>
								<div className="mt-2 text-sm text-pink-300">{error}</div>
								<Button
									onClick={refetchTransactions}
									variant="outline"
									size="sm"
									className="mt-4 bg-pink-500/20 border-pink-500/50 text-pink-400 hover:bg-pink-500/30"
								>
									Tentar novamente
								</Button>
							</div>
						</div>
					</div>
				)}

				{!loading && !error && (
					<>
						{displayTransactions.length > 0 ? (
							<>
								<TransactionTable transactions={displayTransactions} onDelete={handleDelete} onEdit={handleEdit} />

								{!hasActiveFilters && paginatedData && (
									<div className="mt-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
												<span>Exibir</span>
												<Select
													value={filters.pageSize.toString()}
													onChange={(e) => {
														setFilters({ pageSize: Number(e.target.value) });
														setCurrentPage(1);
													}}
													className="w-20 h-8"
												>
													<option value="5">5</option>
													<option value="10">10</option>
													<option value="25">25</option>
													<option value="50">50</option>
													<option value="100">100</option>
													<option value="9999">Todas</option>
												</Select>
												<span>itens por página</span>
											</div>
										</div>

										{paginatedData.pagination.totalPages > 1 && (
											<div className="flex justify-center">
												<Pagination>
													<PaginationContent>
														<PaginationItem>
															<PaginationPrevious
																onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
																disabled={currentPage === 1}
																className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
															/>
														</PaginationItem>

														{(() => {
															const { totalPages } = paginatedData.pagination;
															const pages: (number | "ellipsis")[] = [];

															if (totalPages <= 7) {
																for (let i = 1; i <= totalPages; i++) {
																	pages.push(i);
																}
															} else {
																pages.push(1);

																if (currentPage > 3) {
																	pages.push("ellipsis");
																}

																const start = Math.max(2, currentPage - 1);
																const end = Math.min(totalPages - 1, currentPage + 1);

																for (let i = start; i <= end; i++) {
																	pages.push(i);
																}

																if (currentPage < totalPages - 2) {
																	pages.push("ellipsis");
																}

																pages.push(totalPages);
															}

															return pages.map((page, idx) => (
																<PaginationItem key={idx}>
																	{page === "ellipsis" ? (
																		<PaginationEllipsis />
																	) : (
																		<PaginationLink
																			onClick={() => setCurrentPage(page)}
																			isActive={currentPage === page}
																			className="cursor-pointer"
																		>
																			{page}
																		</PaginationLink>
																	)}
																</PaginationItem>
															));
														})()}

														<PaginationItem>
															<PaginationNext
																onClick={() =>
																	setCurrentPage((p) => Math.min(paginatedData.pagination.totalPages, p + 1))
																}
																disabled={!paginatedData.pagination.hasMore}
																className={
																	!paginatedData.pagination.hasMore
																		? "pointer-events-none opacity-50"
																		: "cursor-pointer"
																}
															/>
														</PaginationItem>
													</PaginationContent>
												</Pagination>
											</div>
										)}

										<div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
											Exibindo {(currentPage - 1) * filters.pageSize + 1}-
											{Math.min(currentPage * filters.pageSize, paginatedData.pagination.total)} de{" "}
											{paginatedData.pagination.total} transações
										</div>
									</div>
								)}
							</>
						) : (
							<div className="glass p-12 text-center">
								<p className="text-[var(--text-secondary)] mb-4">
									{hasActiveFilters
										? "Nenhuma transação encontrada com os filtros aplicados"
										: "Nenhuma transação encontrada"}
								</p>
								{hasActiveFilters && <Button onClick={resetFilters}>Limpar Filtros</Button>}
							</div>
						)}
					</>
				)}
			</div>

			<DevTools userId={userId} onUpdate={refetchTransactions} />

			{editingTransaction && (
				<EditTransactionModal
					transaction={editingTransaction}
					userId={userId}
					open={showEditModal}
					onOpenChange={setShowEditModal}
					onSuccess={refetchTransactions}
				/>
			)}

			<ImportCSVModal
				isOpen={showImportModal}
				onClose={() => setShowImportModal(false)}
				onImport={handleImport}
				isImporting={importing}
			/>

			<ManageCategoriesModal
				open={showCategoriesModal}
				onOpenChange={setShowCategoriesModal}
			/>

			<ReviewCategoriesModal
				isOpen={showReviewModal}
				onClose={() => {
					setShowReviewModal(false);
					setPendingTransactions([]);
					setReviewItems([]);
				}}
				items={reviewItems}
				categories={availableCategories}
				onConfirm={handleReviewConfirm}
				isSubmitting={importing}
			/>
		</div>
	);
}
