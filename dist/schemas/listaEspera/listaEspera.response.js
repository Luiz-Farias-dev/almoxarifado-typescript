"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListaEsperaResponseSchema = exports.getAllListaEsperaResponseSchema = exports.listaEsperaResponseSchema = void 0;
const zod_1 = require("zod");
// Schema for lista espera response
exports.listaEsperaResponseSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    codigo_pedido: zod_1.z.number().int(),
    Insumo_Cod: zod_1.z.number().int(),
    SubInsumo_Cod: zod_1.z.number().int(),
    SubInsumo_Especificacao: zod_1.z.string(),
    quantidade: zod_1.z.number().int(),
    almoxarife_nome: zod_1.z.string(),
    centro_custo: zod_1.z.record(zod_1.z.string(), zod_1.z.any()), // JSONB object
    Unid_Cod: zod_1.z.string(),
    destino: zod_1.z.string(),
    data_att: zod_1.z.date().or(zod_1.z.string()).optional(),
});
// Schema for array of lista espera responses
exports.getAllListaEsperaResponseSchema = zod_1.z.array(exports.listaEsperaResponseSchema);
// Schema for create response
exports.createListaEsperaResponseSchema = zod_1.z.object({
    codigo_pedido: zod_1.z.number().int(),
});
//# sourceMappingURL=listaEspera.response.js.map