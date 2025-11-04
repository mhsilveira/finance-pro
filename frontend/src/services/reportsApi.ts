// src/services/reportsApi.ts
export type MonthlyTrend = {
	monthYear: string;
	income: number;
	expense: number;
	balance: number;
};

export type CategoryBreakdownItem = {
	type: "income" | "expense";
	category: string;
	amount: number;
};

export type ReportsResponse = {
	monthlyTrends: MonthlyTrend[];
	categoryBreakdown: CategoryBreakdownItem[];
	averageDailySpending: number;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/dev";

function toNum(v: any): number {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

export async function getReports(userId: string): Promise<ReportsResponse> {
	const url = `${BASE}/reports?userId=${encodeURIComponent(userId)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch reports: ${res.status}`);
	}
	const data = await res.json();

	const monthlyTrends: MonthlyTrend[] = Array.isArray(data?.monthlyTrends)
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

	const categoryBreakdown: CategoryBreakdownItem[] = Array.isArray(data?.categoryBreakdown)
		? data.categoryBreakdown.map((r: any) => ({
				type: r?.type === "income" ? "income" : "expense",
				category: String(r?.category ?? "Other"),
				amount: toNum(r?.amount),
			}))
		: [];

	const averageDailySpending = toNum(data?.averageDailySpending);

	return { monthlyTrends, categoryBreakdown, averageDailySpending };
}

// Enriquecimento: adiciona percentage por tipo (income/expense)
export type CategorySlice = CategoryBreakdownItem & { percentage: number };

export function withPercentagesByType(slices: CategoryBreakdownItem[]): CategorySlice[] {
	const totals = slices.reduce(
		(acc, s) => {
			acc[s.type] = (acc[s.type] ?? 0) + (s.amount ?? 0);
			return acc;
		},
		{} as Record<"income" | "expense", number>,
	);

	return slices.map((s) => {
		const total = totals[s.type] || 0;
		const pct = total > 0 ? (s.amount / total) * 100 : 0;
		return {
			...s,
			percentage: Number.isFinite(pct) ? pct : 0,
		};
	});
}
