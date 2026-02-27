import { createCentroCustoBodySchema } from "../centroCusto/centroCusto.schema";

describe("createCentroCustoBodySchema", () => {
  const validData = {
    Centro_Negocio_Cod: "CC001",
    Centro_Nome: "Centro Alpha",
    work_id: 1,
  };

  it("accepts valid data", () => {
    const result = createCentroCustoBodySchema.parse(validData);
    expect(result.Centro_Negocio_Cod).toBe("CC001");
    expect(result.Centro_Nome).toBe("Centro Alpha");
    expect(result.work_id).toBe(1);
  });

  it("rejects Centro_Negocio_Cod shorter than 3 chars", () => {
    expect(() =>
      createCentroCustoBodySchema.parse({ ...validData, Centro_Negocio_Cod: "CC" }),
    ).toThrow();
  });

  it("rejects Centro_Nome shorter than 3 chars", () => {
    expect(() =>
      createCentroCustoBodySchema.parse({ ...validData, Centro_Nome: "AB" }),
    ).toThrow();
  });

  it("rejects negative work_id", () => {
    expect(() =>
      createCentroCustoBodySchema.parse({ ...validData, work_id: -1 }),
    ).toThrow();
  });

  it("rejects zero work_id", () => {
    expect(() =>
      createCentroCustoBodySchema.parse({ ...validData, work_id: 0 }),
    ).toThrow();
  });

  it("rejects non-integer work_id", () => {
    expect(() =>
      createCentroCustoBodySchema.parse({ ...validData, work_id: 1.5 }),
    ).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => createCentroCustoBodySchema.parse({})).toThrow();
    expect(() =>
      createCentroCustoBodySchema.parse({ Centro_Negocio_Cod: "CC001" }),
    ).toThrow();
  });
});
