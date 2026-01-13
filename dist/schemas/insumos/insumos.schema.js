"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produtoIdSchema = exports.produtoUpdateSchema = exports.uploadFileSchema = exports.produtoBaseSchema = void 0;
// schemas/produtoCatalogo/produtoCatalogo.schema.ts
const zod_1 = require("zod");
// Schema base para criação de produto
exports.produtoBaseSchema = zod_1.z.object({
    Insumo_Cod: zod_1.z
        .int()
        .min(1, "O código do insumo é obrigatório")
        .max(50, "O código do insumo deve ter no máximo 50 caracteres"),
    SubInsumo_Cod: zod_1.z
        .int()
        .max(50, "O código do sub-insumo deve ter no máximo 50 caracteres")
        .nullable()
        .optional(),
    Unid_Cod: zod_1.z
        .string()
        .min(1, "O código da unidade é obrigatório")
        .max(20, "O código da unidade deve ter no máximo 20 caracteres"),
    SubInsumo_Especificacao: zod_1.z
        .string()
        .min(1, "A especificação do sub-insumo é obrigatória")
        .max(200, "A especificação deve ter no máximo 200 caracteres"),
    INSUMO_ITEMOBSOLETO: zod_1.z
        .string()
        .max(1, "O campo de item obsoleto deve ter no máximo 1 caractere")
        .optional()
        .default(""),
    descricao: zod_1.z
        .string()
        .max(500, "A descrição deve ter no máximo 500 caracteres")
        .optional()
        .default(""),
});
// Schema para upload de arquivo
exports.uploadFileSchema = zod_1.z.object({
    fieldname: zod_1.z.string(),
    originalname: zod_1.z.string(),
    encoding: zod_1.z.string(),
    mimetype: zod_1.z.string(),
    buffer: zod_1.z.instanceof(Buffer),
    size: zod_1.z.number().positive(),
});
// Schema para atualização parcial (PATCH)
exports.produtoUpdateSchema = exports.produtoBaseSchema.partial();
// Schema para validação de ID
exports.produtoIdSchema = zod_1.z.object({
    id: zod_1.z.coerce
        .number()
        .int("ID deve ser um número inteiro")
        .positive("ID deve ser um número positivo"),
});
//# sourceMappingURL=insumos.schema.js.map