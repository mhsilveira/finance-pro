export class Transaction {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly description: string,
        public readonly amount: number,
        public readonly type: "income" | "expense",
        public readonly origin: "CREDIT_CARD" | "CASH",
        public readonly category: string,
        public readonly date: Date,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date(),
        public readonly card?: string,
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.description || this.description.trim().length === 0) {
            throw new Error("Description is required");
        }
        if (this.amount <= 0) {
            throw new Error("Amount must be greater than zero");
        }
        if (!["income", "expense"].includes(this.type)) {
            throw new Error("Type must be income or expense");
        }
    }

    public isIncome(): boolean {
        return this.type === "income";
    }

    public isExpense(): boolean {
        return this.type === "expense";
    }
}
