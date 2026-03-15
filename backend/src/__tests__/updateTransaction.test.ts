import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { UpdateTransaction } from '../domain/use-cases/UpdateTransaction'
import { Transaction } from '../domain/entities/Transaction'
import type { ITransactionRepository } from '../domain/repositories/ITransactionRepository'

function createMockRepo (stored: Map<string, Transaction>): ITransactionRepository & {
  lastUpdateId: string | null
  lastUpdatePartial: Partial<Transaction> | null
} {
  const repo = {
    lastUpdateId: null as string | null,
    lastUpdatePartial: null as Partial<Transaction> | null,

    async update (id: string, partial: Partial<Transaction>): Promise<Transaction | null> {
      repo.lastUpdateId = id
      repo.lastUpdatePartial = partial
      const existing = stored.get(id)
      if (!existing) return null
      // Simulate merge
      return new Transaction(
        existing.id,
        existing.userId,
        partial.description ?? existing.description,
        partial.amount ?? existing.amount,
        partial.type ?? existing.type,
        partial.origin ?? existing.origin,
        partial.category ?? existing.category,
        partial.date ?? existing.date,
        existing.createdAt,
        new Date(),
        partial.card ?? existing.card
      )
    },

    async create (t: Transaction): Promise<Transaction> { return t },
    async findById (): Promise<Transaction | null> { return null },
    async findByUserId (): Promise<Transaction[]> { return [] },
    async bulkUpdateCategories (): Promise<number> { return 0 },
    async delete (): Promise<boolean> { return true }
  }
  return repo
}

describe('UpdateTransaction', () => {
  it('updates a transaction successfully', async () => {
    const tx = new Transaction(
      'tx-1', 'user-1', 'Old description', 100, 'expense', 'CASH', 'Outros',
      new Date('2025-06-01'), new Date(), new Date()
    )
    const stored = new Map([['tx-1', tx]])
    const repo = createMockRepo(stored)
    const useCase = new UpdateTransaction(repo)

    const result = await useCase.execute('tx-1', { description: 'New description', amount: 200 })

    assert.ok(result)
    assert.strictEqual(result.description, 'New description')
    assert.strictEqual(result.amount, 200)
    assert.strictEqual(result.type, 'expense') // unchanged
  })

  it('returns null when transaction not found', async () => {
    const repo = createMockRepo(new Map())
    const useCase = new UpdateTransaction(repo)

    const result = await useCase.execute('nonexistent', { description: 'Updated' })

    assert.strictEqual(result, null)
  })

  it('passes partial fields to repository', async () => {
    const tx = new Transaction(
      'tx-1', 'user-1', 'Test', 100, 'expense', 'CASH', 'Outros',
      new Date('2025-06-01'), new Date(), new Date()
    )
    const stored = new Map([['tx-1', tx]])
    const repo = createMockRepo(stored)
    const useCase = new UpdateTransaction(repo)

    await useCase.execute('tx-1', { category: 'Alimentação' })

    assert.strictEqual(repo.lastUpdateId, 'tx-1')
    assert.strictEqual(repo.lastUpdatePartial?.category, 'Alimentação')
  })
})
