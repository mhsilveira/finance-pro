'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { CATEGORIES, type CategoryKey, type CreateTransactionPayload } from '../types/transaction'
import { createTransaction } from '../services/api'

interface AddTransactionModalProps {
  userId: string
  onSuccess?: () => void
}

export function AddTransactionModal({ userId, onSuccess }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Omit<CreateTransactionPayload, 'userId'>>({
    description: '',
    amount: '',
    type: 'expense',
    origin: 'CASH',
    category: 'OTHER',
    date: new Date().toISOString().split('T')[0],
    card: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: CreateTransactionPayload = {
        ...formData,
        userId,
        card: formData.origin === 'CREDIT_CARD' && formData.card ? formData.card : undefined
      }

      await createTransaction(payload)

      // Reset form
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        origin: 'CASH',
        category: 'OTHER',
        date: new Date().toISOString().split('T')[0],
        card: ''
      })

      setOpen(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold shadow-lg shadow-yellow-500/20">
          + Nova Transação
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold text-gray-100 mb-6 uppercase tracking-wide">
            Nova Transação
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Descrição *
              </label>
              <input
                id="description"
                type="text"
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-gray-100 placeholder-gray-500 transition-all"
                placeholder="Ex: Compras no supermercado"
              />
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Valor (R$) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-gray-100 placeholder-gray-500 tabular-nums transition-all"
                placeholder="0,00"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Tipo *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-4 h-4 text-yellow-500 accent-yellow-500"
                  />
                  <span className="text-sm text-gray-100">Despesa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={(e) => handleChange('type', e.target.value)}
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
              <select
                id="origin"
                value={formData.origin}
                onChange={(e) => handleChange('origin', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-gray-100 transition-all"
              >
                <option value="CASH">Dinheiro</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
              </select>
            </div>

            {/* Card (condicional) */}
            {formData.origin === 'CREDIT_CARD' && (
              <div>
                <label htmlFor="card" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Cartão
                </label>
                <input
                  id="card"
                  type="text"
                  value={formData.card}
                  onChange={(e) => handleChange('card', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-gray-100 placeholder-gray-500 transition-all"
                  placeholder="Nome do cartão"
                />
              </div>
            )}

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Categoria *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-gray-100 transition-all"
              >
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Data *
              </label>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-gray-100 transition-all"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-gray-100 rounded-lg hover:bg-slate-700 transition-all font-medium"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}