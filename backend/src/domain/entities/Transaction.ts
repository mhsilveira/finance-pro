export class Transaction {
  constructor (
    public id: string,
    public userId: string,
    public description: string,
    public amount: number,
    public type: 'income' | 'expense',
    public origin?: 'CREDIT_CARD' | 'CASH',
    public category?: string,
    public date: Date | null = null, // antes era Date ou Date | undefined
    public createdAt: Date | null = null, // idem
    public updatedAt: Date | null = null, // idem
    public card?: string
  ) {
    this.validate()
  }

  private validate (): void {
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Description is required')
    }
    if (this.amount === 0) {
      throw new Error('Amount cannot be zero')
    }
    if (!['income', 'expense'].includes(this.type)) {
      throw new Error('Type must be income or expense')
    }
  }

  public isIncome (): boolean {
    return this.type === 'income'
  }

  public isExpense (): boolean {
    return this.type === 'expense'
  }
}
