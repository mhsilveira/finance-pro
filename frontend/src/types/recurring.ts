export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
	id: string;
	userId: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	origin: "CREDIT_CARD" | "CASH";
	category: string;
	card?: string;
	frequency: RecurringFrequency;
	startDate: string;
	endDate?: string;
	isActive: boolean;
	lastGenerated?: string;
	createdAt: string;
}

export interface CreateRecurringTransactionPayload {
	userId: string;
	description: string;
	amount: number | string;
	type: "income" | "expense";
	origin: "CREDIT_CARD" | "CASH";
	category: string;
	card?: string;
	frequency: RecurringFrequency;
	startDate: string;
	endDate?: string;
}
