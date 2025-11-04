import { Transaction } from "@domain/entities/Transaction";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";

export class ListTransactions {
	constructor(private readonly repo: ITransactionRepository) {}

	async execute(userId: string): Promise<Transaction[]> {
		return this.repo.findByUserId(userId);
	}
}
