// src/store/transactions/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectAll = (s: RootState) => s.transactions.items;
export const selectFilters = (s: RootState) => s.filters;

export const selectFiltered = createSelector([selectAll, selectFilters], (items, f) => {
	return items.filter((t) => {
		if (f.type !== "all" && t.type !== f.type) return false;
		if (f.category !== "all" && t.category !== f.category) return false;
		if (f.monthYear !== "all" && t.monthYear !== f.monthYear) return false;
		if (f.query && !`${t.name} ${t.description}`.toLowerCase().includes(f.query.toLowerCase())) return false;
		return true;
	});
});

export const selectTotals = createSelector([selectFiltered], (items) => {
	const income = items.filter((i) => i.type === "income").reduce((a, b) => a + b.amount, 0);
	const expense = items.filter((i) => i.type === "expense").reduce((a, b) => a + b.amount, 0);
	const balance = income - expense;
	return { income, expense, balance };
});
