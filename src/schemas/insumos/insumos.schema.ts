// schemas/produtoCatalogo/produtoCatalogo.schema.ts
import { z } from "zod";

// Schema base para criação de produto
export const produtoBaseSchema = z.object({
  Insumo_Cod: z
    .string()
    .min(1, "O código do insumo é obrigatório")
    .max(50, "O código do insumo deve ter no máximo 50 caracteres"),

  SubInsumo_Cod: z
    .string()
    .max(50, "O código do sub-insumo deve ter no máximo 50 caracteres")
    .nullable()
    .optional(),

  Unid_Cod: z
    .string()
    .min(1, "O código da unidade é obrigatório")
    .max(20, "O código da unidade deve ter no máximo 20 caracteres"),

  SubInsumo_Especificacao: z
    .string()
    .min(1, "A especificação do sub-insumo é obrigatória")
    .max(200, "A especificação deve ter no máximo 200 caracteres"),

  INSUMO_ITEMOBSOLETO: z
    .string()
    .max(1, "O campo de item obsoleto deve ter no máximo 1 caractere")
    .optional()
    .default(""),

  descricao: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional()
    .default(""),
});

// Schema para upload de arquivo
export const uploadFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().positive(),
});

// Tipos derivados dos schemas
export type ProdutoBaseBodyDto = z.infer<typeof produtoBaseSchema>;
export type UploadFileDto = z.infer<typeof uploadFileSchema>;

// Schema para atualização parcial (PATCH)
export const produtoUpdateSchema = produtoBaseSchema.partial();

// Schema para validação de ID
export const produtoIdSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro")
    .positive("ID deve ser um número positivo"),
});

export type ProdutoIdDto = z.infer<typeof produtoIdSchema>;
