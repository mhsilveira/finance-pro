// Configuração para alternar entre mock e APIs reais
export const API_CONFIG = {
  // Mude para false quando tiver APIs reais
  USE_MOCK: true,
  
  // URLs das APIs reais (quando USE_MOCK = false)
  ENDPOINTS: {
    TRANSACTIONS: '/api/transactions',
    CATEGORIES: '/api/categories',
    REPORTS: '/api/reports',
    DASHBOARD: '/api/dashboard',
  },
  
  // Configurações de timeout e retry
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
};

// Função para fazer requisições com fallback para mock
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (API_CONFIG.USE_MOCK) {
    // Em modo mock, as requisições são tratadas pelo MockService
    throw new Error('Use MockService directly when USE_MOCK is true');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Tipos para as respostas das APIs
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
