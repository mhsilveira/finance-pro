import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  batchCreateTransactions,
  deleteAllTransactions,
  getTransactionStats,
} from "@/services/api";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Set env var
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001/dev";

describe("API Service", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getTransactions", () => {
    it("fetches paginated transactions", async () => {
      const mockResponse = {
        data: [{ id: "tx-1", description: "Test" }],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1, hasMore: false },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTransactions("user-1", { page: 1, limit: 50 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions?userId=user-1&page=1&limit=50"),
        expect.anything(),
      );
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("throws on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getTransactions("user-1")).rejects.toThrow("Erro 500");
    });
  });

  describe("createTransaction", () => {
    it("sends POST request with payload", async () => {
      const payload = {
        userId: "user-1",
        description: "Test",
        amount: 100,
        type: "expense" as const,
        origin: "CASH" as const,
        category: "Outros",
        date: "2025-06-15",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "tx-1", ...payload }),
      });

      const result = await createTransaction(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(result.id).toBe("tx-1");
    });

    it("throws on error with response text", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "Validation failed",
      });

      await expect(
        createTransaction({
          userId: "user-1",
          description: "Test",
          amount: 100,
          type: "expense",
          origin: "CASH",
          category: "Outros",
          date: "2025-06-15",
        }),
      ).rejects.toThrow("Erro 400");
    });
  });

  describe("updateTransaction", () => {
    it("sends PUT request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "tx-1", description: "Updated" }),
      });

      const result = await updateTransaction("tx-1", { description: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions/tx-1"),
        expect.objectContaining({ method: "PUT" }),
      );
      expect(result.description).toBe("Updated");
    });
  });

  describe("deleteTransaction", () => {
    it("sends DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await deleteTransaction("tx-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions/tx-1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("throws on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(deleteTransaction("nonexistent")).rejects.toThrow("Erro 404");
    });
  });

  describe("getCategories", () => {
    it("fetches all categories", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ key: "FOOD", name: "Alimentação" }],
      });

      const result = await getCategories();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/categories"),
        expect.anything(),
      );
      expect(result).toHaveLength(1);
    });

    it("fetches categories by type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await getCategories("income");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/categories?type=income"),
        expect.anything(),
      );
    });
  });

  describe("batchCreateTransactions", () => {
    it("sends batch POST request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: "OK",
          success: 2,
          duplicates: 0,
          failed: 0,
          errors: [],
        }),
      });

      const result = await batchCreateTransactions([
        {
          userId: "user-1",
          description: "A",
          amount: 10,
          type: "expense",
          origin: "CASH",
          category: "Outros",
          date: "2025-06-15",
        },
        {
          userId: "user-1",
          description: "B",
          amount: 20,
          type: "income",
          origin: "CASH",
          category: "Salário",
          date: "2025-06-15",
        },
      ]);

      expect(result.success).toBe(2);
      expect(result.duplicates).toBe(0);
    });
  });

  describe("deleteAllTransactions", () => {
    it("sends DELETE request with userId", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deletedCount: 5 }),
      });

      const result = await deleteAllTransactions("user-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions?userId=user-1"),
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(result.deletedCount).toBe(5);
    });
  });

  describe("getTransactionStats", () => {
    it("fetches stats with filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalCount: 10,
          income: 5000,
          expense: 3000,
          byCategory: [],
        }),
      });

      const result = await getTransactionStats("user-1", {
        monthFrom: "2025-01",
        monthTo: "2025-06",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("monthFrom=2025-01"),
        expect.anything(),
      );
      expect(result.totalCount).toBe(10);
    });
  });
});
