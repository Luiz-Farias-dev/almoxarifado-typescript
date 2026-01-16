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
const auth_schema_1 = require("../schemas/auth/auth.schema");
const auth_response_1 = require("../schemas/auth/auth.response");
const signUp = async (req, res, next) => {
    try {
        const dto = auth_schema_1.signUpBodySchema.parse(req.body);
        const { nome, cpf, tipoFuncionario, obraId, centroCustoIds } = dto;
        const senha = (0, signupHelpers_1.gerarSenhaBase)();
        // If Almoxarife, validate obra and centroCusto exist
        if (tipoFuncionario === "Almoxarife") {
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
        const userPlain = user.toJSON();
        const response = { user: userPlain, senhaGerada: senha };
        auth_response_1.signUpResponseSchema.parse(response);
        return res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.signUp = signUp;
const login = async (req, res, next) => {
    try {
        const dto = auth_schema_1.loginBodySchema.parse(req.body);
        const { cpf, senha } = dto;
        const user = await user_model_1.default.findOne({ where: { cpf }, raw: true });
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, cpf: user.cpf, tipoFuncionario: user.tipoFuncionario }, process.env.JWT_SECRET || "default_secret", { expiresIn: "12h" });
        const response = { token };
        auth_response_1.loginResponseSchema.parse(response);
        return res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
//# sourceMappingURL=auth.js.map