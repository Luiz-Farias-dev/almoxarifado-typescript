"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccCodeExpr = ccCodeExpr;
exports.ccNameExpr = ccNameExpr;
exports.ccCodeExprAlt = ccCodeExprAlt;
exports.ccNameExprAlt = ccNameExprAlt;
exports.ccCodeCondition = ccCodeCondition;
exports.ccNameCondition = ccNameCondition;
exports.generateOrderNumber = generateOrderNumber;
exports.generateOrderNumberWithTransaction = generateOrderNumberWithTransaction;
exports.generateOrderNumberOptimized = generateOrderNumberOptimized;
exports.ccCodeLike = ccCodeLike;
exports.ccNameLike = ccNameLike;
exports.ccCodeOrNameLike = ccCodeOrNameLike;
// helpers/listaEsperaUtils.ts
const sequelize_1 = require("sequelize");
const tabelaFinal_model_1 = __importDefault(require("../models/tabelaFinal.model"));
const listaEspera_model_1 = __importDefault(require("../models/listaEspera.model"));
// ========= UTILITÁRIOS =========
/**
 * Expressão para extrair o código do centro de custo do campo JSONB
 * Equivalente a: centro_custo ->> 'Centro_Negocio_Cod'
 * @returns Expressão do Sequelize para extrair código do CC
 */
function ccCodeExpr() {
    return (0, sequelize_1.fn)("jsonb_extract_path_text", (0, sequelize_1.col)("centro_custo"), "Centro_Negocio_Cod");
}
/**
 * Expressão para extrair o nome do centro de custo do campo JSONB
 * Equivalente a: centro_custo ->> 'Centro_Nome'
 * @returns Expressão do Sequelize para extrair nome do CC
 */
function ccNameExpr() {
    return (0, sequelize_1.fn)("jsonb_extract_path_text", (0, sequelize_1.col)("centro_custo"), "Centro_Nome");
}
/**
 * Alternativa usando cast para texto
 * @returns Expressão do Sequelize para código do CC
 */
function ccCodeExprAlt() {
    return (0, sequelize_1.literal)(`(centro_custo->>'Centro_Negocio_Cod')`);
}
/**
 * Alternativa usando cast para texto
 * @returns Expressão do Sequelize para nome do CC
 */
function ccNameExprAlt() {
    return (0, sequelize_1.literal)(`(centro_custo->>'Centro_Nome')`);
}
/**
 * Versão segura que funciona com diferentes operadores
 * @param operator Operador Sequelize (Op.eq, Op.iLike, etc)
 * @param value Valor para comparação
 * @returns Objeto de condição para usar em where
 */
function ccCodeCondition(value, operator = "=") {
    if (operator === "like" || operator === "ilike") {
        return (0, sequelize_1.literal)(`centro_custo->>'Centro_Negocio_Cod' ${operator.toUpperCase()} '%${value}%'`);
    }
    return (0, sequelize_1.literal)(`centro_custo->>'Centro_Negocio_Cod' ${operator} '${value}'`);
}
/**
 * Versão segura que funciona com diferentes operadores
 * @param operator Operador Sequelize (Op.eq, Op.iLike, etc)
 * @param value Valor para comparação
 * @returns Objeto de condição para usar em where
 */
function ccNameCondition(value, operator = "=") {
    if (operator === "like" || operator === "ilike") {
        return (0, sequelize_1.literal)(`centro_custo->>'Centro_Nome' ${operator.toUpperCase()} '%${value}%'`);
    }
    return (0, sequelize_1.literal)(`centro_custo->>'Centro_Nome' ${operator} '${value}'`);
}
/**
 * Gera o próximo número de pedido baseado nas tabelas TabelaFinal e ListaEspera
 * Similar à função generate_order_number do Python
 * @returns Próximo número de pedido
 */
async function generateOrderNumber() {
    try {
        // Consulta o maior valor atual de Num_Doc na tabela Materiais de saída
        const lastNumDocResult = await tabelaFinal_model_1.default.max("Num_Doc");
        const lastNumDoc = lastNumDocResult ? Number(lastNumDocResult) : 0;
        // Consulta o maior valor atual de codigo_pedido na tabela Lista de Espera
        const lastNumDocWaitListResult = await listaEspera_model_1.default.max("codigo_pedido");
        const lastNumDocWaitList = lastNumDocWaitListResult
            ? Number(lastNumDocWaitListResult)
            : 0;
        // Calcula o próximo número
        if (lastNumDoc === 0 && lastNumDocWaitList === 0) {
            return 1; // Primeiro registro
        }
        else if (lastNumDoc > lastNumDocWaitList) {
            return lastNumDoc + 1;
        }
        else {
            return lastNumDocWaitList + 1;
        }
    }
    catch (error) {
        console.error("Erro ao gerar número de pedido:", error);
        throw new Error("Falha ao gerar número de pedido");
    }
}
/**
 * Versão com transação para uso em operações atômicas
 * @param transaction Transação do Sequelize
 * @returns Próximo número de pedido
 */
async function generateOrderNumberWithTransaction(transaction) {
    try {
        const options = {};
        if (transaction) {
            options.transaction = transaction;
        }
        // Consulta o maior valor atual de Num_Doc na tabela Materiais de saída
        const lastNumDocResult = await tabelaFinal_model_1.default.max("Num_Doc", options);
        const lastNumDoc = lastNumDocResult ? Number(lastNumDocResult) : 0;
        // Consulta o maior valor atual de codigo_pedido na tabela Lista de Espera
        const lastNumDocWaitListResult = await listaEspera_model_1.default.max("codigo_pedido", options);
        const lastNumDocWaitList = lastNumDocWaitListResult
            ? Number(lastNumDocWaitListResult)
            : 0;
        // Calcula o próximo número
        if (lastNumDoc === 0 && lastNumDocWaitList === 0) {
            return 1; // Primeiro registro
        }
        else if (lastNumDoc > lastNumDocWaitList) {
            return lastNumDoc + 1;
        }
        else {
            return lastNumDocWaitList + 1;
        }
    }
    catch (error) {
        console.error("Erro ao gerar número de pedido com transação:", error);
        throw new Error("Falha ao gerar número de pedido");
    }
}
/**
 * Versão otimizada com ambas consultas em paralelo
 * @returns Próximo número de pedido
 */
async function generateOrderNumberOptimized() {
    try {
        // Executa ambas consultas em paralelo
        const [lastNumDocResult, lastNumDocWaitListResult] = await Promise.all([
            tabelaFinal_model_1.default.max("Num_Doc"),
            listaEspera_model_1.default.max("codigo_pedido"),
        ]);
        const lastNumDoc = lastNumDocResult ? Number(lastNumDocResult) : 0;
        const lastNumDocWaitList = lastNumDocWaitListResult
            ? Number(lastNumDocWaitListResult)
            : 0;
        // Calcula o próximo número
        if (lastNumDoc === 0 && lastNumDocWaitList === 0) {
            return 1;
        }
        else if (lastNumDoc > lastNumDocWaitList) {
            return lastNumDoc + 1;
        }
        else {
            return lastNumDocWaitList + 1;
        }
    }
    catch (error) {
        console.error("Erro ao gerar número de pedido otimizado:", error);
        throw new Error("Falha ao gerar número de pedido");
    }
}
/**
 * Cria expressão para filtro LIKE no código do centro de custo
 * @param searchTerm Termo de busca
 * @returns Expressão para WHERE
 */
function ccCodeLike(searchTerm) {
    return (0, sequelize_1.literal)(`centro_custo->>'Centro_Negocio_Cod' ILIKE '%${searchTerm}%'`);
}
/**
 * Cria expressão para filtro LIKE no nome do centro de custo
 * @param searchTerm Termo de busca
 * @returns Expressão para WHERE
 */
function ccNameLike(searchTerm) {
    return (0, sequelize_1.literal)(`centro_custo->>'Centro_Nome' ILIKE '%${searchTerm}%'`);
}
/**
 * Cria expressão combinada para buscar tanto no código quanto no nome
 * @param searchTerm Termo de busca
 * @returns Expressão para WHERE com OR
 */
function ccCodeOrNameLike(searchTerm) {
    return (0, sequelize_1.literal)(`(
    centro_custo->>'Centro_Negocio_Cod' ILIKE '%${searchTerm}%' 
    OR centro_custo->>'Centro_Nome' ILIKE '%${searchTerm}%'
  )`);
}
exports.default = {
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
//# sourceMappingURL=listaEsperaHelpers.js.map