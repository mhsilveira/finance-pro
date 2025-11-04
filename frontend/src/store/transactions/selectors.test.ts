import { RootState } from "../store";
import { selectTotals } from "./selectors";

test("selectTotals computes correctly", () => {
	const state = {
		transactions: {
			items: [
				{
					id: "1",
					date: "2024-01-01",
					description: "Salary",
					category: "Income",
					amount: 1000,
					type: "income",
				},
				{ id: "2", date: "2024-01-02", description: "Food", category: "Food", amount: 200, type: "expense" },
			],
			loading: false,
			error: null,
		},
		filters: { query: "", category: "all", type: "all" },
	} as unknown as RootState;

	const res = selectTotals.resultFunc([
		{ id: "1", date: "2024-01-01", description: "Salary", category: "Income", amount: 1000, type: "income" },
		{ id: "2", date: "2024-01-02", description: "Food", category: "Food", amount: 200, type: "expense" },
	]);

	expect(res).toEqual({ income: 1000, expense: 200, balance: 800 });
});
