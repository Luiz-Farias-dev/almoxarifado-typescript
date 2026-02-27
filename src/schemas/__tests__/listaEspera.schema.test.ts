import {
  createListaEsperaBodySchema,
  getListaEsperaQuerySchema,
} from "../listaEspera/listaEspera.schema";

describe("createListaEsperaBodySchema", () => {
  const validData = {
    centro_custo: { Centro_Negocio_Cod: "CC01" },
    produtos: [
      {
        Insumo_Cod: 1,
        SubInsumo_Cod: 2,
        SubInsumo_Especificacao: "Cimento",
        quantidade: 5,
        Unid_Cod: "KG",
      },
    ],
    almoxarife_nome: "João",
    destino: "Obra A",
  };

  it("accepts valid data", () => {
    expect(() => createListaEsperaBodySchema.parse(validData)).not.toThrow();
  });

  it("rejects empty produtos array", () => {
    expect(() =>
      createListaEsperaBodySchema.parse({ ...validData, produtos: [] }),
    ).toThrow();
  });

  it("rejects missing centro_custo", () => {
    const { centro_custo, ...rest } = validData;
    expect(() => createListaEsperaBodySchema.parse(rest)).toThrow();
  });

  it("rejects missing almoxarife_nome", () => {
    const { almoxarife_nome, ...rest } = validData;
    expect(() => createListaEsperaBodySchema.parse(rest)).toThrow();
  });

  it("rejects missing destino", () => {
    const { destino, ...rest } = validData;
    expect(() => createListaEsperaBodySchema.parse(rest)).toThrow();
  });

  it("defaults quantidade to 1", () => {
    const data = {
      ...validData,
      produtos: [
        {
          Insumo_Cod: 1,
          SubInsumo_Cod: 2,
          SubInsumo_Especificacao: "Cimento",
          Unid_Cod: "KG",
        },
      ],
    };
    const result = createListaEsperaBodySchema.parse(data);
    expect(result.produtos[0]!.quantidade).toBe(1);
  });
});

describe("getListaEsperaQuerySchema", () => {
  it("applies defaults for skip and limit", () => {
    const result = getListaEsperaQuerySchema.parse({});
    expect(result.skip).toBe(0);
    expect(result.limit).toBe(100);
  });

  it("coerces string query params to numbers", () => {
    const result = getListaEsperaQuerySchema.parse({
      skip: "10",
      limit: "50",
      codigo_pedido: "3",
    });
    expect(result.skip).toBe(10);
    expect(result.limit).toBe(50);
    expect(result.codigo_pedido).toBe(3);
  });

  it("rejects negative skip", () => {
    expect(() => getListaEsperaQuerySchema.parse({ skip: -1 })).toThrow();
  });

  it("rejects limit > 1000", () => {
    expect(() => getListaEsperaQuerySchema.parse({ limit: 1001 })).toThrow();
  });

  it("accepts optional filter params", () => {
    const result = getListaEsperaQuerySchema.parse({
      destino: "Obra A",
      centro_custo: "CC01",
    });
    expect(result.destino).toBe("Obra A");
    expect(result.centro_custo).toBe("CC01");
  });
});
