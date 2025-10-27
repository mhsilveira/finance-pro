import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { mockService, ReportData } from "@/services/mockData";

type ReportsState = {
    data: ReportData | null;
    loading: boolean;
    error: string | null;
    selectedMonthYear: string | null;
};

const initialState: ReportsState = {
    data: null,
    loading: false,
    error: null,
    selectedMonthYear: null,
};

export const fetchReportData = createAsyncThunk<ReportData, string | undefined>(
    "reports/fetchData",
    async (monthYear) => {
        return await mockService.getReportData(monthYear);
    },
);

const reportsSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        setSelectedMonthYear(state, action) {
            state.selectedMonthYear = action.payload;
        },
        clearReportData(state) {
            state.data = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReportData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReportData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchReportData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch report data";
            });
    },
});

export const { setSelectedMonthYear, clearReportData } = reportsSlice.actions;
export default reportsSlice.reducer;
