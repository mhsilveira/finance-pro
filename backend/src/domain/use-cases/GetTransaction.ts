import { Transaction } from "@domain/entities/Transaction";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";

export class GetTransaction {
	constructor(private readonly repo: ITransactionRepository) {}

	async execute(id: string): Promise<Transaction | null> {
		return this.repo.findById(id);
	}
}
