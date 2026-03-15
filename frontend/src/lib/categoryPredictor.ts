/**
 * Auto-Categorization Engine
 * Predicts transaction category based on keyword rules from the database.
 */

import type { CategoryCorrection } from "@/services/api";
import type { Category } from "@/types/transaction";

/**
 * Predicts the category of a transaction based on its description.
 * Priority: user corrections > payment method skip > DB keyword rules > "Outros"
 *
 * @param description - The transaction description
 * @param corrections - User-specific corrections (from DB)
 * @param categories - Categories with keywords (from DB)
 */
export function predictCategory(
	description: string,
	corrections?: CategoryCorrection[],
	categories?: Category[],
): string {
	if (!description || description.trim().length === 0) {
		return "Outros";
	}

	// Normalize description: uppercase, remove accents, trim
	const normalizedDescription = description
		.toUpperCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();

	// Check user corrections first (exact match on normalized pattern)
	if (corrections && corrections.length > 0) {
		for (const correction of corrections) {
			const normalizedPattern = correction.descriptionPattern
				.toUpperCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.trim();

			if (normalizedDescription.includes(normalizedPattern)) {
				return correction.category;
			}
		}
	}

	// Skip payment method descriptions
	if (
		/^(PIX|PAGAMENTO EFETUADO|PAGAMENTO DE BOLETO|TRANSFERENCIA|TRANSFERÊNCIA)(\s|$)/.test(
			normalizedDescription,
		)
	) {
		return "A Categorizar";
	}

	// Match against DB categories with keywords (sorted by sortOrder)
	if (categories && categories.length > 0) {
		const sorted = [...categories].sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100));

		for (const cat of sorted) {
			if (!cat.keywords || cat.keywords.length === 0) continue;

			for (const keyword of cat.keywords) {
				const normalizedKeyword = keyword
					.toUpperCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");

				if (normalizedDescription.includes(normalizedKeyword)) {
					return cat.name;
				}
			}
		}
	}

	// Default category if no match
	return "Outros";
}
