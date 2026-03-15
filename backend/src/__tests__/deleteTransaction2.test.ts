import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DeleteTransaction } from '../domain/use-cases/DeleteTransaction'
import type { ITransactionRepository } from '../domain/repositories/ITransactionRepository'
import type { Transaction } from '../domain/entities/Transaction'

function createMockRepo (existingIds: Set<string>): ITransactionRepository {
  return {
    async delete (id: string): Promise<boolean> {
      return existingIds.has(id)
    },
    async create (t: Transaction): Promise<Transaction> { return t },
    async findById (): Promise<Transaction | null> { return null },
    async findByUserId (): Promise<Transaction[]> { return [] },
    async update (): Promise<Transaction | null> { return null },
    async bulkUpdateCategories (): Promise<number> { return 0 }
  }
}

describe('DeleteTransaction', () => {
  it('returns true when transaction is deleted', async () => {
    const repo = createMockRepo(new Set(['tx-1', 'tx-2']))
    const useCase = new DeleteTransaction(repo)

    const result = await useCase.execute('tx-1')

    assert.strictEqual(result, true)
  })

  it('returns false when transaction not found', async () => {
    const repo = createMockRepo(new Set(['tx-1']))
    const useCase = new DeleteTransaction(repo)

    const result = await useCase.execute('nonexistent')

    assert.strictEqual(result, false)
  })
})
