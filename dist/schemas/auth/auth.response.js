"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginResponseSchema = exports.signUpResponseSchema = exports.userResponseSchema = void 0;
const zod_1 = require("zod");
// Schema for user response
exports.userResponseSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    nome: zod_1.z.string(),
    cpf: zod_1.z.string(),
    tipoFuncionario: zod_1.z.string(),
    empresa: zod_1.z.string().nullable().optional(),
    senha: zod_1.z.string().optional(), // Usually we don't send password in responses, but keeping for compatibility
    createdAt: zod_1.z.date().or(zod_1.z.string()).optional(),
    updatedAt: zod_1.z.date().or(zod_1.z.string()).optional(),
});
// Schema for sign up response
exports.signUpResponseSchema = zod_1.z.object({
    user: exports.userResponseSchema,
    senhaGerada: zod_1.z.string(),
});
// Schema for login response
exports.loginResponseSchema = zod_1.z.object({
    token: zod_1.z.string(),
});
//# sourceMappingURL=auth.response.js.map