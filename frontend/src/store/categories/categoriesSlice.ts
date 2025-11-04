// src/store/categories/categoriesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CategorySlice, getReports, withPercentagesByType } from "@/services/reportsApi";

type CategoriesState = {
	items: CategorySlice[];
	loading: boolean;
	error: string | null;
};

const initialState: CategoriesState = {
	items: [],
	loading: false,
	error: null,
};

// Busca breakdown de categorias a partir do /reports e já enriquece com percentage.
// Opcional: filtrar por tipo (income|expense).
export const fetchCategoryBreakdown = createAsyncThunk<
	CategorySlice[],
	{ userId: string; type?: "income" | "expense" }
>("categories/fetchBreakdown", async ({ userId, type }) => {
	const reports = await getReports(userId);
	const enriched = withPercentagesByType(reports.categoryBreakdown);
	return type ? enriched.filter((s) => s.type === type) : enriched;
});

const categoriesSlice = createSlice({
	name: "categories",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCategoryBreakdown.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchCategoryBreakdown.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch category breakdown";
			});
	},
});

export default categoriesSlice.reducer;
