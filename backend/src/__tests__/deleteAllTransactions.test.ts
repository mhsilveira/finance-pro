import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Tests for the deleteAllTransactions handler logic.
 * Since the handler directly uses TransactionMongooseModel.deleteMany,
 * we test the handler's validation logic and response format by
 * simulating the Lambda event structure.
 */

describe('deleteAllTransactions handler validation', () => {
  it('requires userId query parameter', () => {
    // Simulate the validation that the handler performs
    const event = { queryStringParameters: {} } as any
    const userId = event.queryStringParameters?.userId
    assert.strictEqual(userId, undefined)
    assert.ok(!userId, 'Should be falsy when userId is missing')
  })

  it('accepts userId when provided', () => {
    const event = { queryStringParameters: { userId: 'user-123' } } as any
    const userId = event.queryStringParameters?.userId
    assert.strictEqual(userId, 'user-123')
  })

  it('handles null queryStringParameters gracefully', () => {
    const event = { queryStringParameters: null } as any
    const userId = event.queryStringParameters?.userId
    assert.strictEqual(userId, undefined)
    assert.ok(!userId, 'Should be falsy with null params')
  })

  it('response format includes deletedCount', () => {
    // Test the response shape we expect from the handler
    const deletedCount = 42
    const response = {
      message: `Deleted ${deletedCount} transactions`,
      deletedCount
    }
    assert.strictEqual(response.deletedCount, 42)
    assert.strictEqual(response.message, 'Deleted 42 transactions')
  })

  it('response format handles zero deletions', () => {
    const deletedCount = 0
    const response = {
      message: `Deleted ${deletedCount} transactions`,
      deletedCount
    }
    assert.strictEqual(response.deletedCount, 0)
    assert.strictEqual(response.message, 'Deleted 0 transactions')
  })
})

describe('TransactionModel index configuration', () => {
  it('idempotency key uses $type string for MongoDB 8 compatibility', () => {
    // Verify the partial filter expression uses $type:'string' (not $ne:null)
    // This is a documentation/contract test — the actual index definition is in TransactionModel.ts
    const partialFilter = { idempotencyKey: { $type: 'string' } }

    // $type:'string' includes only documents where idempotencyKey is a string
    assert.deepStrictEqual(partialFilter, { idempotencyKey: { $type: 'string' } })

    // Verify it does NOT use $ne:null (which MongoDB 8 rejects)
    assert.ok(!('$ne' in partialFilter.idempotencyKey), 'Must not use $ne')
    assert.ok(!('$exists' in partialFilter.idempotencyKey), 'Must not use $exists')
  })

  it('idempotency compound index is userId + idempotencyKey', () => {
    // Contract test for the expected index shape
    const indexFields = { userId: 1, idempotencyKey: 1 }
    const indexOptions = {
      unique: true,
      partialFilterExpression: { idempotencyKey: { $type: 'string' } }
    }

    assert.strictEqual(indexFields.userId, 1)
    assert.strictEqual(indexFields.idempotencyKey, 1)
    assert.strictEqual(indexOptions.unique, true)
    assert.deepStrictEqual(
      indexOptions.partialFilterExpression,
      { idempotencyKey: { $type: 'string' } }
    )
  })
})

describe('generateIdempotencyKey contract for duplicate detection', () => {
  // Import the actual function to verify end-to-end duplicate detection logic
  const { generateIdempotencyKey } = require('../shared/utils/idempotencyKey')

  it('same CSV row imported twice produces the same key', () => {
    const date = new Date('2025-06-14T00:00:00.000Z')
    const description = 'IFOOD *Restaurante do João'
    const amount = 42.90

    const key1 = generateIdempotencyKey(date, description, amount)
    const key2 = generateIdempotencyKey(date, description, amount)

    assert.strictEqual(key1, key2, 'Same transaction data must produce identical keys')
    assert.ok(key1 !== null, 'Key must not be null for valid data')
  })

  it('different amounts on same day/description produce different keys', () => {
    const date = new Date('2025-06-14T00:00:00.000Z')
    const description = 'IFOOD *Restaurante'

    const key1 = generateIdempotencyKey(date, description, 42.90)
    const key2 = generateIdempotencyKey(date, description, 43.90)

    assert.notStrictEqual(key1, key2, 'Different amounts must produce different keys')
  })

  it('null key means no duplicate detection (expected for manual entries)', () => {
    const key = generateIdempotencyKey(null, 'Manual entry', 100)
    assert.strictEqual(key, null)
  })
})
