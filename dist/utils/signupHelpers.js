"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarSenhaBase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/*Pela regra de negócio, todo novo usuário deve começar com uma senha padrão que ele
deve alterar no primeiro login. Essa função gera o hash dessa senha padrão para
ser armazenada no banco de dados ao criar um novo usuário.*/
const gerarSenhaBase = () => {
    const senhaPadrao = "Padrao#2025";
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hashedSenha = bcryptjs_1.default.hashSync(senhaPadrao, salt);
    return hashedSenha;
};
exports.gerarSenhaBase = gerarSenhaBase;
//# sourceMappingURL=signupHelpers.js.map