import { useState, useEffect } from "react";

export interface TransactionFilters {
	searchTerm: string;
	typeFilter: "all" | "income" | "expense";
	categoryFilter: string;
	originFilter: "all" | "CREDIT_CARD" | "CASH";
	cardFilter: string;
	monthFrom: string;
	monthTo: string;
	pageSize: number;
}

const DEFAULT_FILTERS: TransactionFilters = {
	searchTerm: "",
	typeFilter: "all",
	categoryFilter: "all",
	originFilter: "all",
	cardFilter: "all",
	monthFrom: "",
	monthTo: "",
	pageSize: 10,
};

const STORAGE_KEY = "transaction-filters";

export function usePersistedFilters() {
	const [filters, setFiltersState] = useState<TransactionFilters>(DEFAULT_FILTERS);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				setFiltersState({ ...DEFAULT_FILTERS, ...parsed });
			}
		} catch (error) {
			console.error("Failed to load filters from localStorage:", error);
		} finally {
			setIsLoaded(true);
		}
	}, []);

	useEffect(() => {
		if (isLoaded) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
			} catch (error) {
				console.error("Failed to save filters to localStorage:", error);
			}
		}
	}, [filters, isLoaded]);

	const setFilters = (updates: Partial<TransactionFilters>) => {
		setFiltersState((prev) => ({ ...prev, ...updates }));
	};

	const resetFilters = () => {
		setFiltersState(DEFAULT_FILTERS);
		localStorage.removeItem(STORAGE_KEY);
	};

	const hasActiveFilters =
		filters.searchTerm !== "" ||
		filters.typeFilter !== "all" ||
		filters.categoryFilter !== "all" ||
		filters.originFilter !== "all" ||
		filters.cardFilter !== "all" ||
		filters.monthFrom !== "" ||
		filters.monthTo !== "";

	return {
		filters,
		setFilters,
		resetFilters,
		hasActiveFilters,
		isLoaded,
	};
}
