jest.mock("../../models/insumos.model", () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    sequelize: { query: jest.fn() },
  },
}));

import Insumos from "../../models/insumos.model";
import { uploadInsumos, createInsumo, getAllInsumos } from "../insumos";

function makeMocks(body: any = {}, file?: any) {
  const req: any = { body, file };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

beforeEach(() => jest.clearAllMocks());

describe("uploadInsumos", () => {
  it("returns 400 when no file is provided", async () => {
    const { req, res, next } = makeMocks();
    await uploadInsumos(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Nenhum arquivo foi enviado." }),
    );
  });

  it("returns 400 for unsupported file format", async () => {
    const file = {
      originalname: "data.txt",
      buffer: Buffer.from("data"),
      mimetype: "text/plain",
    };
    const { req, res, next } = makeMocks({}, file);
    await uploadInsumos(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Formato de arquivo não suportado"),
      }),
    );
  });
});

describe("createInsumo", () => {
  it("creates an insumo and returns 201", async () => {
    const body = {
      Insumo_Cod: "123",
      Unid_Cod: "KG",
      SubInsumo_Especificacao: "Cimento",
    };
    const created = { toJSON: () => ({ id: 1, ...body }) };
    (Insumos.create as jest.Mock).mockResolvedValue(created);

    const { req, res, next } = makeMocks(body);
    await createInsumo(req, res, next);
    expect(Insumos.create).toHaveBeenCalledWith(expect.objectContaining(body));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 500 on database error", async () => {
    (Insumos.create as jest.Mock).mockRejectedValue(new Error("db error"));
    const body = {
      Insumo_Cod: "123",
      Unid_Cod: "KG",
      SubInsumo_Especificacao: "Cimento",
    };
    const { req, res, next } = makeMocks(body);
    await createInsumo(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getAllInsumos", () => {
  it("returns all insumos with 200", async () => {
    const items = [
      { toJSON: () => ({ id: 1, Insumo_Cod: "1" }) },
      { toJSON: () => ({ id: 2, Insumo_Cod: "2" }) },
    ];
    (Insumos.findAll as jest.Mock).mockResolvedValue(items);

    const { req, res, next } = makeMocks();
    await getAllInsumos(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it("returns 500 on database error", async () => {
    (Insumos.findAll as jest.Mock).mockRejectedValue(new Error("db error"));
    const { req, res, next } = makeMocks();
    await getAllInsumos(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
