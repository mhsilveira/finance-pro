export interface TransactionResponseDTO {
	id: string;
	userId: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	category: string;
	date: string; // ISO
	createdAt: string; // ISO
	updatedAt: string; // ISO
}
