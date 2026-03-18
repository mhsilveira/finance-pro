import type { IAIService, SpendingInsight } from '@domain/services/IAIService'
import type { ITransactionRepository } from '@domain/repositories/ITransactionRepository'

export class GenerateSpendingInsights {
  constructor(
    private readonly aiService: IAIService,
    private readonly transactionRepo: ITransactionRepository
  ) {}

  async execute(userId: string, month: string): Promise<SpendingInsight> {
    const [year, monthNum] = month.split('-').map(Number)

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1))
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59))

    const transactions = await this.transactionRepo.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate
    )

    const expenses = transactions.filter((t: any) => t.type === 'expense')
    const totalExpense = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0)

    const categoryMap = new Map<string, number>()
    for (const t of expenses) {
      const cat = (t as any).category || 'A Categorizar'
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number((t as any).amount))
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const prevStartDate = new Date(Date.UTC(year, monthNum - 2, 1))
    const prevEndDate = new Date(Date.UTC(year, monthNum - 1, 0, 23, 59, 59))

    const prevTransactions = await this.transactionRepo.findByUserIdAndDateRange(
      userId,
      prevStartDate,
      prevEndDate
    )

    let previousMonth
    if (prevTransactions.length > 0) {
      const prevExpenses = prevTransactions.filter((t: any) => t.type === 'expense')
      const prevTotal = prevExpenses.reduce((sum: number, t: any) => sum + Number((t as any).amount), 0)

      const prevCategoryMap = new Map<string, number>()
      for (const t of prevExpenses) {
        const cat = (t as any).category || 'A Categorizar'
        prevCategoryMap.set(cat, (prevCategoryMap.get(cat) || 0) + Number((t as any).amount))
      }

      previousMonth = {
        totalExpense: prevTotal,
        categoryBreakdown: Array.from(prevCategoryMap.entries())
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
      }
    }

    return this.aiService.generateSpendingInsights({
      month,
      totalExpense,
      categoryBreakdown,
      previousMonth
    })
  }
}
