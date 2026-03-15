import { parseCSV } from "@/services/csv";
import type { CSVSource } from "@/components/ImportCSVModal";

// Mock the categoryPredictor
jest.mock("@/lib/categoryPredictor", () => ({
  predictCategory: jest.fn(() => "Outros"),
}));

describe("CSV Service - parseCSV", () => {
  describe("Nubank Checking", () => {
    const source: CSVSource = "NUBANK_CHECKING";

    it("parses valid Nubank checking CSV", () => {
      const csv = `Data,Valor,Identificador,Descrição
01/08/2025,-20.00,UUID123,Compra no débito - Supermercado
02/08/2025,5000.00,UUID456,Salário`;

      const result = parseCSV(csv, source);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2025-08-01");
      expect(result[0].amount).toBe("20.00");
      expect(result[0].type).toBe("expense");
      expect(result[0].origin).toBe("CASH");

      expect(result[1].type).toBe("income");
      expect(result[1].amount).toBe("5000.00");
    });

    it("throws for invalid format", () => {
      const csv = `Wrong,Headers,Here
data1,data2,data3`;

      expect(() => parseCSV(csv, source)).toThrow("Formato Nubank Extrato inválido");
    });

    it("throws for empty CSV", () => {
      expect(() => parseCSV("header", source)).toThrow("CSV vazio ou inválido");
    });

    it("skips lines with zero amount", () => {
      const csv = `Data,Valor,Identificador,Descrição
01/08/2025,0,UUID123,Saldo anterior
02/08/2025,-50.00,UUID456,Compra`;

      const result = parseCSV(csv, source);
      expect(result).toHaveLength(1);
    });
  });

  describe("Nubank Credit", () => {
    const source: CSVSource = "NUBANK_CREDIT";

    it("parses valid Nubank credit CSV", () => {
      const csv = `date,title,amount
2025-06-14,Apple.Com/Bill,39.90
2025-06-15,Spotify,21.90`;

      const result = parseCSV(csv, source);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2025-06-14");
      expect(result[0].amount).toBe("39.90");
      expect(result[0].type).toBe("expense"); // credit card = always expense
      expect(result[0].origin).toBe("CREDIT_CARD");
      expect(result[0].card).toBe("Nubank");
    });

    it("throws for invalid format", () => {
      const csv = `data,desc,valor
2025-06-14,Test,10`;

      expect(() => parseCSV(csv, source)).toThrow("Formato Nubank Fatura inválido");
    });
  });

  describe("Itau Checking", () => {
    const source: CSVSource = "ITAU_CHECKING";

    it("parses valid Itaú checking CSV with semicolons", () => {
      const csv = `Data;Descricao;Valor
05/06/2025;Pagamento Conta;-28,76
06/06/2025;Salário;5.000,00`;

      const result = parseCSV(csv, source);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2025-06-05");
      expect(result[0].amount).toBe("28.76");
      expect(result[0].type).toBe("expense");

      expect(result[1].amount).toBe("5000.00");
      expect(result[1].type).toBe("income");
    });

    it("throws for invalid format", () => {
      const csv = `Wrong;Headers;Valor
data;desc;val`;

      expect(() => parseCSV(csv, source)).toThrow("Formato Itaú Extrato inválido");
    });
  });

  describe("Itau Credit", () => {
    const source: CSVSource = "ITAU_CREDIT";

    it("parses valid Itaú credit CSV", () => {
      const csv = `data,lançamento,valor
2025-11-12,MP *NOVAPOINT,31`;

      const result = parseCSV(csv, source);

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("MP *NOVAPOINT");
      expect(result[0].amount).toBe("31.00");
      expect(result[0].origin).toBe("CREDIT_CARD");
      expect(result[0].card).toBe("Itaú");
    });
  });

  describe("unknown source", () => {
    it("throws for unknown source type", () => {
      expect(() => parseCSV("header\ndata", "UNKNOWN" as CSVSource)).toThrow("Formato desconhecido");
    });
  });
});
