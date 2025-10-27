import type { Transaction } from "@domain/entities/Transaction";

export interface ITransactionRepository {
    create(transaction: Transaction): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    findByUserId(userId: string): Promise<Transaction[]>;
    update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
    delete(id: string): Promise<boolean>;
}
