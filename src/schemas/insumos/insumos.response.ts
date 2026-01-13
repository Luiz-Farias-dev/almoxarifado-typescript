// schemas/produtoCatalogo/produtoCatalogo.response.ts
import { z } from "zod";

// Schema base para resposta de produto
const produtoResponseBaseSchema = z.object({
  id: z.number().int().positive(),
  Insumo_Cod: z.string(),
  SubInsumo_Cod: z.string().nullable(),
  Unid_Cod: z.string(),
  SubInsumo_Especificacao: z.string(),
  INSUMO_ITEMOBSOLETO: z.string().nullable(),
  created_at: z.date().or(z.string()),
  updated_at: z.date().or(z.string()),
});

// Schema para resposta de um único produto
export const produtoResponseSchema = produtoResponseBaseSchema;

// Schema para resposta de múltiplos produtos
export const getAllProdutosResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(produtoResponseBaseSchema),
  pagination: z
    .object({
      total: z.number().int().min(0),
      skip: z.number().int().min(0),
      limit: z.number().int().min(1),
      hasMore: z.boolean(),
      page: z.number().int().positive().optional(),
      totalPages: z.number().int().positive().optional(),
      hasNext: z.boolean().optional(),
      hasPrev: z.boolean().optional(),
    })
    .optional(),
});

// Schema para resposta de upload
export const uploadResumoResponseSchema = z.object({
  message: z.string(),
  total_rows: z.number().int().min(0),
  new_rows: z.number().int().min(0),
  ignored_rows: z.number().int().min(0),
  file_type: z.enum(["CSV", "Excel"]),
  processamento: z.string().optional(),
  errors: z
    .array(
      z.object({
        row: z.number(),
        error: z.string(),
      })
    )
    .optional(),
});

// Schema para resposta de criação
export const createResponseSchema = z.object({
  success: z.boolean(),
  data: produtoResponseBaseSchema,
  message: z.string().optional(),
});

// Schema para resposta de deleção
export const deleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deletedId: z.number().optional(),
});

// Tipos derivados dos schemas de response
export type ProdutoResponseDto = z.infer<typeof produtoResponseSchema>;
export type GetAllProdutosResponseDto = z.infer<
  typeof getAllProdutosResponseSchema
>;
export type UploadResumoResponseDto = z.infer<
  typeof uploadResumoResponseSchema
>;

export type CreateResponseDto = z.infer<typeof createResponseSchema>;
export type DeleteResponseDto = z.infer<typeof deleteResponseSchema>;
