import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Transaction } from '../domain/entities/Transaction'

describe('Transaction Entity', () => {
  it('creates a valid transaction', () => {
    const tx = new Transaction(
      'tx-1', 'user-1', 'Grocery', 50.00, 'expense', 'CASH', 'Alimentação',
      new Date('2025-06-01'), new Date(), new Date()
    )

    assert.strictEqual(tx.id, 'tx-1')
    assert.strictEqual(tx.description, 'Grocery')
    assert.strictEqual(tx.amount, 50)
    assert.strictEqual(tx.type, 'expense')
  })

  it('throws if description is empty', () => {
    assert.throws(
      () => new Transaction('tx-1', 'user-1', '', 100, 'expense'),
      (err: Error) => {
        assert.ok(err.message.includes('Description is required'))
        return true
      }
    )
  })

  it('throws if description is whitespace only', () => {
    assert.throws(
      () => new Transaction('tx-1', 'user-1', '   ', 100, 'expense'),
      (err: Error) => {
        assert.ok(err.message.includes('Description is required'))
        return true
      }
    )
  })

  it('throws if amount is zero', () => {
    assert.throws(
      () => new Transaction('tx-1', 'user-1', 'Test', 0, 'expense'),
      (err: Error) => {
        assert.ok(err.message.includes('Amount cannot be zero'))
        return true
      }
    )
  })

  it('throws if type is invalid', () => {
    assert.throws(
      () => new Transaction('tx-1', 'user-1', 'Test', 100, 'invalid' as 'income'),
      (err: Error) => {
        assert.ok(err.message.includes('Type must be income or expense'))
        return true
      }
    )
  })

  it('isIncome returns true for income type', () => {
    const tx = new Transaction('tx-1', 'user-1', 'Salary', 5000, 'income')
    assert.strictEqual(tx.isIncome(), true)
    assert.strictEqual(tx.isExpense(), false)
  })

  it('isExpense returns true for expense type', () => {
    const tx = new Transaction('tx-1', 'user-1', 'Grocery', 50, 'expense')
    assert.strictEqual(tx.isExpense(), true)
    assert.strictEqual(tx.isIncome(), false)
  })

  it('allows null dates', () => {
    const tx = new Transaction('tx-1', 'user-1', 'Test', 100, 'expense', 'CASH', 'Outros', null, null, null)
    assert.strictEqual(tx.date, null)
    assert.strictEqual(tx.createdAt, null)
    assert.strictEqual(tx.updatedAt, null)
  })

  it('allows negative amounts (for expenses)', () => {
    const tx = new Transaction('tx-1', 'user-1', 'Refund', -50, 'expense')
    assert.strictEqual(tx.amount, -50)
  })

  it('allows optional card field', () => {
    const tx = new Transaction('tx-1', 'user-1', 'Card purchase', 100, 'expense', 'CREDIT_CARD', 'Outros', null, null, null, 'Nubank')
    assert.strictEqual(tx.card, 'Nubank')
  })
})
