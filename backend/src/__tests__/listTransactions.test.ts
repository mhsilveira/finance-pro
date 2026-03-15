import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ListTransactions } from '../domain/use-cases/ListTransactions'
import { Transaction } from '../domain/entities/Transaction'
import type { ITransactionRepository } from '../domain/repositories/ITransactionRepository'

function makeTx (overrides: Partial<{
  id: string
  userId: string
  description: string
  amount: number
  type: 'income' | 'expense'
}>): Transaction {
  return new Transaction(
    overrides.id ?? 'tx-1',
    overrides.userId ?? 'user-1',
    overrides.description ?? 'Test',
    overrides.amount ?? 100,
    overrides.type ?? 'expense',
    'CASH',
    'Outros',
    new Date('2025-06-01'),
    new Date(),
    new Date()
  )
}

function createMockRepo (transactions: Transaction[]): ITransactionRepository & {
  lastUserId: string | null
  lastOptions: { limit?: number; skip?: number } | undefined
} {
  const repo = {
    lastUserId: null as string | null,
    lastOptions: undefined as { limit?: number; skip?: number } | undefined,

    async findByUserId (userId: string, options?: { limit?: number; skip?: number }): Promise<Transaction[]> {
      repo.lastUserId = userId
      repo.lastOptions = options
      return transactions.filter(t => t.userId === userId)
    },

    async create (t: Transaction): Promise<Transaction> { return t },
    async findById (): Promise<Transaction | null> { return null },
    async update (): Promise<Transaction | null> { return null },
    async bulkUpdateCategories (): Promise<number> { return 0 },
    async delete (): Promise<boolean> { return true }
  }
  return repo
}

describe('ListTransactions', () => {
  it('returns all transactions for a user', async () => {
    const transactions = [
      makeTx({ id: 'tx-1', userId: 'user-1' }),
      makeTx({ id: 'tx-2', userId: 'user-1' }),
      makeTx({ id: 'tx-3', userId: 'user-2' }) // different user
    ]

    const repo = createMockRepo(transactions)
    const useCase = new ListTransactions(repo)

    const result = await useCase.execute('user-1')

    assert.strictEqual(result.length, 2)
    assert.ok(result.every(t => t.userId === 'user-1'))
  })

  it('returns empty array when no transactions exist', async () => {
    const repo = createMockRepo([])
    const useCase = new ListTransactions(repo)

    const result = await useCase.execute('user-1')

    assert.deepStrictEqual(result, [])
  })

  it('passes pagination options to repository', async () => {
    const repo = createMockRepo([])
    const useCase = new ListTransactions(repo)

    await useCase.execute('user-1', { limit: 10, skip: 20 })

    assert.strictEqual(repo.lastUserId, 'user-1')
    assert.deepStrictEqual(repo.lastOptions, { limit: 10, skip: 20 })
  })

  it('works without pagination options', async () => {
    const repo = createMockRepo([makeTx({ userId: 'user-1' })])
    const useCase = new ListTransactions(repo)

    await useCase.execute('user-1')

    assert.strictEqual(repo.lastUserId, 'user-1')
    assert.strictEqual(repo.lastOptions, undefined)
  })
})
