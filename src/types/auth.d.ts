declare namespace Express {
  interface Request {
    currentUser?: {
      id: number;
      tipoFuncionario: string;
      obraId?: number;
    };
  }
}
