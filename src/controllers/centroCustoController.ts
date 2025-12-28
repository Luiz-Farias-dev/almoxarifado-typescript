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

export const deleteCentroCusto = (
  req: Request<{ centroId: string }>,
  res: Response,
  next: NextFunction
): void => {
  const centroId = parseInt(req.params.centroId, 10);

  CentroCusto.destroy({ where: { id: centroId } })
    .then((deletedCount) => {
      if (deletedCount === 0) {
        res.status(404).json({ error: "Centro de custo não encontrado" });
      } else {
        res
          .status(200)
          .json({ message: "Centro de custo deletado com sucesso" });
      }
    })
    .catch((err) => {
      console.error("Erro ao deletar centro de custo:", err);
      res.status(500).json({ error: "Erro ao deletar centro de custo" });
    });
};
