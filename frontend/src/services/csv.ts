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
	const headers = parseCSVLine(headerLine).map(h => h.toLowerCase());

	// Detect format: simplified (3 fields) or complete (6+ fields)
	const isSimplifiedFormat = headers.length === 3 &&
		(headers.includes('data') || headers.includes('date')) &&
		(headers.includes('lançamento') || headers.includes('lancamento') || headers.includes('descrição') || headers.includes('descricao') || headers.includes('description')) &&
		(headers.includes('valor') || headers.includes('value') || headers.includes('amount'));

	// Parse data rows
	const transactions: CreateTransactionPayload[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue; // Skip empty lines

		const values = parseCSVLine(line);

		if (isSimplifiedFormat) {
			// Simplified format: data, lançamento, valor
			// All transactions are EXPENSES from CREDIT_CARD by default
			// User will edit later to categorize
			try {
				const dateValue = values[0] || new Date().toISOString().split('T')[0];
				const description = values[1] || `Transação ${i}`;
				const amountStr = values[2] || '0';

				// Parse amount (handle both comma and dot as decimal separator)
				const amount = Math.abs(parseFloat(amountStr.replace(',', '.'))) || 0;

				transactions.push({
					userId: 'blanchimaah',
					description: description.trim(),
					amount: amount.toString(),
					type: 'expense', // Default to expense (credit card bill)
					category: 'A Categorizar', // User will categorize later
					origin: 'CREDIT_CARD', // Default to credit card
					date: dateValue,
					card: undefined,
				});
			} catch (error) {
				console.error(`Erro ao processar linha ${i + 1}:`, error);
				throw new Error(`Erro na linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
			}
		} else {
			// Complete format: validate all required columns
			const row: Record<string, string> = {};
			headers.forEach((header, index) => {
				row[header] = values[index] || '';
			});

			// Map common header variations
			const description = row['descrição'] || row['descricao'] || row['description'] || row['lançamento'] || row['lancamento'];
			const valor = row['valor'] || row['value'] || row['amount'];
			const tipo = row['tipo'] || row['type'];
			const categoria = row['categoria'] || row['category'];
			const origem = row['origem'] || row['origin'];
			const data = row['data'] || row['date'];
			const cartao = row['cartão'] || row['cartao'] || row['card'];

			// Validate required fields
			if (!description || !valor || !tipo || !categoria || !origem || !data) {
				throw new Error(`Dados incompletos na linha ${i + 1}`);
			}

			// Validate and create transaction payload
			try {
				const type = tipo.toLowerCase();
				if (type !== 'income' && type !== 'expense') {
					throw new Error(`Tipo inválido na linha ${i + 1}: ${tipo}`);
				}

				const origin = origem.toUpperCase();
				if (origin !== 'CREDIT_CARD' && origin !== 'CASH') {
					throw new Error(`Origem inválida na linha ${i + 1}: ${origem}`);
				}

				transactions.push({
					userId: 'blanchimaah',
					description: description || `Transação ${i}`,
					amount: parseFloat(valor.replace(',', '.')) || 0,
					type: type as 'income' | 'expense',
					category: categoria || 'Outros',
					origin: origin as 'CREDIT_CARD' | 'CASH',
					date: data || new Date().toISOString(),
					card: cartao || undefined,
				});
			} catch (error) {
				console.error(`Erro ao processar linha ${i + 1}:`, error);
				throw new Error(`Erro na linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
			}
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
	// Simplified template (3 fields - for credit card statements)
	const simplifiedHeaders = ['data', 'lançamento', 'valor'];
	const simplifiedExample1 = ['2025-11-12', 'MP *NOVAPOINT', '31'];
	const simplifiedExample2 = ['2025-11-11', 'UBER* TRIP', '50.71'];

	// Complete template (all fields)
	const completeHeaders = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Origem', 'Cartão'];
	const completeExample = [
		new Date().toISOString().split('T')[0],
		'Exemplo de transação',
		'100.00',
		'expense',
		'Alimentação',
		'CASH',
		'',
	];

	// Create content with both templates separated by blank lines
	const csvContent = [
		'# FORMATO SIMPLIFICADO (Fatura de Cartão)',
		simplifiedHeaders.join(','),
		simplifiedExample1.join(','),
		simplifiedExample2.join(','),
		'',
		'# FORMATO COMPLETO (Importação Manual)',
		completeHeaders.join(','),
		completeExample.join(','),
	].join('\n');

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
