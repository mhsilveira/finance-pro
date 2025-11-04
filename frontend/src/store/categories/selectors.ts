import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectAllCategories = (state: RootState) => state.categories.items;
export const selectCategoriesLoading = (state: RootState) => state.categories.loading;
export const selectCategoriesError = (state: RootState) => state.categories.error;

export const selectCategoriesByType = createSelector(
	[selectAllCategories, (state: RootState, type: "income" | "expense") => type],
	(categories, type) => categories.filter((category) => category.type === type),
);

export const selectIncomeCategories = (state: RootState) => selectCategoriesByType(state, "income");

export const selectExpenseCategories = (state: RootState) => selectCategoriesByType(state, "expense");
