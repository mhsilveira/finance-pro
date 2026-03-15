import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { predictCategory } from '../domain/use-cases/ReprocessCategories'

const CATEGORY_RULES = [
  { name: 'Aluguel', keywords: ['ALUGUEL', 'LOCACAO'], sortOrder: 10 },
  { name: 'Assinaturas', keywords: ['NETFLIX', 'SPOTIFY', 'CHATGPT'], sortOrder: 11 },
  { name: 'Transporte', keywords: ['UBER', '99', 'POSTO'], sortOrder: 12 },
  { name: 'Alimentação', keywords: ['IFOOD', 'RAPPI', 'MERCADO', 'PADARIA'], sortOrder: 13 },
  { name: 'Compras', keywords: ['SHOPEE', 'AMAZON', 'MERCADOLIVRE'], sortOrder: 14 },
  { name: 'Saúde', keywords: ['FARMACIA', 'DROGARIA', 'HOSPITAL'], sortOrder: 17 },
  { name: 'Outros', keywords: [], sortOrder: 98 }
]

describe('predictCategory', () => {
  // ──────────────────────────────────────────────────────────────────────
  // Basic behavior
  // ──────────────────────────────────────────────────────────────────────

  it('returns "Outros" for empty description', () => {
    assert.strictEqual(predictCategory('', [], CATEGORY_RULES), 'Outros')
  })

  it('returns "Outros" for whitespace-only description', () => {
    assert.strictEqual(predictCategory('   ', [], CATEGORY_RULES), 'Outros')
  })

  it('returns "Outros" when no rules match', () => {
    assert.strictEqual(
      predictCategory('SOMETHING RANDOM XYZ', [], CATEGORY_RULES),
      'Outros'
    )
  })

  // ──────────────────────────────────────────────────────────────────────
  // Keyword matching
  // ──────────────────────────────────────────────────────────────────────

  it('matches IFOOD to Alimentação', () => {
    assert.strictEqual(
      predictCategory('Ifood *Restaurante do João', [], CATEGORY_RULES),
      'Alimentação'
    )
  })

  it('matches NETFLIX to Assinaturas', () => {
    assert.strictEqual(
      predictCategory('Netflix.com', [], CATEGORY_RULES),
      'Assinaturas'
    )
  })

  it('matches UBER to Transporte', () => {
    assert.strictEqual(
      predictCategory('Uber *Trip São Paulo', [], CATEGORY_RULES),
      'Transporte'
    )
  })

  it('matches ALUGUEL to Aluguel', () => {
    assert.strictEqual(
      predictCategory('ALUGUEL APARTAMENTO JAN', [], CATEGORY_RULES),
      'Aluguel'
    )
  })

  it('matches case-insensitively', () => {
    assert.strictEqual(
      predictCategory('netflix premium mensal', [], CATEGORY_RULES),
      'Assinaturas'
    )
  })

  it('matches with accents (NFD normalization)', () => {
    assert.strictEqual(
      predictCategory('FARMÁCIA RAIA', [], CATEGORY_RULES),
      'Saúde'
    )
  })

  // ──────────────────────────────────────────────────────────────────────
  // sortOrder priority
  // ──────────────────────────────────────────────────────────────────────

  it('respects sortOrder: MERCADO matches Alimentação (13) before Compras (14)', () => {
    // "MERCADO" is a keyword in Alimentação (sortOrder 13)
    // "MERCADOLIVRE" is in Compras (sortOrder 14)
    // "MERCADO LIVRE" should match MERCADO first (Alimentação) due to lower sortOrder
    assert.strictEqual(
      predictCategory('MERCADO MUNICIPAL', [], CATEGORY_RULES),
      'Alimentação'
    )
  })

  // ──────────────────────────────────────────────────────────────────────
  // Payment method descriptions → "A Categorizar"
  // ──────────────────────────────────────────────────────────────────────

  it('routes PIX to "A Categorizar"', () => {
    assert.strictEqual(
      predictCategory('PIX ENVIADO - JOAO SILVA', [], CATEGORY_RULES),
      'A Categorizar'
    )
  })

  it('routes PAGAMENTO EFETUADO to "A Categorizar"', () => {
    assert.strictEqual(
      predictCategory('PAGAMENTO EFETUADO EM 14/06', [], CATEGORY_RULES),
      'A Categorizar'
    )
  })

  it('routes TRANSFERENCIA to "A Categorizar"', () => {
    assert.strictEqual(
      predictCategory('TRANSFERENCIA RECEBIDA', [], CATEGORY_RULES),
      'A Categorizar'
    )
  })

  it('does NOT route "PIXELART STORE" to "A Categorizar" (PIX must be at start followed by space/end)', () => {
    // "PIXELART" starts with PIX but the regex requires PIX followed by \s or $
    assert.notStrictEqual(
      predictCategory('PIXELART STORE', [], CATEGORY_RULES),
      'A Categorizar'
    )
  })

  // ──────────────────────────────────────────────────────────────────────
  // User corrections take priority over everything
  // ──────────────────────────────────────────────────────────────────────

  it('user correction overrides keyword match', () => {
    const corrections = [
      { descriptionPattern: 'UBER', category: 'Lazer' }
    ]
    // Without correction: UBER → Transporte (keyword)
    // With correction: UBER → Lazer (user override)
    assert.strictEqual(
      predictCategory('UBER *TRIP', corrections, CATEGORY_RULES),
      'Lazer'
    )
  })

  it('user correction overrides payment method skip', () => {
    const corrections = [
      { descriptionPattern: 'PIX JOAO', category: 'Aluguel' }
    ]
    // Without correction: PIX → "A Categorizar"
    // With correction: PIX JOAO → Aluguel
    assert.strictEqual(
      predictCategory('PIX JOAO SILVA', corrections, CATEGORY_RULES),
      'Aluguel'
    )
  })

  // ──────────────────────────────────────────────────────────────────────
  // No rules provided (graceful fallback)
  // ──────────────────────────────────────────────────────────────────────

  it('returns "Outros" when categoryRules is undefined', () => {
    assert.strictEqual(
      predictCategory('IFOOD *Restaurante', [], undefined),
      'Outros'
    )
  })

  it('returns "Outros" when categoryRules is empty', () => {
    assert.strictEqual(
      predictCategory('IFOOD *Restaurante', [], []),
      'Outros'
    )
  })
})
