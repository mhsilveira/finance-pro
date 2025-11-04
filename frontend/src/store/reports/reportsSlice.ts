// src/store/reports/reportsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type MonthlyTrend = {
	monthYear: string;
	income: number;
	expense: number;
	balance: number;
};

type CategoryBreakdownItem = {
	type: "income" | "expense";
	category: string;
	amount: number;
};

export type CategorySlice = CategoryBreakdownItem & { percentage: number };

type TopTransaction = {
	id: string;
	name: string;
	description: string;
	category: string;
	amount: number;
	type: "income" | "expense";
};

export type ReportsState = {
	selectedMonthYear: string; // 'all' | 'YYYY-MM'
	monthlyTrends: MonthlyTrend[];
	categoryBreakdown: CategorySlice[]; // sempre com percentage
	topTransactions: TopTransaction[];
	averageDailySpending: number;
	loading: boolean;
	error: string | null;
};

const initialState: ReportsState = {
	selectedMonthYear: "all",
	monthlyTrends: [],
	categoryBreakdown: [],
	topTransactions: [],
	averageDailySpending: 0,
	loading: false,
	error: null,
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/dev";

function toNum(v: any): number {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

function enrichPercentagesByType(items: CategoryBreakdownItem[]): CategorySlice[] {
	const totals = items.reduce(
		(acc, it) => {
			acc[it.type] = (acc[it.type] ?? 0) + toNum(it.amount);
			return acc;
		},
		{} as Record<"income" | "expense", number>,
	);
	return items.map((it) => {
		const total = totals[it.type] || 0;
		const pct = total > 0 ? (toNum(it.amount) / total) * 100 : 0;
		return { ...it, percentage: Number.isFinite(pct) ? pct : 0 };
	});
}

export const fetchReportData = createAsyncThunk<
	{
		monthlyTrends: MonthlyTrend[];
		categoryBreakdown: CategorySlice[];
		topTransactions: TopTransaction[];
		averageDailySpending: number;
	},
	{ userId: string; monthYear: string }
>("reports/fetch", async ({ userId, monthYear }) => {
	const url = `${BASE}/reports?userId=${encodeURIComponent(userId)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
	const data = await res.json();

	// Normalização
	const monthlyTrendsRaw: MonthlyTrend[] = Array.isArray(data?.monthlyTrends)
		? data.monthlyTrends.map((r: any) => {
				const income = toNum(r?.income);
				const expense = toNum(r?.expense);
				const balance = toNum(r?.balance ?? income - expense);
				return {
					monthYear: String(r?.monthYear ?? ""),
					income,
					expense,
					balance,
				};
			})
		: [];

	// Filtrar por mês se necessário
	const monthlyTrends =
		monthYear && monthYear !== "all" ? monthlyTrendsRaw.filter((t) => t.monthYear === monthYear) : monthlyTrendsRaw;

	const categoryBreakdownBase: CategoryBreakdownItem[] = Array.isArray(data?.categoryBreakdown)
		? data.categoryBreakdown.map((r: any) => ({
				type: r?.type === "income" ? "income" : "expense",
				category: String(r?.category ?? "Other"),
				amount: toNum(r?.amount),
			}))
		: [];

	// Se for mês específico, filtre pelo mesmo período:
	const categoryBreakdownFiltered =
		monthYear && monthYear !== "all"
			? (() => {
					// Não temos mapeamento mês->categoria diretamente vindo do backend.
					// Se quiser muito preciso por mês, backend precisa agrupar por mês também.
					// Por enquanto, mantém sem filtro por mês aqui (ou deixa igual).
					return categoryBreakdownBase;
				})()
			: categoryBreakdownBase;

	const categoryBreakdown = enrichPercentagesByType(categoryBreakdownFiltered);

	const averageDailySpending = toNum(data?.averageDailySpending);

	// topTransactions: o /reports atual não retorna; por enquanto retorna vazio para não quebrar a UI.
	// Opcional: podemos buscar /transactions e pegar top 10 despesas.
	const topTransactions: TopTransaction[] = [];

	return {
		monthlyTrends,
		categoryBreakdown,
		topTransactions,
		averageDailySpending,
	};
});

const reportsSlice = createSlice({
	name: "reports",
	initialState,
	reducers: {
		setSelectedMonthYear(state, action: PayloadAction<string>) {
			state.selectedMonthYear = action.payload || "all";
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchReportData.pending, (s) => {
			s.loading = true;
			s.error = null;
		});
		b.addCase(fetchReportData.fulfilled, (s, a) => {
			s.loading = false;
			s.monthlyTrends = a.payload.monthlyTrends;
			s.categoryBreakdown = a.payload.categoryBreakdown; // já com percentage
			s.topTransactions = a.payload.topTransactions;
			s.averageDailySpending = a.payload.averageDailySpending;
		});
		b.addCase(fetchReportData.rejected, (s, a) => {
			s.loading = false;
			s.error = a.error.message || "Failed to fetch reports";
		});
	},
});

export const { setSelectedMonthYear } = reportsSlice.actions;
export default reportsSlice.reducer;
