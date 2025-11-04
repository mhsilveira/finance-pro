// src/services/apiConfig.ts

// Config central de API para alternar mocks vs backend real e controlar baseURL, timeout e retry.
// Nesta migração, vamos usar o backend real. Se quiser reativar mocks, crie uma var de ambiente NEXT_PUBLIC_USE_MOCK=true.

const ENV_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_CONFIG = {
	// Se quiser reativar mocks por env: process.env.NEXT_PUBLIC_USE_MOCK === 'true'
	USE_MOCK: false,
	BASE_URL: ENV_BASE_URL || "http://localhost:3001/dev",

	ENDPOINTS: {
		TRANSACTIONS: "/transactions",
		CATEGORIES: "/categories",
		REPORTS: "/reports",
		DASHBOARD: "/dashboard",
	},

	// Configurações de timeout e retry
	TIMEOUT: 5000,
	RETRY_ATTEMPTS: 2,
};

function withBase(path: string) {
	if (!path.startsWith("/")) return `${API_CONFIG.BASE_URL}/${path}`;
	return `${API_CONFIG.BASE_URL}${path}`;
}

// Wrapper de fetch com baseURL, timeout, retry e normalização simples de erros.
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	if (API_CONFIG.USE_MOCK) {
		throw new Error("USE_MOCK está true. Use MockService diretamente ou desative USE_MOCK.");
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
	const url = endpoint.startsWith("http") ? endpoint : withBase(endpoint);

	const headers = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	} as Record<string, string>;

	// Se migrar para header x-user-id, descomente:
	// const uid = process.env.NEXT_PUBLIC_USER_ID;
	// if (uid) headers['x-user-id'] = uid;

	const doFetch = async () => {
		const res = await fetch(url, {
			...options,
			headers,
			signal: controller.signal,
		});
		if (!res.ok) {
			let bodyText = "";
			try {
				bodyText = await res.text();
			} catch {}
			const msg = `HTTP ${res.status}: ${res.statusText}${bodyText ? ` - ${bodyText}` : ""}`;
			throw new Error(msg);
		}
		if (res.status === 204) return undefined as unknown as T;
		return (await res.json()) as T;
	};

	try {
		let attempts = API_CONFIG.RETRY_ATTEMPTS + 1;
		let lastErr: unknown;
		while (attempts > 0) {
			try {
				const data = await doFetch();
				clearTimeout(timeoutId);
				return data;
			} catch (e) {
				lastErr = e;
				attempts -= 1;
				if (attempts === 0) throw e;
				await new Promise((r) => setTimeout(r, 250)); // pequeno backoff
			}
		}
		clearTimeout(timeoutId);
		throw lastErr;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

// Tipos para as respostas das APIs (se usar algum endpoint que retorna envelope)
export type ApiResponse<T> = {
	data: T;
	success: boolean;
	message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};
