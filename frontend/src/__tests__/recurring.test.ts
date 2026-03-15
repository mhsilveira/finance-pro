import {
  getRecurringTransactions,
  saveRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringActive,
} from "@/services/recurring";
import type { RecurringTransaction } from "@/types/recurring";

const STORAGE_KEY = "recurring_transactions";

function makeSampleRecurring(overrides: Partial<RecurringTransaction> = {}): RecurringTransaction {
  return {
    id: "rec-1",
    userId: "user-1",
    description: "Netflix",
    amount: 39.9,
    type: "expense",
    origin: "CREDIT_CARD",
    category: "Assinaturas",
    card: "Nubank",
    frequency: "monthly",
    startDate: "2025-01-01",
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("Recurring Transactions Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getRecurringTransactions", () => {
    it("returns empty array when localStorage is empty", () => {
      const result = getRecurringTransactions();
      expect(result).toEqual([]);
    });

    it("returns stored transactions", () => {
      const items = [makeSampleRecurring()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = getRecurringTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Netflix");
    });
  });

  describe("saveRecurringTransactions", () => {
    it("persists transactions to localStorage", () => {
      const items = [makeSampleRecurring()];
      saveRecurringTransactions(items);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("rec-1");
    });
  });

  describe("createRecurringTransaction", () => {
    it("creates a recurring transaction with auto-generated id", () => {
      const result = createRecurringTransaction({
        userId: "user-1",
        description: "Spotify",
        amount: 21.9,
        type: "expense",
        origin: "CREDIT_CARD",
        category: "Assinaturas",
        frequency: "monthly",
        startDate: "2025-06-01",
        card: "Nubank",
      });

      expect(result.id).toBeDefined();
      expect(result.description).toBe("Spotify");
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toBeDefined();

      const stored = getRecurringTransactions();
      expect(stored).toHaveLength(1);
    });

    it("converts string amount to number", () => {
      const result = createRecurringTransaction({
        userId: "user-1",
        description: "Test",
        amount: "99.90",
        type: "expense",
        origin: "CASH",
        category: "Outros",
        frequency: "monthly",
        startDate: "2025-06-01",
      });

      expect(typeof result.amount).toBe("number");
      expect(result.amount).toBe(99.9);
    });
  });

  describe("updateRecurringTransaction", () => {
    it("updates an existing recurring transaction", () => {
      const initial = makeSampleRecurring();
      saveRecurringTransactions([initial]);

      const result = updateRecurringTransaction("rec-1", { description: "Netflix Premium" });

      expect(result).not.toBeNull();
      expect(result!.description).toBe("Netflix Premium");
      expect(result!.amount).toBe(39.9); // unchanged
    });

    it("returns null for non-existent id", () => {
      const result = updateRecurringTransaction("nonexistent", { description: "Test" });
      expect(result).toBeNull();
    });
  });

  describe("deleteRecurringTransaction", () => {
    it("deletes existing recurring transaction", () => {
      saveRecurringTransactions([makeSampleRecurring()]);

      const result = deleteRecurringTransaction("rec-1");

      expect(result).toBe(true);
      expect(getRecurringTransactions()).toHaveLength(0);
    });

    it("returns false for non-existent id", () => {
      const result = deleteRecurringTransaction("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("toggleRecurringActive", () => {
    it("toggles active to inactive", () => {
      saveRecurringTransactions([makeSampleRecurring({ isActive: true })]);

      const result = toggleRecurringActive("rec-1");

      expect(result).not.toBeNull();
      expect(result!.isActive).toBe(false);
    });

    it("toggles inactive to active", () => {
      saveRecurringTransactions([makeSampleRecurring({ isActive: false })]);

      const result = toggleRecurringActive("rec-1");

      expect(result).not.toBeNull();
      expect(result!.isActive).toBe(true);
    });

    it("returns null for non-existent id", () => {
      const result = toggleRecurringActive("nonexistent");
      expect(result).toBeNull();
    });
  });
});
