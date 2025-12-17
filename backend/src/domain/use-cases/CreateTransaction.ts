import { Transaction } from '@domain/entities/Transaction'
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository'
import { randomBytes } from 'crypto'
import { CategoryRepository } from '@infrastructure/database/mongodb/repositories/CategoryRepository'

function normalizeAmount (val: number | string): number {
  if (typeof val === 'number') return Number(val)
  const s = String(val).replace(',', '.').trim()
  return Number(parseFloat(s))
}

export class CreateTransaction {
  constructor (
    private readonly repo: ITransactionRepository,
    private readonly categoryRepo: CategoryRepository
  ) {}

  async execute (params: {
    userId: string
    description: string
    amount: number | string
    card?: string
    type: 'income' | 'expense'
    origin?: 'CREDIT_CARD' | 'CASH' | null
    category: string
    date: Date
  }): Promise<Transaction> {
    // Validar se a categoria existe (busca por key ou name)
    let category = await this.categoryRepo.findByKey(params.category)
    if (!category) {
      category = await this.categoryRepo.findByName(params.category)
    }
    if (!category) {
      throw new Error(`Categoria inválida: ${params.category}`)
    }

    const id = randomBytes(12).toString('hex')
    const amountNumber = normalizeAmount(params.amount)

    const tx = new Transaction(
      id,
      params.userId,
      params.description,
      amountNumber,
      params.type,
      params.origin === 'CREDIT_CARD' ? 'CREDIT_CARD' : params.origin === 'CASH' ? 'CASH' : undefined,
      category.name, // Usa o nome da categoria do banco
      params.date,
      new Date(),
      new Date(),
      params.card
    )

    return this.repo.create(tx)
  }
}
