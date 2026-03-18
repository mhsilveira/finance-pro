export interface TransactionResponseDTO {
	id: string;
	userId: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	category: string;
	date: string;
	createdAt: string;
	updatedAt: string;
}
