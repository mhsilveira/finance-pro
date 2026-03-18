export interface CategorizeResult {
  description: string
  suggestedCategory: string
  confidence: number
}

export interface SpendingInsight {
  summary: string
  highlights: string[]
  recommendations: string[]
}

export interface SpendingData {
  month: string
  totalExpense: number
  categoryBreakdown: Array<{ category: string; amount: number }>
  previousMonth?: {
    totalExpense: number
    categoryBreakdown: Array<{ category: string; amount: number }>
  }
}

export interface IAIService {
  categorizeTransactions(
    descriptions: string[],
    availableCategories: string[]
  ): Promise<CategorizeResult[]>

  generateSpendingInsights(data: SpendingData): Promise<SpendingInsight>
}
