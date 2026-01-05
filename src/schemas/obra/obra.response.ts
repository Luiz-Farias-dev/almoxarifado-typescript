import { z } from "zod";

export const obraResponseSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string().min(2).max(100),
});

export type ObraResponseDto = z.infer<typeof obraResponseSchema>;

export const getAllObraResponseSchema = z.array(obraResponseSchema);
