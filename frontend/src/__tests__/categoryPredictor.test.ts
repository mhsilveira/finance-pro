import { predictCategory } from "@/lib/categoryPredictor";
import type { CategoryCorrection } from "@/services/api";
import type { Category } from "@/types/transaction";

const SAMPLE_CATEGORIES: Category[] = [
  { key: "FOOD", name: "Alimentação", type: "expense", keywords: ["IFOOD", "RAPPI", "MERCADO", "RESTAURANTE"], sortOrder: 13 },
  { key: "TRANSPORT", name: "Transporte", type: "expense", keywords: ["UBER", "TAXI", "POSTO", "99"], sortOrder: 12 },
  { key: "SUBSCRIPTIONS", name: "Assinaturas", type: "expense", keywords: ["NETFLIX", "SPOTIFY", "AMAZON PRIME"], sortOrder: 11 },
  { key: "HEALTH", name: "Saúde", type: "expense", keywords: ["FARMACIA", "FARMÁCIA", "HOSPITAL", "DROGARIA"], sortOrder: 10 },
  { key: "BILLS", name: "Contas", type: "expense", keywords: ["ENERGIA", "AGUA", "INTERNET", "TELEFONE"], sortOrder: 9 },
];

describe("predictCategory", () => {
  describe("empty/whitespace descriptions", () => {
    it('returns "Outros" for empty string', () => {
      expect(predictCategory("")).toBe("Outros");
    });

    it('returns "Outros" for whitespace-only string', () => {
      expect(predictCategory("   ")).toBe("Outros");
    });

    it('returns "Outros" for undefined-ish input', () => {
      expect(predictCategory("", undefined, undefined)).toBe("Outros");
    });
  });

  describe("keyword matching", () => {
    it("matches IFOOD to Alimentação", () => {
      expect(predictCategory("IFOOD Restaurante", undefined, SAMPLE_CATEGORIES)).toBe("Alimentação");
    });

    it("matches UBER to Transporte", () => {
      expect(predictCategory("UBER Trip SP", undefined, SAMPLE_CATEGORIES)).toBe("Transporte");
    });

    it("matches NETFLIX to Assinaturas", () => {
      expect(predictCategory("NETFLIX Premium", undefined, SAMPLE_CATEGORIES)).toBe("Assinaturas");
    });

    it("is case-insensitive", () => {
      expect(predictCategory("ifood delivery", undefined, SAMPLE_CATEGORIES)).toBe("Alimentação");
      expect(predictCategory("uber trip", undefined, SAMPLE_CATEGORIES)).toBe("Transporte");
    });

    it("normalizes accents", () => {
      expect(predictCategory("FARMÁCIA Popular", undefined, SAMPLE_CATEGORIES)).toBe("Saúde");
    });
  });

  describe("payment method skip", () => {
    it('returns "A Categorizar" for PIX', () => {
      expect(predictCategory("PIX Enviado", undefined, SAMPLE_CATEGORIES)).toBe("A Categorizar");
    });

    it('returns "A Categorizar" for TRANSFERENCIA', () => {
      expect(predictCategory("TRANSFERENCIA Para João", undefined, SAMPLE_CATEGORIES)).toBe("A Categorizar");
    });

    it('returns "A Categorizar" for PAGAMENTO EFETUADO', () => {
      expect(predictCategory("PAGAMENTO EFETUADO", undefined, SAMPLE_CATEGORIES)).toBe("A Categorizar");
    });
  });

  describe("user corrections", () => {
    const corrections: CategoryCorrection[] = [
      { userId: "user-1", descriptionPattern: "UBER", category: "Lazer" },
    ];

    it("user corrections override keyword rules", () => {
      expect(predictCategory("UBER Trip", corrections, SAMPLE_CATEGORIES)).toBe("Lazer");
    });

    it("corrections are case-insensitive", () => {
      expect(predictCategory("uber trip sp", corrections, SAMPLE_CATEGORIES)).toBe("Lazer");
    });
  });

  describe("fallback", () => {
    it('returns "Outros" when no match found', () => {
      expect(predictCategory("Random Purchase ABC", undefined, SAMPLE_CATEGORIES)).toBe("Outros");
    });

    it('returns "Outros" with no categories provided', () => {
      expect(predictCategory("IFOOD Delivery")).toBe("Outros");
    });
  });

  describe("sortOrder priority", () => {
    it("matches by sortOrder priority (lower number = higher priority)", () => {
      const categoriesWithConflict: Category[] = [
        { key: "A", name: "Category A", type: "expense", keywords: ["TEST"], sortOrder: 50 },
        { key: "B", name: "Category B", type: "expense", keywords: ["TEST"], sortOrder: 10 },
      ];
      // B has lower sortOrder, so it should match first
      expect(predictCategory("TEST item", undefined, categoriesWithConflict)).toBe("Category B");
    });
  });
});
