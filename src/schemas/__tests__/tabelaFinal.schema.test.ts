import { tabelaFinalBodySchema } from "../tabelaFinal/tabelaFinal.schema";

describe("tabelaFinalBodySchema", () => {
  const validData = {
    cpf: "12345678901",
    produtos: [
      {
        Insumo_e_SubInsumo_Cod: "123-456",
        Centro_Negocio_Cod: "CC01",
        quantidade: 10,
      },
    ],
  };

  it("accepts valid data", () => {
    expect(() => tabelaFinalBodySchema.parse(validData)).not.toThrow();
  });

  it("accepts null cpf", () => {
    const result = tabelaFinalBodySchema.parse({ ...validData, cpf: null });
    expect(result.cpf).toBeNull();
  });

  it("accepts undefined cpf", () => {
    const { cpf, ...rest } = validData;
    const result = tabelaFinalBodySchema.parse(rest);
    expect(result.cpf).toBeUndefined();
  });

  it("rejects empty produtos array", () => {
    expect(() =>
      tabelaFinalBodySchema.parse({ ...validData, produtos: [] }),
    ).toThrow();
  });

  it("rejects missing produtos", () => {
    expect(() => tabelaFinalBodySchema.parse({ cpf: "123" })).toThrow();
  });

  it("accepts optional fields on produto", () => {
    const data = {
      produtos: [
        {
          Insumo_e_SubInsumo_Cod: "123",
          Centro_Negocio_Cod: "CC01",
          quantidade: 1,
          destino: "Obra A",
          Observacao: "test",
          almoxarife_nome: "João",
          Tipo_Doc: "ND",
          codigo_pedido: 42,
        },
      ],
    };
    expect(() => tabelaFinalBodySchema.parse(data)).not.toThrow();
  });
});
