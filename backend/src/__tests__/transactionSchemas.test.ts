import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createTransactionSchema, updateTransactionSchema } from '../application/validators/transactionSchemas'

describe('createTransactionSchema', () => {
  const validPayload = {
    userId: 'user-1',
    description: 'Grocery shopping',
    amount: 150.50,
    type: 'expense' as const,
    category: 'Alimentação',
    date: '2025-06-15T00:00:00.000Z',
    origin: 'CASH' as const,
    card: undefined
  }

  it('accepts valid input', () => {
    const result = createTransactionSchema.safeParse(validPayload)
    assert.strictEqual(result.success, true)
  })

  it('accepts amount as string with comma', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      amount: '85,50'
    })
    assert.strictEqual(result.success, true)
    if (result.success) {
      assert.strictEqual(result.data.amount, '85.50')
    }
  })

  it('accepts amount as number', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      amount: 100
    })
    assert.strictEqual(result.success, true)
  })

  it('rejects empty userId', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      userId: ''
    })
    assert.strictEqual(result.success, false)
  })

  it('rejects empty description', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      description: ''
    })
    assert.strictEqual(result.success, false)
  })

  it('rejects invalid type', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      type: 'transfer'
    })
    assert.strictEqual(result.success, false)
  })

  it('rejects empty category', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      category: ''
    })
    assert.strictEqual(result.success, false)
  })

  it('rejects invalid date', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      date: 'not-a-date'
    })
    assert.strictEqual(result.success, false)
  })

  it('accepts date in YYYY-MM-DD format', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      date: '2025-06-15'
    })
    assert.strictEqual(result.success, true)
  })

  it('requires card when origin is CREDIT_CARD', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      origin: 'CREDIT_CARD',
      card: undefined
    })
    assert.strictEqual(result.success, false)
  })

  it('accepts card when origin is CREDIT_CARD', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      origin: 'CREDIT_CARD',
      card: 'Nubank'
    })
    assert.strictEqual(result.success, true)
  })

  it('accepts null origin', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      origin: null
    })
    assert.strictEqual(result.success, true)
  })

  it('rejects amount with too many decimal places', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      amount: '10.999'
    })
    assert.strictEqual(result.success, false)
  })

  it('rejects negative amount string', () => {
    const result = createTransactionSchema.safeParse({
      ...validPayload,
      amount: '-50'
    })
    assert.strictEqual(result.success, false)
  })
})

describe('updateTransactionSchema', () => {
  it('accepts partial update with description only', () => {
    const result = updateTransactionSchema.safeParse({
      description: 'Updated description'
    })
    assert.strictEqual(result.success, true)
  })

  it('accepts partial update with amount only', () => {
    const result = updateTransactionSchema.safeParse({
      amount: 200
    })
    assert.strictEqual(result.success, true)
  })

  it('accepts partial update with type only', () => {
    const result = updateTransactionSchema.safeParse({
      type: 'income'
    })
    assert.strictEqual(result.success, true)
  })

  it('accepts partial update with category only', () => {
    const result = updateTransactionSchema.safeParse({
      category: 'Transporte'
    })
    assert.strictEqual(result.success, true)
  })

  it('accepts partial update with date only', () => {
    const result = updateTransactionSchema.safeParse({
      date: '2025-07-01'
    })
    assert.strictEqual(result.success, true)
  })

  it('rejects empty object (no fields)', () => {
    const result = updateTransactionSchema.safeParse({})
    assert.strictEqual(result.success, false)
  })

  it('rejects invalid type in update', () => {
    const result = updateTransactionSchema.safeParse({
      type: 'transfer'
    })
    assert.strictEqual(result.success, false)
  })

  it('accepts multiple fields at once', () => {
    const result = updateTransactionSchema.safeParse({
      description: 'Updated',
      amount: 300,
      type: 'expense'
    })
    assert.strictEqual(result.success, true)
  })

  it('accepts amount as string with comma', () => {
    const result = updateTransactionSchema.safeParse({
      amount: '150,00'
    })
    assert.strictEqual(result.success, true)
  })

  it('rejects empty description', () => {
    const result = updateTransactionSchema.safeParse({
      description: ''
    })
    assert.strictEqual(result.success, false)
  })
})
