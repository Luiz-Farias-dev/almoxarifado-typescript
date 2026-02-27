import { signUpBodySchema, loginBodySchema } from "../auth/auth.schema";

describe("signUpBodySchema", () => {
  it("accepts valid Administrador data (no obraId needed)", () => {
    const data = {
      nome: "Admin User",
      cpf: "12345678901",
      tipoFuncionario: "Administrador",
    };
    expect(() => signUpBodySchema.parse(data)).not.toThrow();
  });

  it("accepts valid Almoxarife data with obraId and centroCustoIds", () => {
    const data = {
      nome: "Almox User",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: 1,
      centroCustoIds: [1, 2],
    };
    expect(() => signUpBodySchema.parse(data)).not.toThrow();
  });

  it("rejects Almoxarife without obraId", () => {
    const data = {
      nome: "Almox User",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      centroCustoIds: [1],
    };
    expect(() => signUpBodySchema.parse(data)).toThrow();
  });

  it("rejects Almoxarife without centroCustoIds", () => {
    const data = {
      nome: "Almox User",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: 1,
    };
    expect(() => signUpBodySchema.parse(data)).toThrow();
  });

  it("rejects Almoxarife with empty centroCustoIds", () => {
    const data = {
      nome: "Almox User",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: 1,
      centroCustoIds: [],
    };
    expect(() => signUpBodySchema.parse(data)).toThrow();
  });

  it("rejects missing nome", () => {
    const data = { cpf: "123", tipoFuncionario: "Administrador" };
    expect(() => signUpBodySchema.parse(data)).toThrow();
  });

  it("rejects missing cpf", () => {
    const data = { nome: "Test", tipoFuncionario: "Administrador" };
    expect(() => signUpBodySchema.parse(data)).toThrow();
  });

  it("coerces string obraId to number", () => {
    const data = {
      nome: "Almox User",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: "1",
      centroCustoIds: [1],
    };
    const result = signUpBodySchema.parse(data);
    expect(result.obraId).toBe(1);
  });
});

describe("loginBodySchema", () => {
  it("accepts valid login data", () => {
    const data = { cpf: "12345678901", senha: "password" };
    const result = loginBodySchema.parse(data);
    expect(result.cpf).toBe("12345678901");
    expect(result.senha).toBe("password");
  });

  it("rejects missing cpf", () => {
    expect(() => loginBodySchema.parse({ senha: "pass" })).toThrow();
  });

  it("rejects missing senha", () => {
    expect(() => loginBodySchema.parse({ cpf: "123" })).toThrow();
  });

  it("rejects empty cpf", () => {
    expect(() => loginBodySchema.parse({ cpf: "", senha: "pass" })).toThrow();
  });

  it("rejects empty senha", () => {
    expect(() => loginBodySchema.parse({ cpf: "123", senha: "" })).toThrow();
  });
});
