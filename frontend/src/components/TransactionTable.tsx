'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Transaction } from '@/types/transaction'
import { TrashIcon } from '@radix-ui/react-icons'

interface TransactionTableProps {
  transactions: Transaction[]
  onDelete?: (id: string) => void
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Nenhuma transação encontrada
        </h3>
        <p className="text-gray-500">
          Adicione sua primeira transação para começar
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Origem
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  {transaction.card && (
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.card}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {transaction.origin === 'CREDIT_CARD' ? 'Cartão' : 'Dinheiro'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`text-sm font-semibold ${transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 text-center">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Excluir transação"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">
            Total de transações: {transactions.length}
          </span>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500">Receitas</div>
              <div className="text-sm font-semibold text-green-600">
                {formatCurrency(
                  transactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Despesas</div>
              <div className="text-sm font-semibold text-red-600">
                {formatCurrency(
                  transactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Saldo</div>
              <div className="text-sm font-semibold text-blue-600">
                {formatCurrency(
                  transactions.reduce((sum, t) => {
                    return t.type === 'income'
                      ? sum + t.amount
                      : sum - t.amount
                  }, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}