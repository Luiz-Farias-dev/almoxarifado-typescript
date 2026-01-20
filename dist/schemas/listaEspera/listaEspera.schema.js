"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListaEsperaQuerySchema = exports.createListaEsperaBodySchema = exports.produtoSchema = exports.centroCustoSchema = void 0;
const zod_1 = require("zod");
// Schema for centro custo object in request
exports.centroCustoSchema = zod_1.z.object({
    Centro_Negocio_Cod: zod_1.z.string().min(1, "Centro_Negocio_Cod é obrigatório"),
    Centro_Nome: zod_1.z.string().optional(),
});
// Schema for product in produtos array
exports.produtoSchema = zod_1.z.object({
    Insumo_Cod: zod_1.z.number().int().positive("Insumo_Cod deve ser um número positivo"),
    SubInsumo_Cod: zod_1.z.number().int().positive("SubInsumo_Cod deve ser um número positivo"),
    SubInsumo_Especificacao: zod_1.z
        .string()
        .min(1, "SubInsumo_Especificacao é obrigatório"),
    quantidade: zod_1.z.number().int().positive().default(1),
    Unid_Cod: zod_1.z.string().min(1, "Unid_Cod é obrigatório").max(5),
});
// Schema for creating lista espera (POST request body)
exports.createListaEsperaBodySchema = zod_1.z.object({
    centro_custo: exports.centroCustoSchema,
    produtos: zod_1.z
        .array(exports.produtoSchema)
        .min(1, "Pelo menos um produto é obrigatório"),
    almoxarife_nome: zod_1.z.string().min(1, "almoxarife_nome é obrigatório"),
    destino: zod_1.z.string().min(1, "destino é obrigatório"),
});
// Schema for GET query parameters
exports.getListaEsperaQuerySchema = zod_1.z.object({
    skip: zod_1.z.coerce.number().int().min(0).default(0),
    limit: zod_1.z.coerce.number().int().min(1).max(1000).default(100),
    codigo_pedido: zod_1.z.coerce.number().int().positive().optional(),
    destino: zod_1.z.string().optional(),
    centro_custo: zod_1.z.string().optional(),
    Insumo_Cod: zod_1.z.coerce.number().int().positive().optional(),
    Unid_Cod: zod_1.z.string().optional(),
    SubInsumo_Especificacao: zod_1.z.string().optional(),
    work_id: zod_1.z.coerce.number().int().positive().optional(),
});
//# sourceMappingURL=listaEspera.schema.js.map