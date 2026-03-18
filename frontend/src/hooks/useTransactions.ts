import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getTransactions,
	getAllTransactions,
	createTransaction,
	updateTransaction,
	deleteTransaction,
	getCategories,
	getCategoryCorrections,
	getTransactionStats,
	type PaginatedResponse,
	type CreateTransactionPayload,
	type TransactionStats,
} from "@/services/api";
import type { Transaction, Category } from "@/types/transaction";

export const transactionKeys = {
	all: ["transactions"] as const,
	lists: () => [...transactionKeys.all, "list"] as const,
	list: (userId: string, filters?: any) => [...transactionKeys.lists(), { userId, ...filters }] as const,
	paginated: (userId: string, page: number, limit: number) =>
		[...transactionKeys.lists(), "paginated", { userId, page, limit }] as const,
	allByUser: (userId: string) => [...transactionKeys.lists(), "all", userId] as const,
	stats: (userId: string, filters?: { monthFrom?: string; monthTo?: string }) =>
		[...transactionKeys.all, "stats", { userId, ...filters }] as const,
};

export function usePaginatedTransactions(userId: string, page: number, limit: number) {
	return useQuery({
		queryKey: transactionKeys.paginated(userId, page, limit),
		queryFn: () => getTransactions(userId, { page, limit }),
		staleTime: 30 * 1000,
	});
}

export function useAllTransactions(userId: string) {
	return useQuery({
		queryKey: transactionKeys.allByUser(userId),
		queryFn: () => getAllTransactions(userId),
		staleTime: 60 * 1000,
	});
}

export const categoryKeys = {
	all: ["categories"] as const,
	byType: (type?: "income" | "expense") => [...categoryKeys.all, { type }] as const,
};

export const correctionKeys = {
	all: ["category-corrections"] as const,
	byUser: (userId: string) => [...correctionKeys.all, userId] as const,
};

export function useCategories(type?: "income" | "expense") {
	return useQuery({
		queryKey: categoryKeys.byType(type),
		queryFn: () => getCategories(type),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCategoryCorrections(userId: string) {
	return useQuery({
		queryKey: correctionKeys.byUser(userId),
		queryFn: () => getCategoryCorrections(userId),
		staleTime: 60 * 1000,
	});
}

export function useTransactionStats(userId: string, filters?: { monthFrom?: string; monthTo?: string }) {
	return useQuery({
		queryKey: transactionKeys.stats(userId, filters),
		queryFn: () => getTransactionStats(userId, filters),
		staleTime: 30 * 1000,
	});
}

export function useCreateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateTransactionPayload) => createTransaction(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: transactionKeys.allByUser(variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: transactionKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: ["transactions", "stats"],
			});
		},
	});
}

export function useUpdateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, userId, payload }: { id: string; userId: string; payload: Partial<CreateTransactionPayload> }) =>
			updateTransaction(id, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: transactionKeys.allByUser(variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: transactionKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: ["transactions", "stats"],
			});
		},
	});
}

export function useDeleteTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, userId }: { id: string; userId: string }) => deleteTransaction(id),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: transactionKeys.allByUser(variables.userId),
			});
			queryClient.invalidateQueries({
				queryKey: transactionKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: ["transactions", "stats"],
			});
		},
	});
}
