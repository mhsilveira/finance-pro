import { Transaction } from '@domain/entities/Transaction'
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository'
import { Categories } from '@shared/constants/categories'
import { randomBytes } from 'crypto'

function normalizeAmount (val: number | string): number {
  if (typeof val === 'number') return Number(val)
  const s = String(val).replace(',', '.').trim()
  return Number(parseFloat(s))
}

function toMonthYear (d: Date): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export class CreateTransaction {
  constructor (private readonly repo: ITransactionRepository) {}

  async execute (params: {
    userId: string
    description: string
    amount: number | string
    card?: string
    type: 'income' | 'expense'
    origin: 'CREDIT_CARD' | 'CASH'
    category: string
    date: Date
  }): Promise<Transaction> {
    const id = randomBytes(12).toString('hex')

    const amountNumber = normalizeAmount(params.amount)
    const monthYear = toMonthYear(params.date)

    const categoryKey = params.category as keyof typeof Categories
    const categoryName = (Categories as any)[categoryKey] ?? params.category

    const tx = new Transaction(
      id,
      params.userId,
      params.description,
      amountNumber,
      params.type,
      params.origin === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'CASH',
      categoryName,
      params.date,
      new Date(),
      new Date(),
      params.card
    )

    return this.repo.create(tx)
  }
}
