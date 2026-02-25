import { Request, Response, NextFunction } from "express";

import Obra from "./../models/obra.model";

import {
  createObraBodySchema,
  CreateObraBodyDto,
} from "../schemas/obra/obra.schema";
import {
  obraResponseSchema,
  ObraResponseDto,
  getAllObraResponseSchema,
  getAllObraResponseDto,
} from "../schemas/obra/obra.response";

export const createObra = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const dto: CreateObraBodyDto = createObraBodySchema.parse(req.body);

    Obra.create(dto)
      .then((obra) => {
        res.status(201).json(obra);
      })
      .catch((err) => {
        console.error("Erro ao criar obra:", err);

        if (err.name === "SequelizeValidationError") {
          res.status(400).json({ error: "Dados inválidos para criação de obra" });
          return;
        }

        res.status(500).json({ error: "Erro ao criar obra" });
      });
  } catch (err: any) {
    console.error("Erro de validação ao criar obra:", err);
    res.status(400).json({ error: "Dados inválidos para criação de obra" });
  }
};

export const getAllObras = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  Obra.findAll({ attributes: ["id", "name"], raw: true })
    .then((obras) => {
      const dto: getAllObraResponseDto = getAllObraResponseSchema.parse(obras);
      res.status(200).json(dto);
    })
    .catch((err) => {
      console.error("Erro ao buscar obras:", err);
      res.status(500).json({ error: "Erro ao buscar obras" });
    });
};

export const getObraById = (
  req: Request<{ obraId: string }>,
  res: Response,
  next: NextFunction,
): void => {
  const obraId = Number(req.params.obraId);
  if (!Number.isInteger(obraId) || obraId <= 0) {
    res.status(400).json({ error: "obraId inválido" });
    return;
  }
  Obra.findByPk(obraId, { attributes: ["id", "name"], raw: true })
    .then((obra) => {
      if (!obra) {
        res.status(404).json({ error: "Obra não encontrada" });
        return;
      }
      const dto: ObraResponseDto = obraResponseSchema.parse(obra);
      res.status(200).json(dto);
    })
    .catch((err) => {
      console.error("Erro ao buscar obra:", err);
      res.status(500).json({ error: "Erro ao buscar obra" });
    });
};
