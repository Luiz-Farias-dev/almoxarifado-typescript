import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import Obra from "../models/obra.model";
import CentroCusto from "../models/centroCusto.model";
import { gerarSenhaBase } from "../utils/signupHelpers";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nome, cpf, tipoFuncionario, obraId, centroCustoIds } = req.body;

    if (!nome || !cpf || !tipoFuncionario) {
      return res.status(400).json({ error: "nome, cpf e tipoFuncionario são obrigatórios" });
    }

    const senha = gerarSenhaBase();

    // If Almoxarife, require obra and centroCusto information and validate them
    if (tipoFuncionario === "Almoxarife") {
      if (!obraId) {
        return res.status(400).json({ error: "obraId é obrigatório para Almoxarife" });
      }
      if (!Array.isArray(centroCustoIds) || centroCustoIds.length === 0) {
        return res.status(400).json({ error: "centroCustoIds é obrigatório e deve ser um array" });
      }

      const obra = await Obra.findByPk(Number(obraId));
      if (!obra) {
        return res.status(400).json({ error: "Obra não encontrada" });
      }

      const centros = await CentroCusto.findAll({ where: { id: centroCustoIds } });
      if (centros.length !== centroCustoIds.length) {
        return res.status(400).json({ error: "Algum centro de custo não foi encontrado" });
      }
      // Note: associations (linking user -> obra / centros) are not created here because user/obra/centro models
      // currently do not define association fields. That should be added in the models if persistence of relations is desired.
    }

    const user = await User.create({ nome, cpf, tipoFuncionario, senha });

    return res.status(201).json({ user, senhaGerada: senha });
  } catch (error) {
    next(error);
  }
};
