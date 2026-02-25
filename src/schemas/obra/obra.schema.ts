import { z } from "zod";

export const createObraBodySchema = z.object({
  name: z.string().min(2).max(100),
  initials: z.string().min(1).max(50).optional().nullable(),
});

export type CreateObraBodyDto = z.infer<typeof createObraBodySchema>;
