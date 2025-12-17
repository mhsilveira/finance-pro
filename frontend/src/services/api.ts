// services/api.ts
import type { Transaction, CreateTransactionPayload } from "../types/transaction";

export type { CreateTransactionPayload } from "../types/transaction";

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return process.env.NEXT_PUBLIC_API_BASE_URL || "";
	}
	return process.env.NEXT_PUBLIC_API_BASE_URL || "";
};

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasMore: boolean;
	};
}

export async function getTransactions(
	userId: string,
	options?: { page?: number; limit?: number },
): Promise<PaginatedResponse<Transaction>> {
	const base = getBaseUrl();
	const page = options?.page || 1;
	const limit = options?.limit || 50;

	const res = await fetch(`${base}/transactions?userId=${userId}&page=${page}&limit=${limit}`, { cache: "no-store" });

	if (!res.ok) {
		throw new Error(`Erro ${res.status}: ${res.statusText}`);
	}

	return res.json();
}

export async function getAllTransactions(userId: string): Promise<Transaction[]> {
	const base = getBaseUrl();
	const res = await fetch(`${base}/transactions?userId=${userId}&limit=9999`, {
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(`Erro ${res.status}: ${res.statusText}`);
	}

	const response = await res.json();
	return response.data || response;
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/transactions`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

export async function updateTransaction(id: string, payload: Partial<CreateTransactionPayload>): Promise<Transaction> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/transactions/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

export async function deleteTransaction(id: string): Promise<void> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/transactions/${id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error(`Erro ${res.status}: ${res.statusText}`);
	}
}

export interface ReprocessCategoriesResult {
	message: string;
	total: number;
	updated: number;
	unchanged: number;
}

export async function reprocessCategories(userId: string): Promise<ReprocessCategoriesResult> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/transactions/reprocess-categories?userId=${userId}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}
