import type { Transaction, CreateTransactionPayload, Category } from "../types/transaction";
import type { CSVSource } from "../components/ImportCSVModal";
import type { CategoryCorrection } from "@/services/api";
import { predictCategory } from "@/lib/categoryPredictor";

export function exportTransactionsToCSV(transactions: Transaction[]): void {
	if (transactions.length === 0) {
		alert("Nenhuma transação para exportar");
		return;
	}

	const headers = ["ID", "Data", "Descrição", "Valor", "Tipo", "Categoria", "Origem", "Cartão", "Criado em"];

	const rows = transactions.map((t) => [
		t.id || "",
		t.date || "",
		t.description || "",
		t.amount?.toString() || "0",
		t.type || "",
		t.category || "",
		t.origin || "",
		t.card || "",
		t.createdAt || "",
	]);

	const csvContent = [
		headers.join(","),
		...rows.map((row) =>
			row
				.map((cell) => {
					const cellStr = String(cell);
					if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
						return `"${cellStr.replace(/"/g, '""')}"`;
					}
					return cellStr;
				})
				.join(","),
		),
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	const date = new Date().toISOString().split("T")[0];
	link.setAttribute("href", url);
	link.setAttribute("download", `transacoes_${date}.csv`);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

const IGNORED_DESCRIPTIONS = [
	"pagamento efetuado",
	"pagamento recebido",
];

function shouldIgnoreTransaction(description: string): boolean {
	const normalized = description.toLowerCase().trim();
	return IGNORED_DESCRIPTIONS.some((term) => normalized.includes(term));
}

export function parseCSV(csvText: string, source: CSVSource, corrections?: CategoryCorrection[], categories?: Category[]): CreateTransactionPayload[] {
	const lines = csvText.trim().split("\n");

	if (lines.length < 2) {
		throw new Error("CSV vazio ou inválido");
	}

	let transactions: CreateTransactionPayload[];

	switch (source) {
		case "NUBANK_CHECKING":
			transactions = parseNubankChecking(lines, corrections, categories);
			break;
		case "NUBANK_CREDIT":
			transactions = parseNubankCredit(lines, corrections, categories);
			break;
		case "ITAU_CHECKING":
			transactions = parseItauChecking(lines, corrections, categories);
			break;
		case "ITAU_CREDIT":
			transactions = parseItauCredit(lines, corrections, categories);
			break;
		default:
			throw new Error(`Formato desconhecido: ${source}`);
	}

	return transactions.filter((t) => !shouldIgnoreTransaction(t.description));
}

function parseNubankChecking(lines: string[], corrections?: CategoryCorrection[], categories?: Category[]): CreateTransactionPayload[] {
	const transactions: CreateTransactionPayload[] = [];
	const headers = parseCSVLine(lines[0], ",").map((h) => h.toLowerCase());

	if (!headers.includes("data") || !headers.includes("valor") || !headers.includes("descrição")) {
		throw new Error("Formato Nubank Extrato inválido. Esperado: Data,Valor,Identificador,Descrição");
	}

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const values = parseCSVLine(line, ",");
		if (values.length < 4) continue;

		const dateStr = values[0] || "";
		const amountStr = values[1] || "";
		const description = values[3] || `Transação ${i}`;

		try {
			const date = parseBrazilianDate(dateStr);
			const amount = parseFloat(amountStr.trim());

			if (isNaN(amount) || amount === 0) {
				console.warn(`Linha ${i + 1} ignorada: valor inválido "${amountStr}"`);
				continue;
			}

			const type = amount < 0 ? "expense" : "income";
			const absoluteAmount = Math.abs(amount);

			transactions.push({
				userId: "blanchimaah",
				description: description.trim(),
				amount: absoluteAmount.toFixed(2),
				type: type,
				category: predictCategory(description, corrections, categories),
				origin: "CASH",
				date: date,
				card: undefined,
			});
		} catch (error) {
			console.error(`Erro na linha ${i + 1}:`, error);
			continue;
		}
	}

	return transactions;
}

function parseItauChecking(lines: string[], corrections?: CategoryCorrection[], categories?: Category[]): CreateTransactionPayload[] {
	const transactions: CreateTransactionPayload[] = [];
	const headers = parseCSVLine(lines[0], ";").map((h) => h.toLowerCase());

	if (!headers.includes("data") || !headers.includes("descricao") || !headers.includes("valor")) {
		throw new Error("Formato Itaú Extrato inválido. Esperado: Data;Descricao;Valor");
	}

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const values = parseCSVLine(line, ";");
		if (values.length < 3) continue;

		const dateStr = values[0] || "";
		const description = values[1] || `Transação ${i}`;
		const amountStr = values[2] || "";

		try {
			const date = parseBrazilianDate(dateStr);
			const cleanAmount = amountStr.trim().replace(/\./g, "").replace(",", ".");
			const amount = parseFloat(cleanAmount);

			if (isNaN(amount) || amount === 0) {
				console.warn(`Linha ${i + 1} ignorada: valor inválido "${amountStr}"`);
				continue;
			}

			const type = amount < 0 ? "expense" : "income";
			const absoluteAmount = Math.abs(amount);

			transactions.push({
				userId: "blanchimaah",
				description: description.trim(),
				amount: absoluteAmount.toFixed(2),
				type: type,
				category: predictCategory(description, corrections, categories),
				origin: "CASH",
				date: date,
				card: undefined,
			});
		} catch (error) {
			console.error(`Erro na linha ${i + 1}:`, error);
			continue;
		}
	}

	return transactions;
}

function parseNubankCredit(lines: string[], corrections?: CategoryCorrection[], categories?: Category[]): CreateTransactionPayload[] {
	const transactions: CreateTransactionPayload[] = [];
	const headers = parseCSVLine(lines[0], ",").map((h) => h.toLowerCase());

	if (!headers.includes("date") || !headers.includes("title") || !headers.includes("amount")) {
		throw new Error("Formato Nubank Fatura inválido. Esperado: date,title,amount");
	}

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const values = parseCSVLine(line, ",");
		if (values.length < 3) continue;

		const dateStr = values[0] || "";
		const description = values[1] || `Transação ${i}`;
		const amountStr = values[2] || "";

		try {
			const date = dateStr.trim();
			const amount = parseFloat(amountStr.trim());

			if (isNaN(amount) || amount === 0) {
				console.warn(`Linha ${i + 1} ignorada: valor inválido "${amountStr}"`);
				continue;
			}

			const absoluteAmount = Math.abs(amount);

			transactions.push({
				userId: "blanchimaah",
				description: description.trim(),
				amount: absoluteAmount.toFixed(2),
				type: "expense",
				category: predictCategory(description, corrections, categories),
				origin: "CREDIT_CARD",
				date: date,
				card: "Nubank",
			});
		} catch (error) {
			console.error(`Erro na linha ${i + 1}:`, error);
			continue;
		}
	}

	return transactions;
}

function parseItauCredit(lines: string[], corrections?: CategoryCorrection[], categories?: Category[]): CreateTransactionPayload[] {
	const transactions: CreateTransactionPayload[] = [];
	const headers = parseCSVLine(lines[0], ",").map((h) => h.toLowerCase());

	if (!headers.includes("data") || !headers.includes("lançamento") || !headers.includes("valor")) {
		throw new Error("Formato Itaú Fatura inválido. Esperado: data,lançamento,valor");
	}

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const values = parseCSVLine(line, ",");
		if (values.length < 3) continue;

		const dateStr = values[0] || "";
		const description = values[1] || `Transação ${i}`;
		const amountStr = values[2] || "";

		try {
			const date = dateStr.trim();
			const amount = parseFloat(amountStr.trim());

			if (isNaN(amount) || amount === 0) {
				console.warn(`Linha ${i + 1} ignorada: valor inválido "${amountStr}"`);
				continue;
			}

			const absoluteAmount = Math.abs(amount);

			transactions.push({
				userId: "blanchimaah",
				description: description.trim(),
				amount: absoluteAmount.toFixed(2),
				type: "expense",
				category: predictCategory(description, corrections, categories),
				origin: "CREDIT_CARD",
				date: date,
				card: "Itaú",
			});
		} catch (error) {
			console.error(`Erro na linha ${i + 1}:`, error);
			continue;
		}
	}

	return transactions;
}

function parseBrazilianDate(dateStr: string): string {
	const parts = dateStr.trim().split("/");
	if (parts.length === 3) {
		return `${parts[2]}-${parts[1]}-${parts[0]}`;
	}
	return new Date().toISOString().split("T")[0];
}

function parseCSVLine(line: string, delimiter = ","): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === delimiter && !inQuotes) {
			result.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}

	result.push(current.trim());
	return result;
}

export function downloadCSVTemplate(): void {
	const csvContent = [
		"# NUBANK - EXTRATO (Conta Corrente)",
		"Data,Valor,Identificador,Descrição",
		"01/08/2025,-20.00,UUID123,Compra no débito - Supermercado",
		"",
		"# ITAÚ - EXTRATO (Conta Corrente)",
		"Data;Descricao;Valor",
		"05/06/2025;Pagamento Conta;-28,76",
		"",
		"# NUBANK - FATURA (Cartão de Crédito)",
		"date,title,amount",
		"2025-06-14,Apple.Com/Bill,39.90",
		"",
		"# ITAÚ - FATURA (Cartão de Crédito)",
		"data,lançamento,valor",
		"2025-11-12,MP *NOVAPOINT,31",
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", "modelo_importacao.csv");
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
