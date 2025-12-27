import { z } from "zod";

export const centroCustoResponseSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
});

export type centroCustoResponseDto = z.infer<typeof centroCustoResponseSchema>;

export const GetAllCentroCustoResponseSchema = z.array(
  centroCustoResponseSchema
);

export type getAllCentroCustoDto = z.infer<
  typeof GetAllCentroCustoResponseSchema
>;
