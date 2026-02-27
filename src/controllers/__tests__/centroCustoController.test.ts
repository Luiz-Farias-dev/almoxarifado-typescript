jest.mock("../../models/centroCusto.model", () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

import CentroCusto from "../../models/centroCusto.model";
import {
  getAllCentroCusto,
  createCentroCusto,
  deleteCentroCusto,
} from "../centroCustoController";

function makeMocks(body: any = {}, params: any = {}) {
  const req: any = { body, params };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => jest.clearAllMocks());

describe("getAllCentroCusto", () => {
  it("returns all centros with 200", async () => {
    (CentroCusto.findAll as jest.Mock).mockResolvedValue([
      { id: 1, nome: "CC1" },
    ]);
    const { req, res, next } = makeMocks();
    getAllCentroCusto(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on database error", async () => {
    (CentroCusto.findAll as jest.Mock).mockRejectedValue(new Error("db"));
    const { req, res, next } = makeMocks();
    getAllCentroCusto(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("createCentroCusto", () => {
  it("creates centro custo and returns 201", async () => {
    const body = {
      Centro_Negocio_Cod: "CC001",
      Centro_Nome: "Centro Alpha",
      work_id: 1,
    };
    (CentroCusto.create as jest.Mock).mockResolvedValue({ id: 1, ...body });
    const { req, res, next } = makeMocks(body);
    createCentroCusto(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(CentroCusto.create).toHaveBeenCalledWith(
      expect.objectContaining(body),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 500 on database error", async () => {
    const body = {
      Centro_Negocio_Cod: "CC001",
      Centro_Nome: "Centro Alpha",
      work_id: 1,
    };
    (CentroCusto.create as jest.Mock).mockRejectedValue(new Error("db"));
    const { req, res, next } = makeMocks(body);
    createCentroCusto(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("deleteCentroCusto", () => {
  it("returns 400 for invalid centroId", () => {
    const { req, res, next } = makeMocks({}, { centroId: "abc" });
    deleteCentroCusto(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deletes and returns 200", async () => {
    (CentroCusto.destroy as jest.Mock).mockResolvedValue(1);
    const { req, res, next } = makeMocks({}, { centroId: "1" });
    deleteCentroCusto(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when centro not found", async () => {
    (CentroCusto.destroy as jest.Mock).mockResolvedValue(0);
    const { req, res, next } = makeMocks({}, { centroId: "999" });
    deleteCentroCusto(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
