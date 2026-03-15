import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateIdempotencyKey } from '../shared/utils/idempotencyKey'

describe('generateIdempotencyKey', () => {
  it('returns null when date is null', () => {
    const result = generateIdempotencyKey(null, 'some description', 100)
    assert.strictEqual(result, null)
  })

  it('returns null when description is empty', () => {
    const result = generateIdempotencyKey(new Date('2025-06-14'), '', 100)
    assert.strictEqual(result, null)
  })

  it('generates a 16-char hex hash', () => {
    const date = new Date('2025-06-14T00:00:00.000Z')
    const result = generateIdempotencyKey(date, 'IFOOD RESTAURANTE', 42.5)
    assert.ok(result !== null)
    assert.strictEqual(result!.length, 16)
    assert.match(result!, /^[0-9a-f]{16}$/)
  })

  it('is case-insensitive (normalizes to uppercase)', () => {
    const date = new Date('2025-01-01T00:00:00.000Z')
    const key1 = generateIdempotencyKey(date, 'netflix premium', 29.9)
    const key2 = generateIdempotencyKey(date, 'NETFLIX PREMIUM', 29.9)
    assert.strictEqual(key1, key2)
  })

  it('handles descriptions shorter than 7 characters', () => {
    const date = new Date('2025-03-15T00:00:00.000Z')
    const result = generateIdempotencyKey(date, 'PIX', 500)
    assert.ok(result !== null)
    assert.strictEqual(result!.length, 16)
  })

  it('is deterministic: same inputs always produce the same key', () => {
    const date = new Date('2025-08-20T00:00:00.000Z')
    const desc = 'Compra no débito - Supermercado XYZ'
    const amount = 187.43

    const key1 = generateIdempotencyKey(date, desc, amount)
    const key2 = generateIdempotencyKey(date, desc, amount)
    const key3 = generateIdempotencyKey(date, desc, amount)

    assert.strictEqual(key1, key2)
    assert.strictEqual(key2, key3)
  })

  it('different amounts produce different keys', () => {
    const date = new Date('2025-06-14T00:00:00.000Z')
    const desc = 'IFOOD RESTAURANTE'

    const key1 = generateIdempotencyKey(date, desc, 42.50)
    const key2 = generateIdempotencyKey(date, desc, 42.51)

    assert.notStrictEqual(key1, key2)
  })

  it('different dates produce different keys', () => {
    const desc = 'IFOOD RESTAURANTE'
    const amount = 42.50

    const key1 = generateIdempotencyKey(new Date('2025-06-14'), desc, amount)
    const key2 = generateIdempotencyKey(new Date('2025-06-15'), desc, amount)

    assert.notStrictEqual(key1, key2)
  })

  it('different descriptions produce different keys', () => {
    const date = new Date('2025-06-14T00:00:00.000Z')
    const amount = 100

    const key1 = generateIdempotencyKey(date, 'NETFLIX PREMIUM', amount)
    const key2 = generateIdempotencyKey(date, 'SPOTIFY PREMIUM', amount)

    assert.notStrictEqual(key1, key2)
  })

  it('similar descriptions with different suffixes produce different keys (full desc used)', () => {
    const date = new Date('2025-06-14T00:00:00.000Z')
    const amount = 100

    const key1 = generateIdempotencyKey(date, 'MERCADO LIVRE - Compra A', amount)
    const key2 = generateIdempotencyKey(date, 'MERCADO PAGO - Compra B', amount)

    // Full description is now used (not just first 7 chars), so these differ
    assert.notStrictEqual(key1, key2)
  })

  it('normalizes whitespace in descriptions', () => {
    const date = new Date('2025-01-01T00:00:00.000Z')
    const amount = 100

    const key1 = generateIdempotencyKey(date, 'IFOOD   RESTAURANTE', amount)
    const key2 = generateIdempotencyKey(date, 'IFOOD RESTAURANTE', amount)

    assert.strictEqual(key1, key2)
  })

  it('strips accents for normalization', () => {
    const date = new Date('2025-01-01T00:00:00.000Z')
    const amount = 100

    const key1 = generateIdempotencyKey(date, 'Alimentação', amount)
    const key2 = generateIdempotencyKey(date, 'Alimentacao', amount)

    assert.strictEqual(key1, key2)
  })
})
