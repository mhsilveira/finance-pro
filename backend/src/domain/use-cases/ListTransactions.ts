import { Transaction } from "@domain/entities/Transaction";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";

export class ListTransactions {
	constructor(private readonly repo: ITransactionRepository) {}

	async execute(userId: string, options?: { limit?: number; skip?: number }): Promise<Transaction[]> {
		return this.repo.findByUserId(userId, options);
	}
}
