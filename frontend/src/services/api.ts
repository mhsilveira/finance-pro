// services/api.ts
import type { Transaction, CreateTransactionPayload, Category } from "../types/transaction";

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

export async function deleteAllTransactions(userId: string): Promise<{ deletedCount: number }> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/transactions?userId=${userId}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
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

export async function getCategories(type?: "income" | "expense"): Promise<Category[]> {
	const base = getBaseUrl();
	const url = type ? `${base}/categories?type=${type}` : `${base}/categories`;

	const res = await fetch(url, { cache: "no-store" });

	if (!res.ok) {
		throw new Error(`Erro ${res.status}: ${res.statusText}`);
	}

	return res.json();
}

export interface CategoryCorrection {
	_id?: string;
	userId: string;
	descriptionPattern: string;
	category: string;
	createdAt?: string;
}

export async function getCategoryCorrections(userId: string): Promise<CategoryCorrection[]> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/category-corrections?userId=${userId}`, { cache: "no-store" });

	if (!res.ok) {
		throw new Error(`Erro ${res.status}: ${res.statusText}`);
	}

	return res.json();
}

export async function saveCategoryCorrection(
	userId: string,
	descriptionPattern: string,
	category: string,
): Promise<CategoryCorrection> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/category-corrections`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, descriptionPattern, category }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

// Batch create transactions (single request for CSV import)
export interface BatchCreateResult {
	message: string;
	success: number;
	duplicates: number;
	failed: number;
	errors: Array<{ index: number; error: string }>;
}

export async function batchCreateTransactions(transactions: CreateTransactionPayload[]): Promise<BatchCreateResult> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/transactions/batch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ transactions }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

// Transaction stats (server-side aggregation)
export interface TransactionStats {
	totalCount: number;
	income: number;
	expense: number;
	byCategory: Array<{ category: string; total: number; count: number }>;
}

export async function getTransactionStats(
	userId: string,
	filters?: { monthFrom?: string; monthTo?: string },
): Promise<TransactionStats> {
	const base = getBaseUrl();
	const params = new URLSearchParams({ userId });
	if (filters?.monthFrom) params.set("monthFrom", filters.monthFrom);
	if (filters?.monthTo) params.set("monthTo", filters.monthTo);

	const res = await fetch(`${base}/transactions/stats?${params}`, { cache: "no-store" });

	if (!res.ok) {
		throw new Error(`Erro ${res.status}: ${res.statusText}`);
	}

	return res.json();
}

// Category CRUD
export async function createCategory(data: {
	key: string;
	name: string;
	type: "income" | "expense" | "both";
	icon?: string;
	color?: string;
	keywords?: string[];
	sortOrder?: number;
}): Promise<Category> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/categories`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

export async function updateCategory(
	key: string,
	data: { name?: string; type?: "income" | "expense" | "both"; icon?: string; color?: string; keywords?: string[]; sortOrder?: number },
): Promise<Category> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/categories/${key}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}

	return res.json();
}

export async function deleteCategory(key: string): Promise<void> {
	const base = getBaseUrl();

	const res = await fetch(`${base}/categories/${key}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
	}
}
