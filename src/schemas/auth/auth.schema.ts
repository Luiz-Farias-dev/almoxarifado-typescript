import { z } from "zod";

// Schema for sign up request
export const signUpBodySchema = z
  .object({
    nome: z.string().min(1, "nome é obrigatório"),
    cpf: z.string().min(1, "cpf é obrigatório"),
    tipoFuncionario: z.string().min(1, "tipoFuncionario é obrigatório"),
    obraId: z.coerce.number().int().positive().optional(),
    centroCustoIds: z.array(z.coerce.number().int().positive()).optional(),
  })
  .refine(
    (data) => {
      if (data.tipoFuncionario === "Almoxarife") {
        return data.obraId !== undefined && data.centroCustoIds !== undefined;
      }
      return true;
    },
    {
      message: "obraId e centroCustoIds são obrigatórios para Almoxarife",
      path: ["obraId"],
    },
  )
  .refine(
    (data) => {
      if (
        data.tipoFuncionario === "Almoxarife" &&
        data.centroCustoIds !== undefined
      ) {
        return data.centroCustoIds.length > 0;
      }
      return true;
    },
    {
      message: "centroCustoIds deve ser um array não vazio",
      path: ["centroCustoIds"],
    },
  );

export type SignUpBodyDto = z.infer<typeof signUpBodySchema>;

// Schema for login request
export const loginBodySchema = z.object({
  cpf: z.string().min(1, "cpf é obrigatório"),
  senha: z.string().min(1, "senha é obrigatória"),
});

export type LoginBodyDto = z.infer<typeof loginBodySchema>;
