import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, cpf, tipoFuncionario } = req.body;