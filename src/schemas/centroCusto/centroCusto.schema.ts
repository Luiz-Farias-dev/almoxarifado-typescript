import { z } from "zod";

export const createCentroCustoBodySchema = z.object({
  Centro_Negocio_Cod: z.string().min(3, "Centro_Negocio_Cod é obrigatório"),
  Centro_Nome: z.string().min(3, "Centro_Nome é obrigatório"),
  work_id: z.number().int().positive("work_id deve ser um número positivo"),
});

export type CreateCentroCustoBodyDto = z.infer<
  typeof createCentroCustoBodySchema
>;
