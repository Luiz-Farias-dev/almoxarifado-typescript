jest.mock("../../models/tabelaFinal.model", () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock("../../models/insumos.model", () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock("../../models/listaEspera.model", () => ({
  __esModule: true,
  default: { destroy: jest.fn() },
}));
jest.mock("../../models/user.model", () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
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

import TabelaFinal from "../../models/tabelaFinal.model";
import Insumos from "../../models/insumos.model";
import ListaEspera from "../../models/listaEspera.model";
import User from "../../models/user.model";
import { createTabelaFinal } from "../tabelaFinal";

function makeMocks(body: any = {}, currentUser?: any) {
  const req: any = { body, currentUser };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => jest.clearAllMocks());

describe("createTabelaFinal", () => {
  const validBody = {
    cpf: "12345678901",
    produtos: [
      {
        Insumo_e_SubInsumo_Cod: "123-456",
        Centro_Negocio_Cod: "CC01",
        quantidade: 10,
      },
    ],
  };

  it("returns 401 when not authenticated", async () => {
    const { req, res, next } = makeMocks(validBody, undefined);
    await createTabelaFinal(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 403 when cpf not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(validBody, user);
    await createTabelaFinal(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("parses code 123-456 into insumoCod=123 and subinsumoCod=456", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ nome: "Receptor" });
    (Insumos.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (TabelaFinal.create as jest.Mock).mockResolvedValue({ id: 1 });
    (ListaEspera.destroy as jest.Mock).mockResolvedValue(1);

    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(validBody, user);
    await createTabelaFinal(req, res, next);

    expect(Insumos.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Insumo_Cod: 123, SubInsumo_Cod: 456 },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("handles code without sub (e.g. '123')", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ nome: "Receptor" });
    (Insumos.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (TabelaFinal.create as jest.Mock).mockResolvedValue({ id: 1 });
    (ListaEspera.destroy as jest.Mock).mockResolvedValue(0);

    const body = {
      cpf: "12345678901",
      produtos: [
        {
          Insumo_e_SubInsumo_Cod: "123",
          Centro_Negocio_Cod: "CC01",
          quantidade: 5,
        },
      ],
    };
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(body, user);
    await createTabelaFinal(req, res, next);

    expect(Insumos.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Insumo_Cod: 123, SubInsumo_Cod: null },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 404 when produto not found and rolls back", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ nome: "Receptor" });
    (Insumos.findOne as jest.Mock).mockResolvedValue(null);

    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(validBody, user);
    await createTabelaFinal(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("works without cpf (null cpf)", async () => {
    (Insumos.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (TabelaFinal.create as jest.Mock).mockResolvedValue({ id: 1 });
    (ListaEspera.destroy as jest.Mock).mockResolvedValue(0);

    const body = {
      produtos: [
        {
          Insumo_e_SubInsumo_Cod: "123-456",
          Centro_Negocio_Cod: "CC01",
          quantidade: 10,
        },
      ],
    };
    const user = { id: 1, tipoFuncionario: "Administrador" };
    const { req, res, next } = makeMocks(body, user);
    await createTabelaFinal(req, res, next);
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
