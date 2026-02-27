jest.mock("../../models/obra.model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

import Obra from "../../models/obra.model";
import { createObra, getAllObras, getObraById } from "../obra";

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

describe("createObra", () => {
  it("creates obra and returns 201", async () => {
    (Obra.create as jest.Mock).mockResolvedValue({ id: 1, name: "Obra A" });
    const { req, res, next } = makeMocks({ name: "Obra A" });
    createObra(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(Obra.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Obra A" }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 400 for validation error (bad body)", () => {
    const { req, res, next } = makeMocks({ name: "A" }); // too short
    createObra(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("getAllObras", () => {
  it("returns all obras with 200", async () => {
    (Obra.findAll as jest.Mock).mockResolvedValue([
      { id: 1, name: "Obra A" },
      { id: 2, name: "Obra B" },
    ]);
    const { req, res, next } = makeMocks();
    getAllObras(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on database error", async () => {
    (Obra.findAll as jest.Mock).mockRejectedValue(new Error("db error"));
    const { req, res, next } = makeMocks();
    getAllObras(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getObraById", () => {
  it("returns 400 for invalid obraId", () => {
    const { req, res, next } = makeMocks({}, { obraId: "abc" });
    getObraById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when obra not found", async () => {
    (Obra.findByPk as jest.Mock).mockResolvedValue(null);
    const { req, res, next } = makeMocks({}, { obraId: "1" });
    getObraById(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns obra when found", async () => {
    (Obra.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: "Obra A" });
    const { req, res, next } = makeMocks({}, { obraId: "1" });
    getObraById(req, res, next);
    await new Promise((r) => setTimeout(r, 10));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
