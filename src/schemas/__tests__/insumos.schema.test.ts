import { produtoBaseSchema } from "../insumos/insumos.schema";

describe("produtoBaseSchema", () => {
  const validData = {
    Insumo_Cod: "12345",
    Unid_Cod: "KG",
    SubInsumo_Especificacao: "Cimento Portland",
  };

  it("accepts valid data with required fields", () => {
    expect(() => produtoBaseSchema.parse(validData)).not.toThrow();
  });

  it("applies defaults for optional fields", () => {
    const result = produtoBaseSchema.parse(validData);
    expect(result.INSUMO_ITEMOBSOLETO).toBe("");
    expect(result.descricao).toBe("");
  });

  it("rejects missing Insumo_Cod", () => {
    const { Insumo_Cod, ...rest } = validData;
    expect(() => produtoBaseSchema.parse(rest)).toThrow();
  });

  it("rejects empty Insumo_Cod", () => {
    expect(() => produtoBaseSchema.parse({ ...validData, Insumo_Cod: "" })).toThrow();
  });

  it("rejects Insumo_Cod over 50 chars", () => {
    expect(() =>
      produtoBaseSchema.parse({ ...validData, Insumo_Cod: "x".repeat(51) }),
    ).toThrow();
  });

  it("rejects missing Unid_Cod", () => {
    const { Unid_Cod, ...rest } = validData;
    expect(() => produtoBaseSchema.parse(rest)).toThrow();
  });

  it("rejects Unid_Cod over 20 chars", () => {
    expect(() =>
      produtoBaseSchema.parse({ ...validData, Unid_Cod: "x".repeat(21) }),
    ).toThrow();
  });

  it("rejects missing SubInsumo_Especificacao", () => {
    const { SubInsumo_Especificacao, ...rest } = validData;
    expect(() => produtoBaseSchema.parse(rest)).toThrow();
  });

  it("accepts optional SubInsumo_Cod", () => {
    const result = produtoBaseSchema.parse({
      ...validData,
      SubInsumo_Cod: "001",
    });
    expect(result.SubInsumo_Cod).toBe("001");
  });

  it("accepts null SubInsumo_Cod", () => {
    const result = produtoBaseSchema.parse({
      ...validData,
      SubInsumo_Cod: null,
    });
    expect(result.SubInsumo_Cod).toBeNull();
  });
});
