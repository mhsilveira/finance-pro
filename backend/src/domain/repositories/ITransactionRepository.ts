import type { Transaction } from "@domain/entities/Transaction";

export interface ITransactionRepository {
	create(transaction: Transaction): Promise<Transaction>;
	findById(id: string): Promise<Transaction | null>;
	findByUserId(userId: string, options?: { limit?: number; skip?: number }): Promise<Transaction[]>;
	update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
	bulkUpdateCategories(updates: Array<{ id: string; category: string }>): Promise<number>;
	delete(id: string): Promise<boolean>;
	findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
}
