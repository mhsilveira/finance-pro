"use client";
import React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { addTransaction } from "@/store/transactions/transactions";
import { Button, Card, Input, Select, Stack, Text } from "@/ui/design/atoms";

const categories = ["Food", "Housing", "Transport", "Leisure", "Health", "Income", "Other"];
const origins = ["CASH", "CREDIT_CARD"] as const;

type FormState = {
	date: string;
	monthYear: string;
	name: string;
	description: string;
	category: string;
	amount: number;
	type: "income" | "expense";
	origin: "CREDIT_CARD" | "CASH";
	card?: string;
};

export default function AddTransactionForm() {
	const dispatch = useDispatch<AppDispatch>();
	const [form, setForm] = React.useState<FormState>({
		date: new Date().toISOString(),
		monthYear: new Date().toISOString().slice(0, 7),
		name: "",
		description: "",
		category: "Food",
		amount: 0,
		type: "expense",
		origin: "CASH",
		card: "",
	});
	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	function update<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((f) => ({ ...f, [key]: value }));
	}

	function toIso(dateInput: string) {
		// dateInput pode vir como ISO (quando inicial) ou "YYYY-MM-DD" (dos inputs)
		// Se vier "YYYY-MM-DD", converter para ISO com timezone local
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
			// new Date("YYYY-MM-DD") trata como UTC; para evitar shift, compor manual:
			const [y, m, d] = dateInput.split("-").map(Number);
			const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // 12:00 UTC minimiza DST edge
			return dt.toISOString();
		}
		return new Date(dateInput).toISOString();
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (!form.name || !form.category || !form.monthYear) {
			setError("Preencha Name, Category e Month/Year.");
			return;
		}
		if (form.amount <= 0) {
			setError("Amount deve ser maior que 0.");
			return;
		}
		if (form.origin === "CREDIT_CARD" && !form.card) {
			setError('Card é obrigatório quando Origin = "CREDIT_CARD".');
			return;
		}

		setSubmitting(true);
		try {
			// Enviar o payload no formato que o thunk espera
			const payload = {
				// Dados que o backend realmente usa:
				date: toIso(form.date), // o thunk vai converter novamente para ISO por segurança; aqui já mando ISO
				description: form.description?.trim() || form.name.trim(), // description é requerido no backend; usa name se vazio
				category: form.category,
				amount: Number(form.amount),
				type: form.type,
				origin: form.origin,
				card: form.origin === "CREDIT_CARD" ? (form.card || "").trim() : undefined,

				// O slice atual tem `name` e `monthYear` – mantemos para compat da UI local
				name: form.name.trim(),
				monthYear: form.monthYear,
			};

			await dispatch(addTransaction(payload as any)).unwrap();

			setForm((f) => ({
				...f,
				name: "",
				description: "",
				amount: 0,
				// mantém monthYear selecionado, zera data para hoje
				date: new Date().toISOString(),
				monthYear: f.monthYear,
				// se quiser resetar origin/card:
				origin: f.origin,
				card: f.origin === "CREDIT_CARD" ? "" : "",
			}));
		} catch (err: any) {
			setError(err?.message || "Falha ao salvar.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Card>
			<form onSubmit={onSubmit}>
				<Stack gap={12}>
					<Text size={16} weight={600}>
						Add Expense/Income
					</Text>

					{error && <Text color="red">{error}</Text>}

					<div className="grid-3">
						<Input
							label="Name"
							placeholder="e.g., Groceries"
							value={form.name}
							onChange={(e) => update("name", e.target.value)}
						/>
						<Input
							label="Amount"
							type="number"
							step="0.01"
							value={form.amount}
							onChange={(e) => update("amount", Number(e.target.value))}
						/>
						<Select label="Type" value={form.type} onChange={(e) => update("type", e.target.value as any)}>
							<option value="expense">Expense</option>
							<option value="income">Income</option>
						</Select>
					</div>

					<div className="grid-3">
						<Select label="Category" value={form.category} onChange={(e) => update("category", e.target.value)}>
							{categories.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</Select>

						<Input
							label="Month/Year"
							type="month"
							value={form.monthYear}
							onChange={(e) => update("monthYear", e.target.value)}
						/>

						<Input
							label="Date"
							type="date"
							value={form.date.slice(0, 10)}
							onChange={(e) => update("date", e.target.value)}
						/>
					</div>

					<div className="grid-3">
						<Select
							label="Origin"
							value={form.origin}
							onChange={(e) => update("origin", e.target.value as FormState["origin"])}
						>
							{origins.map((o) => (
								<option key={o} value={o}>
									{o}
								</option>
							))}
						</Select>

						<Input
							label="Card (required if CREDIT_CARD)"
							placeholder="e.g., Nubank Visa"
							value={form.card || ""}
							onChange={(e) => update("card", e.target.value)}
							disabled={form.origin !== "CREDIT_CARD"}
						/>

						<div />
					</div>

					<Input
						label="Description"
						placeholder="Optional details..."
						value={form.description}
						onChange={(e) => update("description", e.target.value)}
					/>

					<Stack direction="row" justify="flex-end">
						<Button type="submit" disabled={submitting || !form.name || form.amount <= 0}>
							{submitting ? "Saving..." : "Add"}
						</Button>
					</Stack>
				</Stack>
			</form>
		</Card>
	);
}
