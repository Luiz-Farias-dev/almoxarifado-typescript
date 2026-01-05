import { z } from "zod";

export const createObraBodySchema = z.object({
  nome: z.string().min(2).max(100),
});
export type CreateObraBodyDto = z.infer<typeof createObraBodySchema>;
