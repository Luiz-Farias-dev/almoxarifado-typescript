import { z } from "zod";

export const tabelaFinalResponseSchema = z.object({
  detail: z.string(),
  employee_name: z.string().nullable(),
});

export type TabelaFinalResponseDto = z.infer<
  typeof tabelaFinalResponseSchema
>;

