'use client'

import { useState, useRef } from 'react'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { TransactionTable } from '@/components/TransactionTable'
import { DevTools } from '@/components/DevTools'
import type { Transaction } from '@/types/transaction'
import { exportTransactionsToCSV, parseCSV, downloadCSVTemplate } from '@/services/csv'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { usePaginatedTransactions, useAllTransactions, useDeleteTransaction, useCreateTransaction } from '@/hooks/useTransactions'

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [originFilter, setOriginFilter] = useState<'all' | 'CREDIT_CARD' | 'CASH'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // CSV Import
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userId = 'blanchimaah'

  // React Query hooks
  const { data: paginatedData, isLoading, error: queryError, refetch: refetchPaginated } = usePaginatedTransactions(userId, currentPage, pageSize)
  const { data: allTransactions = [], refetch: refetchAll } = useAllTransactions(userId)
  const deleteMutation = useDeleteTransaction()
  const createMutation = useCreateTransaction()

  const loading = isLoading
  const error = queryError ? (queryError as Error).message : ''

  const refetchTransactions = async () => {
    await Promise.all([refetchPaginated(), refetchAll()])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync({ id, userId })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir transação')
    }
  }

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)

    try {
      const text = await file.text()
      const newTransactions = parseCSV(text)

      let successCount = 0
      let errorCount = 0

      for (const transaction of newTransactions) {
        try {
          await createMutation.mutateAsync(transaction)
          successCount++
        } catch (err) {
          errorCount++
          console.error('Erro ao importar transação:', err)
        }
      }

      alert(
        `Importação concluída!\n${successCount} transações importadas com sucesso.\n${errorCount} erros.`
      )

      await refetchTransactions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao importar CSV')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Apply filters to all transactions (for stats and export)
  const filteredTransactions = allTransactions.filter((t) => {
    // Search filter
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) {
      return false
    }

    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) {
      return false
    }

    // Origin filter
    if (originFilter !== 'all' && t.origin !== originFilter) {
      return false
    }

    // Date range filter
    if (dateFrom && new Date(t.date) < new Date(dateFrom)) {
      return false
    }
    if (dateTo && new Date(t.date) > new Date(dateTo)) {
      return false
    }

    return true
  })

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(allTransactions.map(t => t.category).filter(Boolean)))

  // Calcular estatísticas (using filtered transactions)
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const stats = {
    total: filteredTransactions.length,
    income,
    expense,
    balance: income - expense
  }

  // Transactions to display (either paginated or filtered)
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || originFilter !== 'all' || dateFrom || dateTo
  const displayTransactions = hasActiveFilters ? filteredTransactions : (paginatedData?.data || [])

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setOriginFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-100">
                Transações
              </h1>
              <p className="mt-2 text-gray-400">
                Gerencie suas receitas e despesas de forma inteligente
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Export/Import Buttons */}
              <Button
                onClick={handleExport}
                disabled={allTransactions.length === 0}
                variant="outline"
                className="hover:border-green-500/50"
              >
                <span>📥</span>
                <span>Exportar CSV</span>
              </Button>

              <Button
                onClick={handleImportClick}
                disabled={importing}
                variant="outline"
                className="hover:border-yellow-500/50"
              >
                <span>📤</span>
                <span>{importing ? 'Importando...' : 'Importar CSV'}</span>
              </Button>

              <Button
                onClick={downloadCSVTemplate}
                variant="outline"
              >
                <span>📄</span>
                <span>Modelo CSV</span>
              </Button>

              <AddTransactionModal
                userId={userId}
                onSuccess={refetchTransactions}
              />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {!loading && !error && allTransactions.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
                Filtros
              </h2>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Buscar
                </label>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Descrição..."
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Tipo
                </label>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                >
                  <option value="all">Todos</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Categoria
                </label>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Origin Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Origem
                </label>
                <Select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value as 'all' | 'CREDIT_CARD' | 'CASH')}
                >
                  <option value="all">Todas</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="CASH">Dinheiro</option>
                </Select>
              </div>

              {/* Date Range */}
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Período
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="De"
                    className="flex-1 min-w-0"
                    title="Data inicial"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1"
                    title="Data final"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 text-sm text-gray-400">
                Exibindo <span className="text-yellow-400 font-semibold tabular-nums">{stats.total}</span> de <span className="tabular-nums">{allTransactions.length}</span> transações
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && allTransactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-semibold text-gray-100 mt-2 tabular-nums">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Receitas</p>
                  <p className="text-2xl font-semibold text-green-400 mt-2 tabular-nums">
                    {formatCurrency(stats.income)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-red-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Despesas</p>
                  <p className="text-2xl font-semibold text-red-400 mt-2 tabular-nums">
                    {formatCurrency(stats.expense)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-yellow-500/50 rounded-lg p-6 hover:border-yellow-500 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400 uppercase tracking-wide">Saldo</p>
                  <p className="text-2xl font-semibold text-gray-100 mt-2 tabular-nums">
                    {formatCurrency(stats.balance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && <TableSkeleton rows={10} />}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-base font-semibold text-red-400">
                  Erro ao carregar transações
                </h3>
                <div className="mt-2 text-sm text-red-300">
                  {error}
                </div>
                <Button
                  onClick={refetchTransactions}
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            {displayTransactions.length > 0 ? (
              <>
                <TransactionTable
                  transactions={displayTransactions}
                  onDelete={handleDelete}
                />

                {/* Pagination - only show when no filters are active */}
                {!hasActiveFilters && paginatedData && (
                  <div className="mt-6">
                    {/* Page size selector */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Exibir</span>
                        <Select
                          value={pageSize.toString()}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                          className="w-20 h-8"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
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
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>

                            {/* Page numbers logic */}
                            {(() => {
                              const { totalPages } = paginatedData.pagination
                              const pages: (number | 'ellipsis')[] = []

                              if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(i)
                                }
                              } else {
                                pages.push(1)

                                if (currentPage > 3) {
                                  pages.push('ellipsis')
                                }

                                const start = Math.max(2, currentPage - 1)
                                const end = Math.min(totalPages - 1, currentPage + 1)

                                for (let i = start; i <= end; i++) {
                                  pages.push(i)
                                }

                                if (currentPage < totalPages - 2) {
                                  pages.push('ellipsis')
                                }

                                pages.push(totalPages)
                              }

                              return pages.map((page, idx) => (
                                <PaginationItem key={idx}>
                                  {page === 'ellipsis' ? (
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
                              ))
                            })()}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setCurrentPage(p => Math.min(paginatedData.pagination.totalPages, p + 1))}
                                disabled={!paginatedData.pagination.hasMore}
                                className={!paginatedData.pagination.hasMore ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}

                    {/* Pagination info */}
                    <div className="mt-4 text-center text-sm text-gray-400">
                      Exibindo {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, paginatedData.pagination.total)} de {paginatedData.pagination.total} transações
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 mb-4">
                  {hasActiveFilters
                    ? 'Nenhuma transação encontrada com os filtros aplicados'
                    : 'Nenhuma transação encontrada'
                  }
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dev Tools - Botão flutuante */}
      <DevTools userId={userId} onUpdate={refetchTransactions} />
    </div>
  )
}