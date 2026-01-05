import { Request, Response, NextFunction } from "express";

import Obra from "./../models/obra.model";

export const createObra = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { nome } = req.body;
  Obra.create({ nome })
    .then((obra) => {
      res.status(201).json(obra);
    })
    .catch((err) => {
      console.error("Erro ao criar obra:", err);
      res.status(500).json({ error: "Erro ao criar obra" });
    });
};
