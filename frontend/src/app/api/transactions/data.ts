import { nanoid } from "@reduxjs/toolkit";

export type TransactionDTO = {
	id: string;
	date: string;
	monthYear: string; // YYYY-MM
	name: string;
	description: string;
	category: string;
	amount: number;
	type: "income" | "expense";
};

let data: TransactionDTO[] = [
	{
		id: nanoid(),
		date: new Date().toISOString(),
		monthYear: new Date().toISOString().slice(0, 7),
		name: "Salary",
		description: "Monthly salary",
		category: "Income",
		amount: 8000,
		type: "income",
	},
	{
		id: nanoid(),
		date: new Date().toISOString(),
		monthYear: new Date().toISOString().slice(0, 7),
		name: "Groceries",
		description: "Weekly groceries",
		category: "Food",
		amount: 350,
		type: "expense",
	},
	{
		id: nanoid(),
		date: new Date().toISOString(),
		monthYear: new Date().toISOString().slice(0, 7),
		name: "Rent",
		description: "Apartment rent",
		category: "Housing",
		amount: 3000,
		type: "expense",
	},
];

export const db = {
	all: async () => {
		await sleep(300); // latência
		return data;
	},
	add: async (t: Omit<TransactionDTO, "id">) => {
		await sleep(300);
		const created = { id: nanoid(), ...t };
		data = [created, ...data];
		return created;
	},
	update: async (t: TransactionDTO) => {
		await sleep(300);
		const idx = data.findIndex((x) => x.id === t.id);
		if (idx === -1) throw new Error("Not found");
		data[idx] = t;
		return t;
	},
	remove: async (id: string) => {
		await sleep(300);
		data = data.filter((x) => x.id !== id);
		return { id };
	},
};

function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}
