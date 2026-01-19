import { z } from "zod";

// Schema for centro custo object in request
export const centroCustoSchema = z.object({
  Centro_Negocio_Cod: z.string().min(1, "Centro_Negocio_Cod é obrigatório"),
  Centro_Nome: z.string().optional(),
});

// Schema for product in produtos array
export const produtoSchema = z.object({
  Insumo_Cod: z.number().int().positive("Insumo_Cod deve ser um número positivo"),
  SubInsumo_Cod: z.number().int().positive("SubInsumo_Cod deve ser um número positivo"),
  SubInsumo_Especificacao: z
    .string()
    .min(1, "SubInsumo_Especificacao é obrigatório"),
  quantidade: z.number().int().positive().default(1),
  Unid_Cod: z.string().min(1, "Unid_Cod é obrigatório").max(5),
});

// Schema for creating lista espera (POST request body)
export const createListaEsperaBodySchema = z.object({
  centro_custo: centroCustoSchema,
  produtos: z
    .array(produtoSchema)
    .min(1, "Pelo menos um produto é obrigatório"),
  almoxarife_nome: z.string().min(1, "almoxarife_nome é obrigatório"),
  destino: z.string().min(1, "destino é obrigatório"),
});

export type CreateListaEsperaBodyDto = z.infer<
  typeof createListaEsperaBodySchema
>;

// Schema for GET query parameters
export const getListaEsperaQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  codigo_pedido: z.coerce.number().int().positive().optional(),
  destino: z.string().optional(),
  centro_custo: z.string().optional(),
  Insumo_Cod: z.coerce.number().int().positive().optional(),
  Unid_Cod: z.string().optional(),
  SubInsumo_Especificacao: z.string().optional(),
  work_id: z.coerce.number().int().positive().optional(),
});

export type GetListaEsperaQueryDto = z.infer<typeof getListaEsperaQuerySchema>;
