import { z } from "zod";

export const createCentroCustoBodySchema = z.object({
  nome: z.string().min(3, "nome é obrigatório"),
});

export type CreateCentroCustoBodyDto = z.infer<
  typeof createCentroCustoBodySchema
>;
