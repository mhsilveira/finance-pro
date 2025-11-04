// src/store/dashboard/dashboardSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DashboardResponse, getDashboard } from "@/services/dashboardApi";

type DashboardState = {
	currentMonth: { income: number; expense: number; balance: number };
	changes: { incomeChange: number; expenseChange: number };
	totalTransactions: number;
	loading: boolean;
	error: string | null;
};

const initialState: DashboardState = {
	currentMonth: { income: 0, expense: 0, balance: 0 },
	changes: { incomeChange: 0, expenseChange: 0 },
	totalTransactions: 0,
	loading: false,
	error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardResponse, { userId: string }>(
	"dashboard/fetch",
	async ({ userId }) => {
		return await getDashboard(userId);
	},
);

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {},
	extraReducers: (b) => {
		b.addCase(fetchDashboardStats.pending, (s) => {
			s.loading = true;
			s.error = null;
		});
		b.addCase(fetchDashboardStats.fulfilled, (s, a) => {
			s.loading = false;
			s.currentMonth = a.payload.currentMonth;
			s.changes = a.payload.changes;
			s.totalTransactions = a.payload.totalTransactions;
		});
		b.addCase(fetchDashboardStats.rejected, (s, a) => {
			s.loading = false;
			s.error = a.error.message || "Falha ao carregar dashboard";
		});
	},
});

export default dashboardSlice.reducer;
