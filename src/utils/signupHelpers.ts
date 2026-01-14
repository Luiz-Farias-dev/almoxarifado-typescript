import bcrypt from "bcryptjs";

/*Pela regra de negócio, todo novo usuário deve começar com uma senha padrão que ele
deve alterar no primeiro login. Essa função gera o hash dessa senha padrão para
ser armazenada no banco de dados ao criar um novo usuário.*/
export const gerarSenhaBase = () => {
  const senhaPadrao = "Padrao#2025";
  const salt = bcrypt.genSaltSync(10);
  const hashedSenha = bcrypt.hashSync(senhaPadrao, salt);
  return hashedSenha;
};
