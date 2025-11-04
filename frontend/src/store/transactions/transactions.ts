// src/store/transactions/transactions.ts

import { createAsyncThunk, createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

import {
	createTransaction as apiCreate,
	deleteTransaction as apiDelete,
	getTransaction as apiGet,
	listTransactions as apiList,
	updateTransaction as apiUpdate,
} from "../../services/transactionsApi";

export type Transaction = {
	id: string;
	date: string; // ISO completo (mantemos para hora/min)
	monthYear: string; // YYYY-MM
	name: string; // nome curto (ex: "Mercado Extra")
	description: string;
	category: string;
	amount: number;
	type: "income" | "expense";
};

type TransactionsState = {
	items: Transaction[];
	loading: boolean;
	error: string | null;
};

const initialState: TransactionsState = {
	items: [],
	loading: false,
	error: null,
};

// Lista real do backend (GET /transactions?userId=...)
export const fetchTransactions = createAsyncThunk<Transaction[], { userId?: string }>(
	"transactions/fetchAll",
	async ({ userId } = {}) => {
		const uid = userId || process.env.NEXT_PUBLIC_USER_ID || "dev-user";
		return await apiList(uid);
	},
);

// Create real (POST /transactions)
export const addTransaction = createAsyncThunk<
	Transaction,
	// Payload que o teu form provavelmente envia (ajuste se necessário)
	Omit<Transaction, "id" | "monthYear" | "name"> & {
		origin: "CREDIT_CARD" | "CASH";
		card?: string;
	}
>("transactions/add", async (data) => {
	const uid = process.env.NEXT_PUBLIC_USER_ID || "dev-user";
	const created = await apiCreate({
		userId: uid,
		description: data.description,
		amount: data.amount,
		type: data.type,
		category: data.category,
		date: new Date(data.date).toISOString(),
		origin: data.origin,
		card: data.origin === "CREDIT_CARD" ? data.card : undefined,
	});
	return created;
});

export const updateTransaction = createAsyncThunk<
	Transaction,
	Transaction & {
		origin?: "CREDIT_CARD" | "CASH";
		card?: string | null;
	}
>("transactions/update", async (data) => {
	const updated = await apiUpdate(data.id, {
		description: data.description,
		amount: data.amount,
		type: data.type,
		category: data.category,
		date: new Date(data.date).toISOString(),
		origin: data.origin,
		card: data.card ?? undefined,
	});
	return updated;
});

// Delete real (DELETE /transactions/:id)
export const removeTransaction = createAsyncThunk<string, string>("transactions/remove", async (id) => {
	await apiDelete(id);
	return id;
});

const transactionsSlice = createSlice({
	name: "transactions",
	initialState,
	reducers: {
		// Exemplo de reducer sync (optimistic UI se quiser depois)
		addLocal(state, action: PayloadAction<Omit<Transaction, "id">>) {
			state.items.unshift({ id: nanoid(), ...action.payload });
		},
	},
	extraReducers: (builder) => {
		builder
			// fetch
			.addCase(fetchTransactions.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchTransactions.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchTransactions.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Unknown error";
			})
			.addCase(addTransaction.fulfilled, (state, action) => {
				state.items.unshift(action.payload);
			})
			.addCase(updateTransaction.fulfilled, (state, action) => {
				const idx = state.items.findIndex((t) => t.id === action.payload.id);
				if (idx >= 0) state.items[idx] = action.payload;
			})
			.addCase(removeTransaction.fulfilled, (state, action) => {
				state.items = state.items.filter((t) => t.id !== action.payload);
			});
	},
});

export const { addLocal } = transactionsSlice.actions;
export default transactionsSlice.reducer;
