// services/csv.ts
import type { Transaction, CreateTransactionPayload } from '../types/transaction';

export function exportTransactionsToCSV(transactions: Transaction[]): void {
	if (transactions.length === 0) {
		alert('Nenhuma transação para exportar');
		return;
	}

	// CSV Headers
	const headers = [
		'ID',
		'Data',
		'Descrição',
		'Valor',
		'Tipo',
		'Categoria',
		'Origem',
		'Cartão',
		'Criado em',
	];

	// Convert transactions to CSV rows
	const rows = transactions.map((t) => [
		t.id || '',
		t.date || '',
		t.description || '',
		t.amount?.toString() || '0',
		t.type || '',
		t.category || '',
		t.origin || '',
		t.card || '',
		t.createdAt || '',
	]);

	// Combine headers and rows
	const csvContent = [
		headers.join(','),
		...rows.map((row) =>
			row.map((cell) => {
				// Escape quotes and wrap in quotes if contains comma or newline
				const cellStr = String(cell);
				if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
					return `"${cellStr.replace(/"/g, '""')}"`;
				}
				return cellStr;
			}).join(',')
		),
	].join('\n');

	// Create blob and download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	const date = new Date().toISOString().split('T')[0];
	link.setAttribute('href', url);
	link.setAttribute('download', `transacoes_${date}.csv`);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function parseCSV(csvText: string): CreateTransactionPayload[] {
	const lines = csvText.trim().split('\n');

	if (lines.length < 2) {
		throw new Error('CSV vazio ou inválido');
	}

	// Parse header
	const headerLine = lines[0];
	const headers = parseCSVLine(headerLine);

	// Validate required columns
	const requiredColumns = ['Descrição', 'Valor', 'Tipo', 'Data', 'Categoria', 'Origem'];
	const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

	if (missingColumns.length > 0) {
		throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
	}

	// Parse data rows
	const transactions: CreateTransactionPayload[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue; // Skip empty lines

		const values = parseCSVLine(line);
		const row: Record<string, string> = {};

		headers.forEach((header, index) => {
			row[header] = values[index] || '';
		});

		// Validate and create transaction payload
		try {
			const type = row['Tipo']?.toLowerCase();
			if (type !== 'income' && type !== 'expense') {
				throw new Error(`Tipo inválido na linha ${i + 1}: ${row['Tipo']}`);
			}

			const origin = row['Origem']?.toUpperCase();
			if (origin !== 'CREDIT_CARD' && origin !== 'CASH') {
				throw new Error(`Origem inválida na linha ${i + 1}: ${row['Origem']}`);
			}

			transactions.push({
				userId: 'blanchimaah', // Default user
				description: row['Descrição'] || `Transação ${i}`,
				amount: parseFloat(row['Valor'].replace(',', '.')) || 0,
				type: type as 'income' | 'expense',
				category: row['Categoria'] || 'Outros',
				origin: origin as 'CREDIT_CARD' | 'CASH',
				date: row['Data'] || new Date().toISOString(),
				card: row['Cartão'] || undefined,
			});
		} catch (error) {
			console.error(`Erro ao processar linha ${i + 1}:`, error);
			throw new Error(`Erro na linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
		}
	}

	return transactions;
}

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			// Check for escaped quote
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++; // Skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	result.push(current.trim());
	return result;
}

export function downloadCSVTemplate(): void {
	const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Origem', 'Cartão'];
	const exampleRow = [
		new Date().toISOString().split('T')[0],
		'Exemplo de transação',
		'100.00',
		'expense',
		'Alimentação',
		'CASH',
		'',
	];

	const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', 'modelo_importacao.csv');
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
