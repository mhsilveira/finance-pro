import { Transaction } from "@domain/entities/Transaction";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";
import { randomBytes } from "crypto";

export class CreateTransaction {
	constructor(private readonly repo: ITransactionRepository) {}

	async execute(params: {
		userId: string;
		description: string;
		amount: number;
		card?: string;
		type: "income" | "expense";
		origin: "CREDIT_CARD" | "CASH";
		category: string;
		date: Date;
	}): Promise<Transaction> {
		const id = randomBytes(12).toString("hex");
		const tx = new Transaction(
			id,
			params.userId,
			params.description,
			params.amount,
			params.type,
			params.origin === "CREDIT_CARD" ? "CREDIT_CARD" : "CASH",
			params.category,
			params.date,
			new Date(),
			new Date(),
			params.card,
		);
		return this.repo.create(tx);
	}
}
