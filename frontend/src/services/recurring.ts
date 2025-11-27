// services/recurring.ts
import type { RecurringTransaction, CreateRecurringTransactionPayload } from '../types/recurring';

const STORAGE_KEY = 'recurring_transactions';

export function getRecurringTransactions(): RecurringTransaction[] {
	if (typeof window === 'undefined') return [];
	const data = localStorage.getItem(STORAGE_KEY);
	return data ? JSON.parse(data) : [];
}

export function saveRecurringTransactions(recurring: RecurringTransaction[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(recurring));
}

export function createRecurringTransaction(
	payload: CreateRecurringTransactionPayload
): RecurringTransaction {
	const recurring: RecurringTransaction = {
		id: Date.now().toString(),
		...payload,
		amount: typeof payload.amount === 'string' ? Number.parseFloat(payload.amount) : payload.amount,
		isActive: true,
		createdAt: new Date().toISOString(),
	};

	const allRecurring = getRecurringTransactions();
	allRecurring.push(recurring);
	saveRecurringTransactions(allRecurring);

	return recurring;
}

export function updateRecurringTransaction(
	id: string,
	updates: Partial<RecurringTransaction>
): RecurringTransaction | null {
	const allRecurring = getRecurringTransactions();
	const index = allRecurring.findIndex((r) => r.id === id);

	if (index === -1) return null;

	allRecurring[index] = { ...allRecurring[index], ...updates };
	saveRecurringTransactions(allRecurring);

	return allRecurring[index];
}

export function deleteRecurringTransaction(id: string): boolean {
	const allRecurring = getRecurringTransactions();
	const filtered = allRecurring.filter((r) => r.id !== id);

	if (filtered.length === allRecurring.length) return false;

	saveRecurringTransactions(filtered);
	return true;
}

export function toggleRecurringActive(id: string): RecurringTransaction | null {
	const recurring = getRecurringTransactions().find((r) => r.id === id);
	if (!recurring) return null;

	return updateRecurringTransaction(id, { isActive: !recurring.isActive });
}
