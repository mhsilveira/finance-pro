// src/types/transaction.ts
export interface Transaction {
  id: string
  userId: string
  description: string
  amount: number
  type: 'income' | 'expense'
  origin: 'CREDIT_CARD' | 'CASH'
  category: string
  date: string // YYYY-MM-DD
  monthYear: string // YYYY-MM
  card?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionPayload {
  userId: string
  description: string
  amount: number | string
  type: 'income' | 'expense'
  origin: 'CREDIT_CARD' | 'CASH'
  category: string
  date: string // YYYY-MM-DD
  card?: string
}

export const CATEGORIES = {
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  ENTERTAINMENT: 'Entretenimento',
  SHOPPING: 'Compras',
  BILLS: 'Contas',
  SALARY: 'Salário',
  INVESTMENT: 'Investimento',
  OTHER: 'Outros'
} as const

export type CategoryKey = keyof typeof CATEGORIES
