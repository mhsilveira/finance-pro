// src/services/transactionsApi.ts
import { Transaction } from "../store/transactions/transactions";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/dev";

function toISOFromYMD(d: string | null | undefined): string | null {
	if (!d) return null;
	// Converte "YYYY-MM-DD" para ISO UTC T00:00:00.000Z
	// Valida simples:
	if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
	return `${d}T00:00:00.000Z`;
}

function mapFromApi(t: any): Transaction {
	const iso = toISOFromYMD(t.date); // se adicionar dateISO no backend, troque para: t.dateISO ?? toISOFromYMD(t.date)
	return {
		id: String(t.id),
		date: iso ?? new Date().toISOString(), // fallback para não quebrar UI; pode usar null se ajustar tipo
		monthYear: t.monthYear ?? (iso ? iso.slice(0, 7) : ""),
		name: t.name ?? t.description ?? "", // mapeia description->name
		description: t.description ?? "",
		category: t.category ?? "Uncategorized",
		amount: Number(t.amount ?? 0),
		type: t.type === "income" ? "income" : "expense",
	};
}

export async function listTransactions(userId: string): Promise<Transaction[]> {
	const url = `${BASE}/transactions?userId=${encodeURIComponent(userId)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
	const data = await res.json();
	if (!Array.isArray(data)) return [];
	return data.map(mapFromApi);
}

export async function createTransaction(payload: {
	userId: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	category: string;
	date: string; // ISO
	origin?: "CREDIT_CARD" | "CASH";
	card?: string;
}): Promise<Transaction> {
	const url = `${BASE}/transactions`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Failed to create transaction: ${res.status}`);
	const created = await res.json();
	return mapFromApi(created);
}

export async function updateTransaction(
	id: string,
	payload: Partial<{
		description: string;
		amount: number;
		type: "income" | "expense";
		category: string;
		date: string; // ISO
		origin?: "CREDIT_CARD" | "CASH";
		card?: string;
	}>,
): Promise<Transaction> {
	const url = `${BASE}/transactions/${encodeURIComponent(id)}`;
	const res = await fetch(url, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Failed to update transaction: ${res.status}`);
	const updated = await res.json();
	return mapFromApi(updated);
}

export async function deleteTransaction(id: string): Promise<void> {
	const url = `${BASE}/transactions/${encodeURIComponent(id)}`;
	const res = await fetch(url, { method: "DELETE" });
	if (!res.ok) throw new Error(`Failed to delete transaction: ${res.status}`);
}

export async function getTransaction(id: string): Promise<Transaction> {
	const url = `${BASE}/transactions/${encodeURIComponent(id)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to get transaction: ${res.status}`);
	const found = await res.json();
	return mapFromApi(found);
}
