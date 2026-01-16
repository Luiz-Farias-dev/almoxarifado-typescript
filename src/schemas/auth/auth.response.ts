import { z } from "zod";

// Schema for user response
export const userResponseSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  cpf: z.string(),
  tipoFuncionario: z.string(),
  empresa: z.string().nullable().optional(),
  senha: z.string().optional(), // Usually we don't send password in responses, but keeping for compatibility
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;

// Schema for sign up response
export const signUpResponseSchema = z.object({
  user: userResponseSchema,
  senhaGerada: z.string(),
});

export type SignUpResponseDto = z.infer<typeof signUpResponseSchema>;

// Schema for login response
export const loginResponseSchema = z.object({
  token: z.string(),
});

export type LoginResponseDto = z.infer<typeof loginResponseSchema>;
