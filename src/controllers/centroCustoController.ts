import { Request, Response, NextFunction } from "express";

import CentroCusto from "./../models/centroCusto.model";

export const getAllCentroCusto = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  CentroCusto.findAll()
    .then((centroCustos) => {
      res.status(200).json(centroCustos);
    })
    .catch((err) => {
      console.error("Erro ao buscar centros de custo:", err);
      res.status(500).json({ error: "Erro ao buscar centros de custo" });
    });
};
