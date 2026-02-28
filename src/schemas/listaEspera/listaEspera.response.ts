import { z } from "zod";

// Schema for lista espera response
export const listaEsperaResponseSchema = z.object({
  id: z.number().int(),
  codigo_pedido: z.number().int(),
  Insumo_Cod: z.number().int(),
  SubInsumo_Cod: z.number().int(),
  SubInsumo_Especificacao: z.string(),
  quantidade: z.number().int(),
  almoxarife_nome: z.string(),
  centro_custo: z.record(z.string(), z.any()), // JSONB object
  Unid_Cod: z.string(),
  destino: z.string(),
  data_att: z.date().or(z.string()).nullable().optional(),
});

export type ListaEsperaResponseDto = z.infer<typeof listaEsperaResponseSchema>;

// Schema for array of lista espera responses
export const getAllListaEsperaResponseSchema = z.array(listaEsperaResponseSchema);

export type GetAllListaEsperaResponseDto = z.infer<
  typeof getAllListaEsperaResponseSchema
>;

// Schema for create response
export const createListaEsperaResponseSchema = z.object({
  codigo_pedido: z.number().int(),
});

export type CreateListaEsperaResponseDto = z.infer<
  typeof createListaEsperaResponseSchema
>;
