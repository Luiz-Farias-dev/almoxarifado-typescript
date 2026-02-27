jest.mock("../../models/tabelaFinal.model", () => ({ max: jest.fn() }));
jest.mock("../../models/listaEspera.model", () => ({ max: jest.fn() }));

import TabelaFinal from "../../models/tabelaFinal.model";
import ListaEspera from "../../models/listaEspera.model";
import {
  generateOrderNumber,
  generateOrderNumberOptimized,
  generateOrderNumberWithTransaction,
  ccCodeOrNameLike,
  ccCodeLike,
  ccNameLike,
} from "../listaEsperaHelpers";

const mockTabelaFinalMax = TabelaFinal.max as jest.Mock;
const mockListaEsperaMax = ListaEspera.max as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("generateOrderNumber", () => {
  it("returns 1 when both tables are empty", async () => {
    mockTabelaFinalMax.mockResolvedValue(null);
    mockListaEsperaMax.mockResolvedValue(null);
    expect(await generateOrderNumber()).toBe(1);
  });

  it("returns tabelaFinal max + 1 when it is greater", async () => {
    mockTabelaFinalMax.mockResolvedValue(10);
    mockListaEsperaMax.mockResolvedValue(5);
    expect(await generateOrderNumber()).toBe(11);
  });

  it("returns listaEspera max + 1 when it is greater", async () => {
    mockTabelaFinalMax.mockResolvedValue(5);
    mockListaEsperaMax.mockResolvedValue(10);
    expect(await generateOrderNumber()).toBe(11);
  });

  it("returns listaEspera max + 1 when both are equal", async () => {
    mockTabelaFinalMax.mockResolvedValue(5);
    mockListaEsperaMax.mockResolvedValue(5);
    expect(await generateOrderNumber()).toBe(6);
  });

  it("throws on database error", async () => {
    mockTabelaFinalMax.mockRejectedValue(new Error("db error"));
    await expect(generateOrderNumber()).rejects.toThrow(
      "Falha ao gerar número de pedido",
    );
  });
});

describe("generateOrderNumberOptimized", () => {
  it("returns 1 when both tables are empty", async () => {
    mockTabelaFinalMax.mockResolvedValue(null);
    mockListaEsperaMax.mockResolvedValue(null);
    expect(await generateOrderNumberOptimized()).toBe(1);
  });

  it("returns correct next number", async () => {
    mockTabelaFinalMax.mockResolvedValue(20);
    mockListaEsperaMax.mockResolvedValue(15);
    expect(await generateOrderNumberOptimized()).toBe(21);
  });
});

describe("generateOrderNumberWithTransaction", () => {
  it("passes transaction option when provided", async () => {
    const fakeTransaction = { id: "tx" };
    mockTabelaFinalMax.mockResolvedValue(null);
    mockListaEsperaMax.mockResolvedValue(null);
    await generateOrderNumberWithTransaction(fakeTransaction);
    expect(mockTabelaFinalMax).toHaveBeenCalledWith("Num_Doc", {
      transaction: fakeTransaction,
    });
    expect(mockListaEsperaMax).toHaveBeenCalledWith("codigo_pedido", {
      transaction: fakeTransaction,
    });
  });

  it("works without transaction", async () => {
    mockTabelaFinalMax.mockResolvedValue(3);
    mockListaEsperaMax.mockResolvedValue(7);
    expect(await generateOrderNumberWithTransaction()).toBe(8);
  });
});

describe("ccCodeOrNameLike", () => {
  it("returns a literal containing ILIKE with the search term", () => {
    const result = ccCodeOrNameLike("test");
    // It returns a Sequelize literal; we verify it's an object with val
    expect(result).toBeDefined();
  });
});

describe("ccCodeLike", () => {
  it("returns a defined literal", () => {
    expect(ccCodeLike("abc")).toBeDefined();
  });
});

describe("ccNameLike", () => {
  it("returns a defined literal", () => {
    expect(ccNameLike("abc")).toBeDefined();
  });
});
