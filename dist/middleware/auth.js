"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const getCurrentUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Token de autenticação não fornecido" });
            return;
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        const user = await user_model_1.default.findByPk(decoded.id, {
            attributes: ["id", "tipoFuncionario", "obraId"],
            raw: true,
        });
        if (!user) {
            res.status(403).json({ error: "Usuário não encontrado" });
            return;
        }
        req.currentUser = {
            id: user.id,
            tipoFuncionario: user.tipoFuncionario,
            obraId: user.obraId || undefined,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Token inválido" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Token expirado" });
            return;
        }
        console.error("Erro na autenticação:", error);
        res.status(500).json({ error: "Erro ao autenticar usuário" });
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.js.map