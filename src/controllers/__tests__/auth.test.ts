jest.mock("../../models/user.model", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() },
}));
jest.mock("../../models/obra.model", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));
jest.mock("../../models/centroCusto.model", () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));
jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    genSaltSync: jest.fn(() => "$2a$10$salt"),
    hashSync: jest.fn(() => "$2a$10$hashedpassword"),
    compare: jest.fn(),
  },
}));
jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: { sign: jest.fn(() => "mock-jwt-token") },
}));
jest.mock("../../utils/signupHelpers", () => ({
  gerarSenhaBase: jest.fn(() => "$2a$10$hashedDefault"),
}));

import User from "../../models/user.model";
import Obra from "../../models/obra.model";
import CentroCusto from "../../models/centroCusto.model";
import bcrypt from "bcryptjs";
import { signUp, login } from "../auth";

const mockUserFindOne = User.findOne as jest.Mock;
const mockUserCreate = User.create as jest.Mock;
const mockObraFindByPk = Obra.findByPk as jest.Mock;
const mockCCFindAll = CentroCusto.findAll as jest.Mock;

function makeMocks(body: any = {}) {
  const req: any = { body };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => jest.clearAllMocks());

describe("signUp", () => {
  it("creates Administrador successfully", async () => {
    const body = {
      nome: "Admin",
      cpf: "12345678901",
      tipoFuncionario: "Administrador",
    };
    mockUserCreate.mockResolvedValue({
      toJSON: () => ({ id: 1, ...body, senha_hash: "hash" }),
    });

    const { req, res, next } = makeMocks(body);
    await signUp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.any(Object) }),
    );
  });

  it("creates Almoxarife with valid obra and centros", async () => {
    const body = {
      nome: "Almox",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: 1,
      centroCustoIds: [1, 2],
    };
    mockObraFindByPk.mockResolvedValue({ id: 1 });
    mockCCFindAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockUserCreate.mockResolvedValue({
      toJSON: () => ({ id: 1, ...body, senha_hash: "hash" }),
    });

    const { req, res, next } = makeMocks(body);
    await signUp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 400 when obra not found for Almoxarife", async () => {
    const body = {
      nome: "Almox",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: 999,
      centroCustoIds: [1],
    };
    mockObraFindByPk.mockResolvedValue(null);

    const { req, res, next } = makeMocks(body);
    await signUp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Obra não encontrada" }),
    );
  });

  it("returns 400 when some centros not found", async () => {
    const body = {
      nome: "Almox",
      cpf: "12345678901",
      tipoFuncionario: "Almoxarife",
      obraId: 1,
      centroCustoIds: [1, 2, 3],
    };
    mockObraFindByPk.mockResolvedValue({ id: 1 });
    mockCCFindAll.mockResolvedValue([{ id: 1 }]); // Only 1 of 3

    const { req, res, next } = makeMocks(body);
    await signUp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Algum centro de custo não foi encontrado",
      }),
    );
  });

  it("calls next on validation error", async () => {
    const { req, res, next } = makeMocks({}); // missing required fields
    await signUp(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("login", () => {
  it("returns token for valid credentials", async () => {
    mockUserFindOne.mockResolvedValue({
      id: 1,
      cpf: "12345678901",
      nome: "User",
      tipo_funcionario: "Administrador",
      senha_hash: "$2a$10$hash",
      obra_id: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const { req, res, next } = makeMocks({
      cpf: "12345678901",
      senha: "password",
    });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: "mock-jwt-token" }),
    );
  });

  it("returns 401 when user not found", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const { req, res, next } = makeMocks({
      cpf: "00000000000",
      senha: "pass",
    });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when password is wrong", async () => {
    mockUserFindOne.mockResolvedValue({
      id: 1,
      cpf: "123",
      senha_hash: "$2a$10$hash",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const { req, res, next } = makeMocks({ cpf: "123", senha: "wrong" });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Credenciais inválidas" }),
    );
  });
});
