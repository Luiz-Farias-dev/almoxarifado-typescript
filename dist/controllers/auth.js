"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const obra_model_1 = __importDefault(require("../models/obra.model"));
const centroCusto_model_1 = __importDefault(require("../models/centroCusto.model"));
const signupHelpers_1 = require("../utils/signupHelpers");
const signUp = async (req, res, next) => {
    try {
        const { nome, cpf, tipoFuncionario, obraId, centroCustoIds } = req.body;
        if (!nome || !cpf || !tipoFuncionario) {
            return res
                .status(400)
                .json({ error: "nome, cpf e tipoFuncionario são obrigatórios" });
        }
        const senha = (0, signupHelpers_1.gerarSenhaBase)();
        // If Almoxarife, require obra and centroCusto information and validate them
        if (tipoFuncionario === "Almoxarife") {
            if (!obraId) {
                return res
                    .status(400)
                    .json({ error: "obraId é obrigatório para Almoxarife" });
            }
            if (!Array.isArray(centroCustoIds) || centroCustoIds.length === 0) {
                return res
                    .status(400)
                    .json({ error: "centroCustoIds é obrigatório e deve ser um array" });
            }
            const obra = await obra_model_1.default.findByPk(Number(obraId));
            if (!obra) {
                return res.status(400).json({ error: "Obra não encontrada" });
            }
            const centros = await centroCusto_model_1.default.findAll({
                where: { id: centroCustoIds },
            });
            if (centros.length !== centroCustoIds.length) {
                return res
                    .status(400)
                    .json({ error: "Algum centro de custo não foi encontrado" });
            }
            // Note: associations (linking user -> obra / centros) are not created here because user/obra/centro models
            // currently do not define association fields. That should be added in the models if persistence of relations is desired.
        }
        const user = await user_model_1.default.create({ nome, cpf, tipoFuncionario, senha });
        return res.status(201).json({ user, senhaGerada: senha });
    }
    catch (error) {
        next(error);
    }
};
exports.signUp = signUp;
const login = async (req, res, next) => {
    try {
        const { cpf, senha } = req.body;
        if (!cpf || !senha) {
            return res.status(400).json({ error: "cpf e senha são obrigatórios" });
        }
        //To-do: Criar validação para user (zod, interface do typescript)
        const user = await user_model_1.default.findOne({ where: { cpf } });
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, cpf: user.cpf, tipoFuncionario: user.tipoFuncionario }, process.env.JWT_SECRET || "default_secret", { expiresIn: "12h" });
        return res.status(200).json({ token });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
//# sourceMappingURL=auth.js.map