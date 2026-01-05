import { Request, Response, NextFunction } from "express";

import Obra from "./../models/obra.model";

import {
  createObraBodySchema,
  CreateObraBodyDto,
} from "../schemas/obra/obra.schema";

export const createObra = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const dto: CreateObraBodyDto = createObraBodySchema.parse(req.body);
  Obra.create(dto)
    .then((obra) => {
      res.status(201).json(obra);
    })
    .catch((err) => {
      console.error("Erro ao criar obra:", err);
      res.status(500).json({ error: "Erro ao criar obra" });
    });
};
