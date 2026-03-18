import type { CategoryCorrection } from "@/services/api";
import type { Category } from "@/types/transaction";

export function predictCategory(
	description: string,
	corrections?: CategoryCorrection[],
	categories?: Category[],
): string {
	if (!description || description.trim().length === 0) {
		return "Outros";
	}

	const normalizedDescription = description
		.toUpperCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();

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

	if (
		/^(PIX|PAGAMENTO EFETUADO|PAGAMENTO DE BOLETO|TRANSFERENCIA|TRANSFERÊNCIA)(\s|$)/.test(
			normalizedDescription,
		)
	) {
		return "A Categorizar";
	}

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

	return "Outros";
}
