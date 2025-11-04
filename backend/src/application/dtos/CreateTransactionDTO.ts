export interface CreateTransactionDTO {
	userId: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	category: string;
	date: string;
}
