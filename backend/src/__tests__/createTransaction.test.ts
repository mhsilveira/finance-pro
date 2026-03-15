import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { CreateTransaction } from '../domain/use-cases/CreateTransaction'
import { Transaction } from '../domain/entities/Transaction'
import type { ITransactionRepository } from '../domain/repositories/ITransactionRepository'

interface MockCategoryRepo {
  findByKey: (key: string) => Promise<{ key: string; name: string } | null>
  findByName: (name: string) => Promise<{ key: string; name: string } | null>
}

function createMockTransactionRepo (): ITransactionRepository & { lastCreated: Transaction | null } {
  const repo = {
    lastCreated: null as Transaction | null,
    async create (tx: Transaction): Promise<Transaction> {
      repo.lastCreated = tx
      return tx
    },
    async findById (): Promise<Transaction | null> { return null },
    async findByUserId (): Promise<Transaction[]> { return [] },
    async update (): Promise<Transaction | null> { return null },
    async bulkUpdateCategories (): Promise<number> { return 0 },
    async delete (): Promise<boolean> { return true }
  }
  return repo
}

function createMockCategoryRepo (categories: Array<{ key: string; name: string }>): MockCategoryRepo {
  return {
    async findByKey (key: string) {
      return categories.find(c => c.key.toUpperCase() === key.toUpperCase()) ?? null
    },
    async findByName (name: string) {
      return categories.find(c => c.name === name) ?? null
    }
  }
}

const DEFAULT_CATEGORIES = [
  { key: 'FOOD', name: 'Alimentação' },
  { key: 'INCOME', name: 'Salário' },
  { key: 'TRANSPORT', name: 'Transporte' },
  { key: 'OTHER', name: 'Outros' }
]

describe('CreateTransaction', () => {
  let txRepo: ReturnType<typeof createMockTransactionRepo>
  let catRepo: MockCategoryRepo

  beforeEach(() => {
    txRepo = createMockTransactionRepo()
    catRepo = createMockCategoryRepo(DEFAULT_CATEGORIES)
  })

  it('creates a transaction with valid input', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    const result = await useCase.execute({
      userId: 'user-1',
      description: 'Grocery shopping',
      amount: 150.50,
      type: 'expense',
      origin: 'CASH',
      category: 'FOOD',
      date: new Date('2025-06-15')
    })

    assert.ok(result)
    assert.strictEqual(result.description, 'Grocery shopping')
    assert.strictEqual(result.amount, 150.50)
    assert.strictEqual(result.type, 'expense')
    assert.strictEqual(result.category, 'Alimentação') // uses display name from DB
    assert.strictEqual(result.origin, 'CASH')
    assert.strictEqual(result.userId, 'user-1')
  })

  it('accepts category by display name', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    const result = await useCase.execute({
      userId: 'user-1',
      description: 'Monthly salary',
      amount: 5000,
      type: 'income',
      category: 'Salário',
      date: new Date('2025-06-01')
    })

    assert.strictEqual(result.category, 'Salário')
    assert.strictEqual(result.type, 'income')
  })

  it('throws for invalid category', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    await assert.rejects(
      () => useCase.execute({
        userId: 'user-1',
        description: 'Something',
        amount: 50,
        type: 'expense',
        category: 'NONEXISTENT_CATEGORY',
        date: new Date('2025-06-15')
      }),
      (err: Error) => {
        assert.ok(err.message.includes('Categoria inválida'))
        return true
      }
    )
  })

  it('normalizes string amounts', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    const result = await useCase.execute({
      userId: 'user-1',
      description: 'Test amount normalization',
      amount: '85,50' as unknown as number,
      type: 'expense',
      category: 'OTHER',
      date: new Date('2025-06-15')
    })

    assert.strictEqual(result.amount, 85.50)
  })

  it('sets card only for CREDIT_CARD origin', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    const result = await useCase.execute({
      userId: 'user-1',
      description: 'Card purchase',
      amount: 200,
      type: 'expense',
      origin: 'CREDIT_CARD',
      category: 'FOOD',
      date: new Date('2025-06-15'),
      card: 'Nubank'
    })

    assert.strictEqual(result.origin, 'CREDIT_CARD')
    assert.strictEqual(result.card, 'Nubank')
  })

  it('sets origin to undefined for null origin', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    const result = await useCase.execute({
      userId: 'user-1',
      description: 'No origin',
      amount: 100,
      type: 'expense',
      origin: null,
      category: 'OTHER',
      date: new Date('2025-06-15')
    })

    assert.strictEqual(result.origin, undefined)
  })

  it('rejects empty description via Transaction entity', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    await assert.rejects(
      () => useCase.execute({
        userId: 'user-1',
        description: '',
        amount: 100,
        type: 'expense',
        category: 'OTHER',
        date: new Date('2025-06-15')
      }),
      (err: Error) => {
        assert.ok(err.message.includes('Description is required'))
        return true
      }
    )
  })

  it('rejects zero amount via Transaction entity', async () => {
    const useCase = new CreateTransaction(txRepo, catRepo as never)

    await assert.rejects(
      () => useCase.execute({
        userId: 'user-1',
        description: 'Zero amount',
        amount: 0,
        type: 'expense',
        category: 'OTHER',
        date: new Date('2025-06-15')
      }),
      (err: Error) => {
        assert.ok(err.message.includes('Amount cannot be zero'))
        return true
      }
    )
  })
})
