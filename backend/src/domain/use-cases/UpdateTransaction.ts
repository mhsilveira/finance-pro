import { Transaction } from "@domain/entities/Transaction";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";

export class UpdateTransaction {
    constructor(private readonly repo: ITransactionRepository) {}

    async execute(id: string, partial: Partial<Transaction>): Promise<Transaction | null> {
        return this.repo.update(id, partial);
    }
}
