import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Token de autenticação não fornecido" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { id: number; cpf: string; tipoFuncionario: string };

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "tipoFuncionario", "obraId"],
      raw: true,
    });

    if (!user) {
      res.status(403).json({ error: "Usuário não encontrado" });
      return;
    }

    req.currentUser = {
      id: (user as any).id,
      tipoFuncionario: (user as any).tipoFuncionario,
      obraId: (user as any).obraId || undefined,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expirado" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }
    console.error("Erro na autenticação:", error);
    res.status(500).json({ error: "Erro ao autenticar usuário" });
  }
};
