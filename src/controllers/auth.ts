import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model";
import Obra from "../models/obra.model";
import CentroCusto from "../models/centroCusto.model";
import { gerarSenhaBase } from "../utils/signupHelpers";
import {
  signUpBodySchema,
  SignUpBodyDto,
  loginBodySchema,
  LoginBodyDto,
} from "../schemas/auth/auth.schema";
import {
  signUpResponseSchema,
  SignUpResponseDto,
  loginResponseSchema,
  LoginResponseDto,
} from "../schemas/auth/auth.response";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto: SignUpBodyDto = signUpBodySchema.parse(req.body);
    const { nome, cpf, tipoFuncionario, obraId, centroCustoIds } = dto;

    const senha = gerarSenhaBase();

    // If Almoxarife, validate obra and centroCusto exist
    if (tipoFuncionario === "Almoxarife") {
      const obra = await Obra.findByPk(Number(obraId));
      if (!obra) {
        return res.status(400).json({ error: "Obra não encontrada" });
      }

      const centros = await CentroCusto.findAll({
        where: { id: centroCustoIds },
      });
      if (centros.length !== centroCustoIds!.length) {
        return res
          .status(400)
          .json({ error: "Algum centro de custo não foi encontrado" });
      }

      // Note: associations (linking user -> obra / centros) are not created here because user/obra/centro models
      // currently do not define association fields. That should be added in the models if persistence of relations is desired.
    }

    const user = await User.create({
      nome,
      cpf,
      tipo_funcionario: tipoFuncionario,
      senha_hash: senha,
      obra_id: obraId,
    });
    const userPlain = user.toJSON() as any;

    const response: SignUpResponseDto = { user: userPlain, senhaGerada: senha };
    signUpResponseSchema.parse(response);

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto: LoginBodyDto = loginBodySchema.parse(req.body);
    const { cpf, senha } = dto;

    const user = await User.findOne({ where: { cpf }, raw: true }) as any;
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const token = jwt.sign(
      { id: user.id, cpf: user.cpf, tipoFuncionario: user.tipo_funcionario },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "12h" },
    );

    const response: LoginResponseDto = { token };
    loginResponseSchema.parse(response);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
