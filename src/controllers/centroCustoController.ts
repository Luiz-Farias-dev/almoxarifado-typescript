import { Request, Response, NextFunction } from "express";

import CentroCusto from "./../models/centroCusto.model";

import {
  createCentroCustoBodySchema,
  CreateCentroCustoBodyDto,
} from "../schemas/centroCusto/centroCusto.schema";
import {
  centroCustoResponseDto,
  centroCustoResponseSchema,
  GetAllCentroCustoResponseSchema,
  getAllCentroCustoDto,
} from "../schemas/centroCusto/centroCusto.response";

export const getAllCentroCusto = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  CentroCusto.findAll({ attributes: ["id", "nome"], raw: true })
    .then((centroCustos) => {
      const dto: getAllCentroCustoDto =
        GetAllCentroCustoResponseSchema.parse(centroCustos);
      res.status(200).json(dto);
    })
    .catch((err) => {
      console.error("Erro ao buscar centros de custo:", err);
      res.status(500).json({ error: "Erro ao buscar centros de custo" });
    });
};

export const createCentroCusto = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const dto: CreateCentroCustoBodyDto = createCentroCustoBodySchema.parse(
    req.body
  );

  CentroCusto.create(dto)
    .then((centroCusto) => {
      res.status(201).json(centroCusto);
    })
    .catch((err) => {
      console.error("Erro ao criar centro de custo:", err);
      res.status(500).json({ error: "Erro ao criar centro de custo" });
    });
};
