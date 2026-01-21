import { z } from "zod";

export const produtoSchema = z.object({
  Insumo_e_SubInsumo_Cod: z.string(),
  Centro_Negocio_Cod: z.string(),
  codigo_pedido: z.number().optional(),
  quantidade: z.number(),
  destino: z.string().nullable().optional(),
  Observacao: z.string().nullable().optional(),
  almoxarife_nome: z.string().nullable().optional(),
  Tipo_Doc: z.string().optional(),
});

export const tabelaFinalBodySchema = z.object({
  cpf: z.string().nullable().optional(),
  produtos: z.array(produtoSchema).min(1),
});

export type TabelaFinalBodyDto = z.infer<typeof tabelaFinalBodySchema>;

