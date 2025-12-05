import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  type PaginatedResponse,
  type CreateTransactionPayload,
} from '@/services/api'
import type { Transaction } from '@/types/transaction'

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (userId: string, filters?: any) =>
    [...transactionKeys.lists(), { userId, ...filters }] as const,
  paginated: (userId: string, page: number, limit: number) =>
    [...transactionKeys.lists(), 'paginated', { userId, page, limit }] as const,
  allByUser: (userId: string) =>
    [...transactionKeys.lists(), 'all', userId] as const,
}

// Hook for paginated transactions
export function usePaginatedTransactions(
  userId: string,
  page: number,
  limit: number
) {
  return useQuery({
    queryKey: transactionKeys.paginated(userId, page, limit),
    queryFn: () => getTransactions(userId, { page, limit }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for all transactions (for filters, stats, export)
export function useAllTransactions(userId: string) {
  return useQuery({
    queryKey: transactionKeys.allByUser(userId),
    queryFn: () => getAllTransactions(userId),
    staleTime: 60 * 1000, // 1 minute
  })
}

// Hook for creating transactions
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),
    onSuccess: (_, variables) => {
      // Invalidate both paginated and all transactions
      queryClient.invalidateQueries({
        queryKey: transactionKeys.allByUser(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      })
    },
  })
}

// Hook for deleting transactions
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteTransaction(id),
    onSuccess: (_, variables) => {
      // Invalidate both paginated and all transactions
      queryClient.invalidateQueries({
        queryKey: transactionKeys.allByUser(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      })
    },
  })
}
