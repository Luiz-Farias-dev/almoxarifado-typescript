import bcrypt from "bcryptjs";
import { gerarSenhaBase } from "../signupHelpers";

describe("gerarSenhaBase", () => {
  it("returns a valid bcrypt hash", () => {
    const hash = gerarSenhaBase();
    expect(hash).toBeDefined();
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("hash matches the default password 'Padrao#2025'", () => {
    const hash = gerarSenhaBase();
    expect(bcrypt.compareSync("Padrao#2025", hash)).toBe(true);
  });

  it("hash does not match a wrong password", () => {
    const hash = gerarSenhaBase();
    expect(bcrypt.compareSync("WrongPassword", hash)).toBe(false);
  });
});
