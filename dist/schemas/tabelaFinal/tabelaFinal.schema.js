"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabelaFinalBodySchema = exports.produtoSchema = void 0;
const zod_1 = require("zod");
exports.produtoSchema = zod_1.z.object({
    Insumo_e_SubInsumo_Cod: zod_1.z.string(),
    Centro_Negocio_Cod: zod_1.z.string(),
    codigo_pedido: zod_1.z.number().optional(),
    quantidade: zod_1.z.number(),
    destino: zod_1.z.string().nullable().optional(),
    Observacao: zod_1.z.string().nullable().optional(),
    almoxarife_nome: zod_1.z.string().nullable().optional(),
    Tipo_Doc: zod_1.z.string().optional(),
});
exports.tabelaFinalBodySchema = zod_1.z.object({
    cpf: zod_1.z.string().nullable().optional(),
    produtos: zod_1.z.array(exports.produtoSchema).min(1),
});
//# sourceMappingURL=tabelaFinal.schema.js.map