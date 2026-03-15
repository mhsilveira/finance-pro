import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GetTransaction } from '../domain/use-cases/GetTransaction'
import { Transaction } from '../domain/entities/Transaction'
import type { ITransactionRepository } from '../domain/repositories/ITransactionRepository'

function createMockRepo (stored: Transaction | null): ITransactionRepository {
  return {
    async findById (id: string): Promise<Transaction | null> {
      if (stored && stored.id === id) return stored
      return null
    },
    async create (t: Transaction): Promise<Transaction> { return t },
    async findByUserId (): Promise<Transaction[]> { return [] },
    async update (): Promise<Transaction | null> { return null },
    async bulkUpdateCategories (): Promise<number> { return 0 },
    async delete (): Promise<boolean> { return true }
  }
}

describe('GetTransaction', () => {
  it('returns transaction when found', async () => {
    const tx = new Transaction(
      'tx-1', 'user-1', 'Grocery', 50, 'expense', 'CASH', 'Alimentação',
      new Date('2025-06-01'), new Date(), new Date()
    )

    const repo = createMockRepo(tx)
    const useCase = new GetTransaction(repo)

    const result = await useCase.execute('tx-1')

    assert.ok(result)
    assert.strictEqual(result.id, 'tx-1')
    assert.strictEqual(result.description, 'Grocery')
  })

  it('returns null when transaction not found', async () => {
    const repo = createMockRepo(null)
    const useCase = new GetTransaction(repo)

    const result = await useCase.execute('nonexistent')

    assert.strictEqual(result, null)
  })
})
