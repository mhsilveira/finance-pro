import type { ITransactionRepository } from '../repositories/ITransactionRepository'

interface CategoryCorrection {
  descriptionPattern: string
  category: string
}

interface CategoryRule {
  name: string
  keywords: string[]
  sortOrder: number
}

interface ReprocessResult {
  total: number
  updated: number
  unchanged: number
}

export class ReprocessCategories {
  constructor (
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute (
    userId: string,
    corrections?: CategoryCorrection[],
    categoryRules?: CategoryRule[]
  ): Promise<ReprocessResult> {
    const transactions = await this.transactionRepository.findByUserId(userId)

    // Build list of updates needed (in memory, no DB calls yet)
    const updates: Array<{ id: string; category: string }> = []
    let unchanged = 0

    for (const transaction of transactions) {
      const predictedCategory = predictCategory(
        transaction.description || '',
        corrections,
        categoryRules
      )

      if (predictedCategory !== transaction.category) {
        updates.push({ id: transaction.id, category: predictedCategory })
      } else {
        unchanged++
      }
    }

    // Single bulkWrite instead of N individual updates
    let updated = 0
    if (updates.length > 0) {
      updated = await this.transactionRepository.bulkUpdateCategories(updates)
    }

    return {
      total: transactions.length,
      updated,
      unchanged
    }
  }
}

/**
 * Predicts the category of a transaction based on its description.
 * Priority: user corrections > payment method skip > DB keyword rules > "Outros"
 */
export function predictCategory (
  description: string,
  corrections?: CategoryCorrection[],
  categoryRules?: CategoryRule[]
): string {
  if (!description || description.trim().length === 0) {
    return 'Outros'
  }

  const normalized = description
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Check user corrections first
  if (corrections && corrections.length > 0) {
    for (const correction of corrections) {
      const normalizedPattern = correction.descriptionPattern
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      if (normalized.includes(normalizedPattern)) {
        return correction.category
      }
    }
  }

  // Skip payment method descriptions
  if (/^(PIX|PAGAMENTO |PAGAMENTO|TRANSFERENCIA|TRANSFERÊNCIA)(\s|$)/.test(normalized)) {
    return 'A Categorizar'
  }

  // Match against category keyword rules from DB (sorted by sortOrder)
  if (categoryRules && categoryRules.length > 0) {
    const sorted = [...categoryRules].sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100))

    for (const rule of sorted) {
      if (!rule.keywords || rule.keywords.length === 0) continue

      for (const keyword of rule.keywords) {
        const normalizedKeyword = keyword
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

        if (normalized.includes(normalizedKeyword)) {
          return rule.name
        }
      }
    }
  }

  return 'Outros'
}
