// helpers/listaEsperaUtils.ts
import { fn, col, literal, Sequelize } from "sequelize";
import TabelaFinal from "../models/tabelaFinal.model";
import ListaEspera from "../models/listaEspera.model";

// ========= UTILITÁRIOS =========

/**
 * Expressão para extrair o código do centro de custo do campo JSONB
 * Equivalente a: centro_custo ->> 'Centro_Negocio_Cod'
 * @returns Expressão do Sequelize para extrair código do CC
 */
export function ccCodeExpr(): any {
  return fn(
    "jsonb_extract_path_text",
    col("centro_custo"),
    "Centro_Negocio_Cod"
  );
}

/**
 * Expressão para extrair o nome do centro de custo do campo JSONB
 * Equivalente a: centro_custo ->> 'Centro_Nome'
 * @returns Expressão do Sequelize para extrair nome do CC
 */
export function ccNameExpr(): any {
  return fn("jsonb_extract_path_text", col("centro_custo"), "Centro_Nome");
}

/**
 * Alternativa usando cast para texto
 * @returns Expressão do Sequelize para código do CC
 */
export function ccCodeExprAlt(): any {
  return literal(`(centro_custo->>'Centro_Negocio_Cod')`);
}

/**
 * Alternativa usando cast para texto
 * @returns Expressão do Sequelize para nome do CC
 */
export function ccNameExprAlt(): any {
  return literal(`(centro_custo->>'Centro_Nome')`);
}

/**
 * Versão segura que funciona com diferentes operadores
 * @param operator Operador Sequelize (Op.eq, Op.iLike, etc)
 * @param value Valor para comparação
 * @returns Objeto de condição para usar em where
 */
export function ccCodeCondition(value: string, operator = "="): any {
  if (operator === "like" || operator === "ilike") {
    return literal(
      `centro_custo->>'Centro_Negocio_Cod' ${operator.toUpperCase()} '%${value}%'`
    );
  }
  return literal(`centro_custo->>'Centro_Negocio_Cod' ${operator} '${value}'`);
}

/**
 * Versão segura que funciona com diferentes operadores
 * @param operator Operador Sequelize (Op.eq, Op.iLike, etc)
 * @param value Valor para comparação
 * @returns Objeto de condição para usar em where
 */
export function ccNameCondition(value: string, operator = "="): any {
  if (operator === "like" || operator === "ilike") {
    return literal(
      `centro_custo->>'Centro_Nome' ${operator.toUpperCase()} '%${value}%'`
    );
  }
  return literal(`centro_custo->>'Centro_Nome' ${operator} '${value}'`);
}

/**
 * Gera o próximo número de pedido baseado nas tabelas TabelaFinal e ListaEspera
 * Similar à função generate_order_number do Python
 * @returns Próximo número de pedido
 */
export async function generateOrderNumber(): Promise<number> {
  try {
    // Consulta o maior valor atual de Num_Doc na tabela Materiais de saída
    const lastNumDocResult = await TabelaFinal.max("Num_Doc");
    const lastNumDoc = lastNumDocResult ? Number(lastNumDocResult) : 0;

    // Consulta o maior valor atual de codigo_pedido na tabela Lista de Espera
    const lastNumDocWaitListResult = await ListaEspera.max("codigo_pedido");
    const lastNumDocWaitList = lastNumDocWaitListResult
      ? Number(lastNumDocWaitListResult)
      : 0;

    // Calcula o próximo número
    if (lastNumDoc === 0 && lastNumDocWaitList === 0) {
      return 1; // Primeiro registro
    } else if (lastNumDoc > lastNumDocWaitList) {
      return lastNumDoc + 1;
    } else {
      return lastNumDocWaitList + 1;
    }
  } catch (error) {
    console.error("Erro ao gerar número de pedido:", error);
    throw new Error("Falha ao gerar número de pedido");
  }
}

/**
 * Versão com transação para uso em operações atômicas
 * @param transaction Transação do Sequelize
 * @returns Próximo número de pedido
 */
export async function generateOrderNumberWithTransaction(
  transaction?: any
): Promise<number> {
  try {
    const options: any = {};
    if (transaction) {
      options.transaction = transaction;
    }

    // Consulta o maior valor atual de Num_Doc na tabela Materiais de saída
    const lastNumDocResult = await TabelaFinal.max("Num_Doc", options);
    const lastNumDoc = lastNumDocResult ? Number(lastNumDocResult) : 0;

    // Consulta o maior valor atual de codigo_pedido na tabela Lista de Espera
    const lastNumDocWaitListResult = await ListaEspera.max(
      "codigo_pedido",
      options
    );
    const lastNumDocWaitList = lastNumDocWaitListResult
      ? Number(lastNumDocWaitListResult)
      : 0;

    // Calcula o próximo número
    if (lastNumDoc === 0 && lastNumDocWaitList === 0) {
      return 1; // Primeiro registro
    } else if (lastNumDoc > lastNumDocWaitList) {
      return lastNumDoc + 1;
    } else {
      return lastNumDocWaitList + 1;
    }
  } catch (error) {
    console.error("Erro ao gerar número de pedido com transação:", error);
    throw new Error("Falha ao gerar número de pedido");
  }
}

/**
 * Versão otimizada com ambas consultas em paralelo
 * @returns Próximo número de pedido
 */
export async function generateOrderNumberOptimized(): Promise<number> {
  try {
    // Executa ambas consultas em paralelo
    const [lastNumDocResult, lastNumDocWaitListResult] = await Promise.all([
      TabelaFinal.max("Num_Doc"),
      ListaEspera.max("codigo_pedido"),
    ]);

    const lastNumDoc = lastNumDocResult ? Number(lastNumDocResult) : 0;
    const lastNumDocWaitList = lastNumDocWaitListResult
      ? Number(lastNumDocWaitListResult)
      : 0;

    // Calcula o próximo número
    if (lastNumDoc === 0 && lastNumDocWaitList === 0) {
      return 1;
    } else if (lastNumDoc > lastNumDocWaitList) {
      return lastNumDoc + 1;
    } else {
      return lastNumDocWaitList + 1;
    }
  } catch (error) {
    console.error("Erro ao gerar número de pedido otimizado:", error);
    throw new Error("Falha ao gerar número de pedido");
  }
}

/**
 * Cria expressão para filtro LIKE no código do centro de custo
 * @param searchTerm Termo de busca
 * @returns Expressão para WHERE
 */
export function ccCodeLike(searchTerm: string): any {
  return literal(`centro_custo->>'Centro_Negocio_Cod' ILIKE '%${searchTerm}%'`);
}

/**
 * Cria expressão para filtro LIKE no nome do centro de custo
 * @param searchTerm Termo de busca
 * @returns Expressão para WHERE
 */
export function ccNameLike(searchTerm: string): any {
  return literal(`centro_custo->>'Centro_Nome' ILIKE '%${searchTerm}%'`);
}

/**
 * Cria expressão combinada para buscar tanto no código quanto no nome
 * @param searchTerm Termo de busca
 * @returns Expressão para WHERE com OR
 */
export function ccCodeOrNameLike(searchTerm: string): any {
  return literal(`(
    centro_custo->>'Centro_Negocio_Cod' ILIKE '%${searchTerm}%' 
    OR centro_custo->>'Centro_Nome' ILIKE '%${searchTerm}%'
  )`);
}

export default {
  ccCodeExpr,
  ccNameExpr,
  ccCodeExprAlt,
  ccNameExprAlt,
  ccCodeCondition,
  ccNameCondition,
  generateOrderNumber,
  generateOrderNumberWithTransaction,
  generateOrderNumberOptimized,
  ccCodeLike,
  ccNameLike,
  ccCodeOrNameLike,
};
