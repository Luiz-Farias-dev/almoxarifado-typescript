import { Request, Response, NextFunction } from "express";

import CentroCusto from "./../models/centroCusto.model";

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
