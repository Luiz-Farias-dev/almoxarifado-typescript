import {
  separarCodigo,
  normalizarObsoleto,
  renomearColunas,
  detectarEncodingEDelimitador,
} from "../insumosHelpers";

describe("separarCodigo", () => {
  it("returns nulls for null input", () => {
    expect(separarCodigo(null)).toEqual({ insumo: null, sub: null });
  });

  it("returns nulls for undefined input", () => {
    expect(separarCodigo(undefined)).toEqual({ insumo: null, sub: null });
  });

  it("returns nulls for empty string", () => {
    expect(separarCodigo("")).toEqual({ insumo: null, sub: null });
    expect(separarCodigo("   ")).toEqual({ insumo: null, sub: null });
  });

  it("returns full code as insumo when length <= 3", () => {
    expect(separarCodigo("12")).toEqual({ insumo: "12", sub: null });
    expect(separarCodigo("123")).toEqual({ insumo: "123", sub: null });
  });

  it("splits code into insumo (all but last 3) and sub (last 3)", () => {
    expect(separarCodigo("123456")).toEqual({ insumo: "123", sub: "456" });
    expect(separarCodigo("1234")).toEqual({ insumo: "1", sub: "234" });
  });

  it("handles numeric input by converting to string", () => {
    expect(separarCodigo(123456)).toEqual({ insumo: "123", sub: "456" });
  });
});

describe("normalizarObsoleto", () => {
  it.each(["SIM", "S", "YES", "Y", "TRUE", "1", "OBSOLETO", "OBSSOLETO"])(
    'returns "S" for truthy value "%s"',
    (val) => {
      expect(normalizarObsoleto(val)).toBe("S");
    },
  );

  it("is case-insensitive", () => {
    expect(normalizarObsoleto("sim")).toBe("S");
    expect(normalizarObsoleto("yes")).toBe("S");
  });

  it.each(["NAO", "NÃO", "N", "NO", "FALSE", "0", ""])(
    'returns "N" for falsy value "%s"',
    (val) => {
      expect(normalizarObsoleto(val)).toBe("N");
    },
  );

  it('returns "N" for null/undefined', () => {
    expect(normalizarObsoleto(null)).toBe("N");
    expect(normalizarObsoleto(undefined)).toBe("N");
  });

  it("returns the trimmed uppercase value for unrecognized strings", () => {
    expect(normalizarObsoleto("MAYBE")).toBe("MAYBE");
  });
});

describe("renomearColunas", () => {
  it("renames columns according to the mapping", () => {
    const row = { "Código Insumo": "123", Unidade: "kg", extra: "x" };
    const mapping = { "Código Insumo": "Insumo_Codigo", Unidade: "Unid_Cod" };
    const result = renomearColunas(row, mapping);
    expect(result).toEqual({ Insumo_Codigo: "123", Unid_Cod: "kg", extra: "x" });
  });

  it("does not modify original row", () => {
    const row = { a: 1 };
    renomearColunas(row, { a: "b" });
    expect(row).toEqual({ a: 1 });
  });

  it("handles identity mapping (same key -> same key)", () => {
    const row = { Insumo_Cod: "123" };
    const result = renomearColunas(row, { Insumo_Cod: "Insumo_Cod" });
    expect(result).toEqual({ Insumo_Cod: "123" });
  });

  it("ignores mapping keys not present in the row", () => {
    const row = { a: 1 };
    const result = renomearColunas(row, { b: "c" });
    expect(result).toEqual({ a: 1 });
  });
});

describe("detectarEncodingEDelimitador", () => {
  it("detects comma as delimiter for CSV content", () => {
    const csv = "a,b,c\n1,2,3\n4,5,6";
    const buf = Buffer.from(csv, "utf-8");
    const result = detectarEncodingEDelimitador(buf);
    expect(result.delimiter).toBe(",");
    expect(result.encoding).toBeDefined();
  });

  it("detects semicolon as delimiter when more frequent", () => {
    const csv = "a;b;c\n1;2;3\n4;5;6";
    const buf = Buffer.from(csv, "utf-8");
    const result = detectarEncodingEDelimitador(buf);
    expect(result.delimiter).toBe(";");
  });

  it("detects tab delimiter", () => {
    const csv = "a\tb\tc\n1\t2\t3\n4\t5\t6";
    const buf = Buffer.from(csv, "utf-8");
    const result = detectarEncodingEDelimitador(buf);
    expect(result.delimiter).toBe("\t");
  });
});
