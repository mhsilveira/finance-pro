export interface UpdateTransactionDTO {
	description?: string;
	amount?: number;
	type?: "income" | "expense";
	category?: string;
	date?: string; // ISO
}
