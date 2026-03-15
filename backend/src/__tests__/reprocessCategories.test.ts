import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ReprocessCategories } from '../domain/use-cases/ReprocessCategories'
import { Transaction } from '../domain/entities/Transaction'
import type { ITransactionRepository } from '../domain/repositories/ITransactionRepository'

function makeTx (overrides: Partial<{
  id: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
}>): Transaction {
  return new Transaction(
    overrides.id ?? 'tx-1',
    'user-1',
    overrides.description ?? 'Test Transaction',
    overrides.amount ?? 100,
    overrides.type ?? 'expense',
    'CASH',
    overrides.category ?? 'Outros',
    new Date('2025-06-01'),
    new Date(),
    new Date()
  )
}

function createMockRepository (transactions: Transaction[]): ITransactionRepository & {
  bulkUpdates: Array<{ id: string; category: string }>
  updateCalls: number
} {
  const repo = {
    bulkUpdates: [] as Array<{ id: string; category: string }>,
    updateCalls: 0,

    async findByUserId (): Promise<Transaction[]> {
      return transactions
    },

    async bulkUpdateCategories (updates: Array<{ id: string; category: string }>): Promise<number> {
      repo.bulkUpdates = updates
      return updates.length
    },

    // Should NOT be called by the new implementation
    async update (): Promise<Transaction | null> {
      repo.updateCalls++
      return null
    },

    async create (t: Transaction): Promise<Transaction> { return t },
    async findById (): Promise<Transaction | null> { return null },
    async delete (): Promise<boolean> { return true }
  }
  return repo
}

const RULES = [
  { name: 'Alimentação', keywords: ['IFOOD', 'RAPPI', 'MERCADO'], sortOrder: 13 },
  { name: 'Transporte', keywords: ['UBER', 'TAXI', 'POSTO'], sortOrder: 12 },
  { name: 'Assinaturas', keywords: ['NETFLIX', 'SPOTIFY'], sortOrder: 11 }
]

describe('ReprocessCategories', () => {
  it('uses bulkUpdateCategories instead of individual update calls', async () => {
    const transactions = [
      makeTx({ id: 'tx-1', description: 'IFOOD Restaurante', category: 'Outros' }),
      makeTx({ id: 'tx-2', description: 'UBER Trip', category: 'Outros' }),
      makeTx({ id: 'tx-3', description: 'NETFLIX Premium', category: 'Outros' })
    ]

    const repo = createMockRepository(transactions)
    const useCase = new ReprocessCategories(repo)

    const result = await useCase.execute('user-1', [], RULES)

    // All 3 should be updated
    assert.strictEqual(result.total, 3)
    assert.strictEqual(result.updated, 3)
    assert.strictEqual(result.unchanged, 0)

    // Should use bulkUpdateCategories, NOT individual update calls
    assert.strictEqual(repo.bulkUpdates.length, 3, 'Should have 3 bulk updates')
    assert.strictEqual(repo.updateCalls, 0, 'Should NOT call individual update()')

    // Verify the correct categories were assigned
    const updateMap = new Map(repo.bulkUpdates.map(u => [u.id, u.category]))
    assert.strictEqual(updateMap.get('tx-1'), 'Alimentação')
    assert.strictEqual(updateMap.get('tx-2'), 'Transporte')
    assert.strictEqual(updateMap.get('tx-3'), 'Assinaturas')
  })

  it('does not update transactions that already have the correct category', async () => {
    const transactions = [
      makeTx({ id: 'tx-1', description: 'IFOOD Restaurante', category: 'Alimentação' }), // already correct
      makeTx({ id: 'tx-2', description: 'UBER Trip', category: 'Outros' }) // needs update
    ]

    const repo = createMockRepository(transactions)
    const useCase = new ReprocessCategories(repo)

    const result = await useCase.execute('user-1', [], RULES)

    assert.strictEqual(result.total, 2)
    assert.strictEqual(result.updated, 1)
    assert.strictEqual(result.unchanged, 1)
    assert.strictEqual(repo.bulkUpdates.length, 1)
    assert.strictEqual(repo.bulkUpdates[0].id, 'tx-2')
    assert.strictEqual(repo.bulkUpdates[0].category, 'Transporte')
  })

  it('does not call bulkUpdate when no changes needed', async () => {
    const transactions = [
      makeTx({ id: 'tx-1', description: 'IFOOD', category: 'Alimentação' }),
      makeTx({ id: 'tx-2', description: 'UBER', category: 'Transporte' })
    ]

    const repo = createMockRepository(transactions)
    const useCase = new ReprocessCategories(repo)

    const result = await useCase.execute('user-1', [], RULES)

    assert.strictEqual(result.total, 2)
    assert.strictEqual(result.updated, 0)
    assert.strictEqual(result.unchanged, 2)
    assert.strictEqual(repo.bulkUpdates.length, 0)
    assert.strictEqual(repo.updateCalls, 0)
  })

  it('handles empty transaction list gracefully', async () => {
    const repo = createMockRepository([])
    const useCase = new ReprocessCategories(repo)

    const result = await useCase.execute('user-1', [], RULES)

    assert.strictEqual(result.total, 0)
    assert.strictEqual(result.updated, 0)
    assert.strictEqual(result.unchanged, 0)
  })

  it('applies user corrections with higher priority than keyword rules', async () => {
    const transactions = [
      makeTx({ id: 'tx-1', description: 'UBER TRIP SP', category: 'Transporte' })
    ]

    const corrections = [
      { descriptionPattern: 'UBER', category: 'Lazer' }
    ]

    const repo = createMockRepository(transactions)
    const useCase = new ReprocessCategories(repo)

    const result = await useCase.execute('user-1', corrections, RULES)

    assert.strictEqual(result.updated, 1)
    assert.strictEqual(repo.bulkUpdates[0].category, 'Lazer')
  })

  it('handles large transaction batches (performance test)', async () => {
    // Simulate 500 transactions
    const transactions = Array.from({ length: 500 }, (_, i) =>
      makeTx({
        id: `tx-${i}`,
        description: i % 2 === 0 ? `IFOOD Order ${i}` : `Compra aleatoria ${i}`,
        category: 'Outros'
      })
    )

    const repo = createMockRepository(transactions)
    const useCase = new ReprocessCategories(repo)

    const start = Date.now()
    const result = await useCase.execute('user-1', [], RULES)
    const elapsed = Date.now() - start

    assert.strictEqual(result.total, 500)
    // 250 IFOOD (even indices) should be updated, 250 random should stay Outros
    assert.strictEqual(result.updated, 250)
    assert.strictEqual(result.unchanged, 250)

    // The key assertion: bulkUpdate is called ONCE with 250 items, not 250 individual updates
    assert.strictEqual(repo.bulkUpdates.length, 250)
    assert.strictEqual(repo.updateCalls, 0, 'No individual update calls should be made')

    // Should be fast since it's all in-memory (no N+1 DB calls)
    assert.ok(elapsed < 1000, `Should complete in under 1 second, took ${elapsed}ms`)
  })
})
