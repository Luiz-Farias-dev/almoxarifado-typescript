jest.mock("../../models/listaEspera.model", () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));
jest.mock("../../models/centroCusto.model", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findAll: jest.fn() },
}));
jest.mock("../../models/insumos.model", () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock("../../models/userCentroCusto.model", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findAll: jest.fn() },
}));
jest.mock("../../config/dbConfig", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  },
}));
jest.mock("../../utils/listaEsperaHelpers", () => ({
  generateOrderNumberOptimized: jest.fn(() => 42),
  ccCodeOrNameLike: jest.fn(() => ({ val: "mock" })),
  ccCodeExprAlt: jest.fn(() => ({ val: "mock" })),
}));

import ListaEspera from "../../models/listaEspera.model";
import CentroCusto from "../../models/centroCusto.model";
import Insumos from "../../models/insumos.model";
import UserCentroCusto from "../../models/userCentroCusto.model";
import {
  createListaEspera,
  readListaEspera,
  deleteListaEspera,
} from "../listaEspera";

function makeMocks(body: any = {}, currentUser?: any, query?: any, params?: any) {
  const req: any = { body, currentUser, query: query || {}, params: params || {} };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => jest.clearAllMocks());

describe("createListaEspera", () => {
  const validBody = {
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

  it("returns 401 when user is not authenticated", async () => {
    const { req, res, next } = makeMocks(validBody, undefined);
    await createListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 when centro custo not found", async () => {
    (CentroCusto.findOne as jest.Mock).mockResolvedValue(null);
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(validBody, user);
    await createListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 403 when Almoxarife has no obraId", async () => {
    (CentroCusto.findOne as jest.Mock).mockResolvedValue({
      Centro_Negocio_Cod: "CC01",
      work_id: 1,
    });
    const user = { id: 1, tipoFuncionario: "Almoxarife" };
    const { req, res, next } = makeMocks(validBody, user);
    await createListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("creates items successfully as Administrador", async () => {
    (CentroCusto.findOne as jest.Mock).mockResolvedValue({
      Centro_Negocio_Cod: "CC01",
      Centro_Nome: "Centro 01",
      work_id: 1,
    });
    (Insumos.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (ListaEspera.create as jest.Mock).mockResolvedValue({ id: 1 });
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(validBody, user);
    await createListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ codigo_pedido: 42 }),
    );
  });

  it("returns 403 for unauthorized role", async () => {
    (CentroCusto.findOne as jest.Mock).mockResolvedValue({
      Centro_Negocio_Cod: "CC01",
      work_id: 1,
    });
    const user = { id: 1, tipoFuncionario: "Visitante" };
    const { req, res, next } = makeMocks(validBody, user);
    await createListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("readListaEspera", () => {
  it("returns 401 when not authenticated", async () => {
    const { req, res, next } = makeMocks({}, undefined, {});
    await readListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns list for Administrador", async () => {
    (ListaEspera.findAll as jest.Mock).mockResolvedValue([
      {
        toJSON: () => ({
          id: 1,
          codigo_pedido: 1,
          Insumo_Cod: 1,
          SubInsumo_Cod: 2,
          SubInsumo_Especificacao: "Test",
          quantidade: 1,
          almoxarife_nome: "J",
          centro_custo: {},
          Unid_Cod: "KG",
          destino: "A",
          data_att: null,
        }),
      },
    ]);
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks({}, user, {});
    await readListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 403 for unauthorized role", async () => {
    const user = { id: 1, tipoFuncionario: "Visitante" };
    const { req, res, next } = makeMocks({}, user, {});
    await readListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns empty array for Almoxarife with no CCs", async () => {
    (UserCentroCusto.findAll as jest.Mock).mockResolvedValue([]);
    const user = { id: 1, tipoFuncionario: "Almoxarife", obraId: 1 };
    const { req, res, next } = makeMocks({}, user, {});
    await readListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("deleteListaEspera", () => {
  it("returns 401 when not authenticated", async () => {
    const { req, res, next } = makeMocks({}, undefined, {}, {
      codigo_pedido: "1",
      Insumo_Cod: "1",
      SubInsumo_Cod: "2",
    });
    await deleteListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("deletes item as Administrador", async () => {
    (ListaEspera.destroy as jest.Mock).mockResolvedValue(1);
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks({}, user, {}, {
      codigo_pedido: "1",
      Insumo_Cod: "1",
      SubInsumo_Cod: "2",
    });
    await deleteListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when item not found", async () => {
    (ListaEspera.destroy as jest.Mock).mockResolvedValue(0);
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks({}, user, {}, {
      codigo_pedido: "1",
      Insumo_Cod: "1",
      SubInsumo_Cod: "2",
    });
    await deleteListaEspera(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
