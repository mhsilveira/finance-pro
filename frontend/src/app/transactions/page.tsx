'use client'

import { useEffect, useState, useRef } from 'react'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { TransactionTable } from '@/components/TransactionTable'
import { DevTools } from '@/components/DevTools'
import type { Transaction } from '@/types/transaction'
import { deleteTransaction, getTransactions, createTransaction } from '@/services/api'
import { exportTransactionsToCSV, parseCSV, downloadCSVTemplate } from '@/services/csv'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getTransactions(userId)
        console.log('Transações recebidas:', data) // Debug
        setTransactions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const refetchTransactions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getTransactions(userId)
      console.log('Transações recebidas:', data) // Debug
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return
    }

    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
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
          await createTransaction(transaction)
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

  // Apply filters
  const filteredTransactions = transactions.filter((t) => {
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
  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)))

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

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setOriginFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || originFilter !== 'all' || dateFrom || dateTo

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
              <button
                onClick={handleExport}
                disabled={transactions.length === 0}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-gray-100 rounded-lg hover:border-green-500/50 hover:bg-slate-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>📥</span>
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={handleImportClick}
                disabled={importing}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-gray-100 rounded-lg hover:border-yellow-500/50 hover:bg-slate-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>📤</span>
                <span>{importing ? 'Importando...' : 'Importar CSV'}</span>
              </button>

              <button
                onClick={downloadCSVTemplate}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-gray-100 rounded-lg hover:border-slate-600 hover:bg-slate-700 transition-all font-medium flex items-center gap-2"
              >
                <span>📄</span>
                <span>Modelo CSV</span>
              </button>

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
        {!loading && !error && transactions.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 uppercase tracking-wide">
                Filtros
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Descrição..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 placeholder-gray-500 transition-all"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Tipo
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 transition-all"
                >
                  <option value="all">Todos</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Categoria
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 transition-all"
                >
                  <option value="all">Todas</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Origin Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Origem
                </label>
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value as 'all' | 'CREDIT_CARD' | 'CASH')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 transition-all"
                >
                  <option value="all">Todas</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="CASH">Dinheiro</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Período
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="De"
                    className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 transition-all"
                    title="Data inicial"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-100 transition-all"
                    title="Data final"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 text-sm text-gray-400">
                Exibindo <span className="text-yellow-400 font-semibold tabular-nums">{stats.total}</span> de <span className="tabular-nums">{transactions.length}</span> transações
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && transactions.length > 0 && (
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
        {loading && (
          <div className="flex flex-col justify-center items-center py-16 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mb-4" />
            <p className="text-gray-400 font-medium">Carregando transações...</p>
          </div>
        )}

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
                <button
                  onClick={refetchTransactions}
                  className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            {filteredTransactions.length > 0 ? (
              <TransactionTable
                transactions={filteredTransactions}
                onDelete={handleDelete}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 mb-4">
                  Nenhuma transação encontrada com os filtros aplicados
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold"
                >
                  Limpar Filtros
                </button>
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