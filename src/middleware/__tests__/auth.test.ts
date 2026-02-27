import jwt from "jsonwebtoken";

jest.mock("../../models/user.model", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

import User from "../../models/user.model";
import { getCurrentUser } from "../auth";

const mockFindByPk = User.findByPk as jest.Mock;

function makeMocks(authHeader?: string) {
  const req: any = { headers: { authorization: authHeader } };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
});

describe("getCurrentUser middleware", () => {
  it("returns 401 when no authorization header", async () => {
    const { req, res, next } = makeMocks();
    await getCurrentUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns 401 when header does not start with Bearer", async () => {
    const { req, res, next } = makeMocks("Basic abc");
    await getCurrentUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for invalid token", async () => {
    const { req, res, next } = makeMocks("Bearer invalid-token");
    await getCurrentUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Token inválido" }),
    );
  });

  it("returns 401 for expired token", async () => {
    const token = jwt.sign(
      { id: 1, cpf: "123", tipoFuncionario: "Admin" },
      "test-secret",
      { expiresIn: "0s" },
    );
    // Wait a tick for expiration
    await new Promise((r) => setTimeout(r, 10));
    const { req, res, next } = makeMocks(`Bearer ${token}`);
    await getCurrentUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Token expirado" }),
    );
  });

  it("returns 403 when user not found in DB", async () => {
    const token = jwt.sign(
      { id: 999, cpf: "123", tipoFuncionario: "Admin" },
      "test-secret",
      { expiresIn: "1h" },
    );
    mockFindByPk.mockResolvedValue(null);
    const { req, res, next } = makeMocks(`Bearer ${token}`);
    await getCurrentUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Usuário não encontrado" }),
    );
  });

  it("populates req.currentUser and calls next for valid token + existing user", async () => {
    const token = jwt.sign(
      { id: 1, cpf: "123", tipoFuncionario: "Administrador" },
      "test-secret",
      { expiresIn: "1h" },
    );
    mockFindByPk.mockResolvedValue({
      id: 1,
      tipoFuncionario: "Administrador",
      obraId: 5,
    });
    const { req, res, next } = makeMocks(`Bearer ${token}`);
    await getCurrentUser(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.currentUser).toEqual({
      id: 1,
      tipoFuncionario: "Administrador",
      obraId: 5,
    });
  });
});
