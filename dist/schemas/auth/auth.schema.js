"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginBodySchema = exports.signUpBodySchema = void 0;
const zod_1 = require("zod");
// Schema for sign up request
exports.signUpBodySchema = zod_1.z
    .object({
    nome: zod_1.z.string().min(1, "nome é obrigatório"),
    cpf: zod_1.z.string().min(1, "cpf é obrigatório"),
    tipoFuncionario: zod_1.z.string().min(1, "tipoFuncionario é obrigatório"),
    obraId: zod_1.z.coerce.number().int().positive().optional(),
    centroCustoIds: zod_1.z.array(zod_1.z.coerce.number().int().positive()).optional(),
})
    .refine((data) => {
    if (data.tipoFuncionario === "Almoxarife") {
        return data.obraId !== undefined && data.centroCustoIds !== undefined;
    }
    return true;
}, {
    message: "obraId e centroCustoIds são obrigatórios para Almoxarife",
    path: ["obraId"],
})
    .refine((data) => {
    if (data.tipoFuncionario === "Almoxarife" &&
        data.centroCustoIds !== undefined) {
        return data.centroCustoIds.length > 0;
    }
    return true;
}, {
    message: "centroCustoIds deve ser um array não vazio",
    path: ["centroCustoIds"],
});
// Schema for login request
exports.loginBodySchema = zod_1.z.object({
    cpf: zod_1.z.string().min(1, "cpf é obrigatório"),
    senha: zod_1.z.string().min(1, "senha é obrigatória"),
});
//# sourceMappingURL=auth.schema.js.map