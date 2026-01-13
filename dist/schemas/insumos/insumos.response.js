"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResponseSchema = exports.createResponseSchema = exports.uploadResumoResponseSchema = exports.getAllProdutosResponseSchema = exports.produtoResponseSchema = void 0;
// schemas/produtoCatalogo/produtoCatalogo.response.ts
const zod_1 = require("zod");
// Schema base para resposta de produto
const produtoResponseBaseSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    Insumo_Cod: zod_1.z.string(),
    SubInsumo_Cod: zod_1.z.string().nullable(),
    Unid_Cod: zod_1.z.string(),
    SubInsumo_Especificacao: zod_1.z.string(),
    INSUMO_ITEMOBSOLETO: zod_1.z.string().nullable(),
    created_at: zod_1.z.date().or(zod_1.z.string()),
    updated_at: zod_1.z.date().or(zod_1.z.string()),
});
// Schema para resposta de um único produto
exports.produtoResponseSchema = produtoResponseBaseSchema;
// Schema para resposta de múltiplos produtos
exports.getAllProdutosResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.array(produtoResponseBaseSchema),
    pagination: zod_1.z
        .object({
        total: zod_1.z.number().int().min(0),
        skip: zod_1.z.number().int().min(0),
        limit: zod_1.z.number().int().min(1),
        hasMore: zod_1.z.boolean(),
        page: zod_1.z.number().int().positive().optional(),
        totalPages: zod_1.z.number().int().positive().optional(),
        hasNext: zod_1.z.boolean().optional(),
        hasPrev: zod_1.z.boolean().optional(),
    })
        .optional(),
});
// Schema para resposta de upload
exports.uploadResumoResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    total_rows: zod_1.z.number().int().min(0),
    new_rows: zod_1.z.number().int().min(0),
    ignored_rows: zod_1.z.number().int().min(0),
    file_type: zod_1.z.enum(["CSV", "Excel"]),
    processamento: zod_1.z.string().optional(),
    errors: zod_1.z
        .array(zod_1.z.object({
        row: zod_1.z.number(),
        error: zod_1.z.string(),
    }))
        .optional(),
});
// Schema para resposta de criação
exports.createResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: produtoResponseBaseSchema,
    message: zod_1.z.string().optional(),
});
// Schema para resposta de deleção
exports.deleteResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
    deletedId: zod_1.z.number().optional(),
});
//# sourceMappingURL=insumos.response.js.map