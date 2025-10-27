import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { mockService } from "@/services/mockData";

export type DashboardStats = {
    currentMonth: {
        income: number;
        expense: number;
        balance: number;
    };
    changes: {
        incomeChange: number;
        expenseChange: number;
    };
    totalTransactions: number;
};

type DashboardState = {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
};

const initialState: DashboardState = {
    stats: null,
    loading: false,
    error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStats>("dashboard/fetchStats", async () => {
    return await mockService.getDashboardStats();
});

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearDashboardData(state) {
            state.stats = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch dashboard stats";
            });
    },
});

export const { clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
