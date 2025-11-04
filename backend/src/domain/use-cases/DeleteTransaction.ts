import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";

export class DeleteTransaction {
	constructor(private readonly repo: ITransactionRepository) {}

	async execute(id: string): Promise<boolean> {
		return this.repo.delete(id);
	}
}
