/**
 * Auto-Categorization Engine
 * Predicts transaction category based on description keywords
 */

interface CategoryRule {
	keywords: string[];
	category: string;
}

// Define categorization rules (order matters - first match wins)
const CATEGORY_RULES: CategoryRule[] = [
	// Transporte
	{
		keywords: [
			"UBER",
			"99",
			"TAXI",
			"POSTO",
			"IPIRANGA",
			"SHELL",
			"AUTO",
			"COMBUSTIVEL",
			"GASOLINA",
			"ETANOL",
			"PEDÁGIO",
			"PEDAGIO",
			"ESTACIONAMENTO",
			"ONIBUS",
			"METRO",
			"BUS",
		],
		category: "Transporte",
	},

	// Alimentação
	{
		keywords: [
			"IFOOD",
			"RAPPI",
			"EATS",
			"MC DONALDS",
			"MCDONALDS",
			"BURGER KING",
			"BURGUER",
			"PADARIA",
			"MERCADO",
			"ATACADAO",
			"ATACADÃO",
			"ASSAI",
			"ASSAÍ",
			"CARREFOUR",
			"PAO DE ACUCAR",
			"PÃO DE AÇÚCAR",
			"EXTRA",
			"BIG",
			"RESTAURANTE",
			"LANCHONETE",
			"PIZZARIA",
			"PIZZA",
			"CAFE",
			"CAFÉ",
			"BAR",
			"LANCHES",
			"FOOD",
			"SUPERMERC",
		],
		category: "Alimentação",
	},

	// Lazer & Entretenimento
	{
		keywords: [
			"NETFLIX",
			"SPOTIFY",
			"PRIME",
			"HBO",
			"DISNEY",
			"AMAZON PRIME",
			"YOUTUBE",
			"APPLE.COM",
			"APPLE MUSIC",
			"DEEZER",
			"CINEMA",
			"INGRESSO",
			"TEATRO",
			"SHOW",
			"PARQUE",
		],
		category: "Lazer",
	},

	// Contas & Serviços
	{
		keywords: [
			"ENERGIA",
			"LUZ",
			"CELPE",
			"CEMIG",
			"CPFL",
			"AGUA",
			"ÁGUA",
			"SANEAMENTO",
			"INTERNET",
			"TELEFONE",
			"TIM",
			"VIVO",
			"CLARO",
			"OI",
			"SKY",
			"NET",
			"CONDOMINIO",
			"CONDOMÍNIO",
			"ALUGUEL",
		],
		category: "Contas",
	},

	// Saúde
	{
		keywords: [
			"FARMACIA",
			"FARMÁCIA",
			"DROGARIA",
			"DROGA",
			"HOSPITAL",
			"CLINICA",
			"CLÍNICA",
			"LABORATORIO",
			"LABORATÓRIO",
			"CONSULTA",
			"MEDICO",
			"MÉDICO",
			"DENTAL",
			"ODONTO",
			"UNIMED",
			"AMIL",
			"SULAMERICA",
		],
		category: "Saúde",
	},

	// Educação
	{
		keywords: [
			"ESCOLA",
			"FACULDADE",
			"UNIVERSIDADE",
			"CURSO",
			"UDEMY",
			"COURSERA",
			"LIVRO",
			"LIVRARIA",
			"EDUCACAO",
			"EDUCAÇÃO",
			"MATRICULA",
			"MENSALIDADE",
		],
		category: "Educação",
	},

	// Vestuário
	{
		keywords: [
			"RENNER",
			"RIACHUELO",
			"C&A",
			"ZARA",
			"SHEIN",
			"NIKE",
			"ADIDAS",
			"ROUPA",
			"CALCADO",
			"CALÇADO",
			"SAPATO",
			"TENIS",
			"TÊNIS",
			"MODA",
		],
		category: "Vestuário",
	},
];

/**
 * Predicts the category of a transaction based on its description
 * @param description - The transaction description
 * @returns The predicted category name
 */
export function predictCategory(description: string): string {
	if (!description || description.trim().length === 0) {
		return "Outros";
	}

	// Normalize description: uppercase, remove accents, trim
	const normalizedDescription = description
		.toUpperCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();

	// Check each rule
	for (const rule of CATEGORY_RULES) {
		for (const keyword of rule.keywords) {
			// Normalize keyword the same way
			const normalizedKeyword = keyword
				.toUpperCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "");

			if (normalizedDescription.includes(normalizedKeyword)) {
				return rule.category;
			}
		}
	}

	// Default category if no match
	return "Outros";
}

/**
 * Get all available categories from the rules
 * @returns Array of category names
 */
export function getAvailableCategories(): string[] {
	const categories = new Set(CATEGORY_RULES.map((rule) => rule.category));
	categories.add("Outros");
	return Array.from(categories).sort();
}

/**
 * Test the predictor with sample descriptions
 * Useful for debugging and validation
 */
export function testCategoryPredictor() {
	const testCases = [
		{ description: "UBER TRIP", expected: "Transporte" },
		{ description: "99 POP - Viagem", expected: "Transporte" },
		{ description: "POSTO IPIRANGA", expected: "Transporte" },
		{ description: "IFOOD *REST JAPAN", expected: "Alimentação" },
		{ description: "MC DONALDS", expected: "Alimentação" },
		{ description: "MERCADO EXTRA", expected: "Alimentação" },
		{ description: "NETFLIX.COM", expected: "Lazer" },
		{ description: "SPOTIFY", expected: "Lazer" },
		{ description: "Pagamento aleatório", expected: "Outros" },
		{ description: "FARMACIA DROGASIL", expected: "Saúde" },
		{ description: "CEMIG - ENERGIA", expected: "Contas" },
	];

	console.log("🧪 Testing Category Predictor:\n");
	testCases.forEach(({ description, expected }) => {
		const predicted = predictCategory(description);
		const status = predicted === expected ? "✅" : "❌";
		console.log(`${status} "${description}" → ${predicted} (expected: ${expected})`);
	});
}
