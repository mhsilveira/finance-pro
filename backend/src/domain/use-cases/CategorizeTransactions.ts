import type { IAIService, CategorizeResult } from '@domain/services/IAIService'

export class CategorizeTransactions {
  constructor(
    private readonly aiService: IAIService,
    private readonly availableCategories: string[]
  ) {}

  async execute(descriptions: string[]): Promise<CategorizeResult[]> {
    const results = await this.aiService.categorizeTransactions(
      descriptions,
      this.availableCategories
    )

    return results.map(r => {
      if (!this.availableCategories.includes(r.suggestedCategory)) {
        return { ...r, suggestedCategory: 'A Categorizar', confidence: 0 }
      }
      return r
    })
  }
}
