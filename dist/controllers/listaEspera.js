"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListaEspera = exports.readListaEspera = exports.createListaEspera = void 0;
const sequelize_1 = require("sequelize");
const listaEspera_model_1 = __importDefault(require("../models/listaEspera.model"));
const centroCusto_model_1 = __importDefault(require("../models/centroCusto.model"));
const insumos_model_1 = __importDefault(require("../models/insumos.model"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const listaEspera_schema_1 = require("../schemas/listaEspera/listaEspera.schema");
const listaEspera_response_1 = require("../schemas/listaEspera/listaEspera.response");
const listaEsperaHelpers_1 = require("../utils/listaEsperaHelpers");
const userCentroCusto_model_1 = __importDefault(require("../models/userCentroCusto.model"));
const createListaEspera = async (req, res, next) => {
    try {
        const dto = listaEspera_schema_1.createListaEsperaBodySchema.parse(req.body);
        if (!req.currentUser) {
            res.status(401).json({ error: "Usuário não autenticado" });
            return;
        }
        const user = req.currentUser;
        const userTipo = user.tipoFuncionario;
        const userId = user.id;
        const userObraId = user.obraId;
        // Normalize CC data
        const ccCodReq = (dto.centro_custo.Centro_Negocio_Cod || "").trim();
        const ccNameReq = (dto.centro_custo.Centro_Nome || "").trim();
        // Validate CC exists
        const ccRow = await centroCusto_model_1.default.findOne({
            where: {
                Centro_Negocio_Cod: ccCodReq,
            },
        });
        if (!ccRow) {
            res.status(400).json({
                error: `Centro de custo '${ccCodReq}' não existe`,
            });
            return;
        }
        // Authorization logic
        if (userTipo === "Almoxarife") {
            if (!userObraId) {
                res.status(403).json({
                    error: "Almoxarife não associado a uma obra",
                });
                return;
            }
            // Verify CC belongs to user's obra
            if (ccRow.work_id !== userObraId) {
                res.status(403).json({
                    error: `CC '${ccCodReq}' não pertence à obra do usuário`,
                });
                return;
            }
            // Verify user has permission for this CC
            // Query user_centro_custo association table
            const vinculo = await userCentroCusto_model_1.default.findOne({
                where: {
                    funcionario_id: userId,
                    obra_id: userObraId,
                    centro_custo_cod: ccRow.Centro_Negocio_Cod,
                },
                raw: true,
            });
            if (!vinculo) {
                res.status(403).json({
                    error: `Usuário não possui permissão para o CC '${ccCodReq}'`,
                });
                return;
            }
        }
        else if (userTipo !== "Administrador") {
            res.status(403).json({ error: "Acesso não autorizado" });
            return;
        }
        const produtos = dto.produtos;
        const codigoPedido = await (0, listaEsperaHelpers_1.generateOrderNumberOptimized)();
        const createdItems = [];
        // Use transaction for creating multiple records
        const transaction = await dbConfig_1.default.transaction();
        try {
            for (const produtoData of produtos) {
                const produto = await insumos_model_1.default.findOne({
                    where: {
                        Insumo_Cod: produtoData.Insumo_Cod,
                        SubInsumo_Especificacao: produtoData.SubInsumo_Especificacao,
                    },
                    transaction,
                });
                if (!produto) {
                    await transaction.rollback();
                    res.status(404).json({
                        error: "Produto não encontrado para o código ou nome fornecido",
                    });
                    return;
                }
                // Serialize CC data for JSONB field
                const centroCustoDict = {
                    Centro_Negocio_Cod: ccCodReq,
                    Centro_Nome: ccNameReq || ccRow.Centro_Nome || ccRow.nome,
                };
                const dbListaEspera = await listaEspera_model_1.default.create({
                    ...produtoData,
                    almoxarife_nome: dto.almoxarife_nome,
                    destino: dto.destino,
                    centro_custo: centroCustoDict,
                    codigo_pedido: codigoPedido,
                }, { transaction });
                createdItems.push(dbListaEspera);
            }
            await transaction.commit();
            const response = listaEspera_response_1.createListaEsperaResponseSchema.parse({
                codigo_pedido: codigoPedido,
            });
            res.status(201).json(response);
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.createListaEspera = createListaEspera;
const readListaEspera = async (req, res, next) => {
    try {
        const queryParams = listaEspera_schema_1.getListaEsperaQuerySchema.parse(req.query);
        if (!req.currentUser) {
            res.status(401).json({ error: "Usuário não autenticado" });
            return;
        }
        const user = req.currentUser;
        const userTipo = user.tipoFuncionario;
        const userId = user.id;
        const userObraId = user.obraId;
        const { skip, limit, codigo_pedido, destino, centro_custo, Insumo_Cod, Unid_Cod, SubInsumo_Especificacao, work_id } = queryParams;
        // Build base query
        const whereClause = {};
        // Authorization filtering
        if (userTipo === "Almoxarife") {
            if (!userObraId) {
                res.status(403).json({
                    error: "Almoxarife não associado a uma obra",
                });
                return;
            }
            // Get allowed CC codes from user_centro_custo association table
            // First, get the centroCustoIds that the user has access to
            const userCentroCustos = await userCentroCusto_model_1.default.findAll({
                where: {
                    funcionario_id: userId,
                    obra_id: userObraId,
                },
                attributes: ["centro_custo_cod"],
                raw: true,
            });
            if (!userCentroCustos || userCentroCustos.length === 0) {
                // User has no CCs assigned, return empty array
                const response = listaEspera_response_1.getAllListaEsperaResponseSchema.parse([]);
                res.status(200).json(response);
                return;
            }
            const allowedCentroCustoIds = userCentroCustos.map((uc) => uc.centro_custo_cod);
            // Get the Centro_Negocio_Cod values for these centroCustoIds
            const centros = await centroCusto_model_1.default.findAll({
                where: {
                    Centro_Negocio_Cod: {
                        [sequelize_1.Op.in]: allowedCentroCustoIds,
                    },
                },
                attributes: ["Centro_Negocio_Cod"],
                raw: true,
            });
            const allowedCodes = centros
                .map((c) => c.Centro_Negocio_Cod)
                .filter((code) => code != null);
            if (allowedCodes.length === 0) {
                const response = listaEspera_response_1.getAllListaEsperaResponseSchema.parse([]);
                res.status(200).json(response);
                return;
            }
            // Filter by CC codes using JSONB expression
            // Escape single quotes in codes to prevent SQL injection
            const escapedCodes = allowedCodes.map((code) => code.replace(/'/g, "''"));
            whereClause[sequelize_1.Op.or] = escapedCodes.map((code) => (0, sequelize_1.literal)(`centro_custo->>'Centro_Negocio_Cod' = '${code}'`));
        }
        else if (userTipo === "Administrador") {
            // Admin can filter by obra if work_id is provided
            if (work_id !== undefined) {
                // Join with CentroCusto to filter by obraId
                // This will be handled in the query options
            }
        }
        else {
            res.status(403).json({ error: "Acesso não autorizado" });
            return;
        }
        // Additional filters
        if (codigo_pedido !== undefined) {
            whereClause.codigo_pedido = codigo_pedido;
        }
        if (destino) {
            whereClause.destino = {
                [sequelize_1.Op.iLike]: `%${destino}%`,
            };
        }
        if (centro_custo) {
            // Use helper function for CC search
            const ccSearchCondition = (0, listaEsperaHelpers_1.ccCodeOrNameLike)(centro_custo);
            if (whereClause[sequelize_1.Op.and]) {
                whereClause[sequelize_1.Op.and].push(ccSearchCondition);
            }
            else {
                whereClause[sequelize_1.Op.and] = [ccSearchCondition];
            }
        }
        if (SubInsumo_Especificacao) {
            whereClause.SubInsumo_Especificacao = {
                [sequelize_1.Op.iLike]: `%${SubInsumo_Especificacao}%`,
            };
        }
        if (Unid_Cod) {
            whereClause.Unid_Cod = {
                [sequelize_1.Op.iLike]: `%${Unid_Cod}%`,
            };
        }
        if (Insumo_Cod !== undefined) {
            whereClause.Insumo_Cod = Insumo_Cod;
        }
        // Build query options
        const queryOptions = {
            where: whereClause,
            order: [["id", "DESC"]],
            offset: skip,
            limit: limit,
        };
        // For Admin filtering by obra, use subquery with CentroCusto
        if (userTipo === "Administrador" && work_id !== undefined) {
            // Get CC codes that belong to the specified obra
            const centrosObra = await centroCusto_model_1.default.findAll({
                where: {
                    work_id: work_id,
                },
                attributes: ["Centro_Negocio_Cod"],
                raw: true,
            });
            const obraCodes = centrosObra
                .map((c) => c.Centro_Negocio_Cod)
                .filter((code) => code != null);
            if (obraCodes.length === 0) {
                // No CCs for this obra, return empty array
                const response = listaEspera_response_1.getAllListaEsperaResponseSchema.parse([]);
                res.status(200).json(response);
                return;
            }
            // Filter by CC codes using JSONB expression
            const escapedCodes = obraCodes.map((code) => code.replace(/'/g, "''"));
            if (whereClause[sequelize_1.Op.and]) {
                whereClause[sequelize_1.Op.and].push({
                    [sequelize_1.Op.or]: escapedCodes.map((code) => (0, sequelize_1.literal)(`centro_custo->>'Centro_Negocio_Cod' = '${code}'`)),
                });
            }
            else {
                whereClause[sequelize_1.Op.and] = [
                    {
                        [sequelize_1.Op.or]: escapedCodes.map((code) => (0, sequelize_1.literal)(`centro_custo->>'Centro_Negocio_Cod' = '${code}'`)),
                    },
                ];
            }
        }
        const listaEspera = await listaEspera_model_1.default.findAll(queryOptions);
        // Transform to response format
        const responseData = listaEspera.map((item) => {
            const plain = item.toJSON();
            return {
                id: plain.id,
                codigo_pedido: plain.codigo_pedido,
                Insumo_Cod: plain.Insumo_Cod,
                SubInsumo_Cod: plain.SubInsumo_Cod,
                SubInsumo_Especificacao: plain.SubInsumo_Especificacao,
                quantidade: plain.quantidade,
                almoxarife_nome: plain.almoxarife_nome,
                centro_custo: plain.centro_custo,
                Unid_Cod: plain.Unid_Cod,
                destino: plain.destino,
                data_att: plain.data_att,
            };
        });
        const response = listaEspera_response_1.getAllListaEsperaResponseSchema.parse(responseData);
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.readListaEspera = readListaEspera;
const deleteListaEspera = async (req, res, next) => {
    try {
        const { codigo_pedido, Insumo_Cod, SubInsumo_Cod } = req.params;
        if (!req.currentUser) {
            res.status(401).json({ error: "Usuário não autenticado" });
            return;
        }
        const user = req.currentUser;
        const userTipo = user.tipoFuncionario;
        const userId = user.id;
        const userObraId = user.obraId;
        // Optional: Apply authorization checks similar to GET
        if (userTipo === "Almoxarife") {
            // Find the item first to check authorization
            const item = await listaEspera_model_1.default.findOne({
                where: {
                    codigo_pedido: codigo_pedido,
                    Insumo_Cod: Number(Insumo_Cod),
                    SubInsumo_Cod: Number(SubInsumo_Cod),
                },
            });
            if (!item) {
                res.status(404).json({ error: "Item não encontrado" });
                return;
            }
            // Check if user has permission for this CC
            const centroCustoData = item.toJSON().centro_custo;
            const ccCod = centroCustoData?.Centro_Negocio_Cod;
            if (ccCod) {
                const ccRow = await centroCusto_model_1.default.findOne({
                    where: {
                        Centro_Negocio_Cod: ccCod,
                    },
                });
                if (ccRow && ccRow.work_id === userObraId) {
                    // Verify user has permission
                    const vinculo = await userCentroCusto_model_1.default.findOne({
                        where: {
                            funcionario_id: userId,
                            obra_id: userObraId,
                            centro_custo_cod: ccRow.Centro_Negocio_Cod,
                        },
                    });
                    if (!vinculo) {
                        res.status(403).json({
                            error: "Usuário não possui permissão para este item",
                        });
                        return;
                    }
                }
                else {
                    res.status(403).json({
                        error: "Item não pertence à obra do usuário",
                    });
                    return;
                }
            }
        }
        else if (userTipo !== "Administrador") {
            res.status(403).json({ error: "Acesso não autorizado" });
            return;
        }
        const deleted = await listaEspera_model_1.default.destroy({
            where: {
                codigo_pedido: codigo_pedido,
                Insumo_Cod: Number(Insumo_Cod),
                SubInsumo_Cod: Number(SubInsumo_Cod),
            },
        });
        if (deleted === 0) {
            res.status(404).json({ error: "Item não encontrado" });
            return;
        }
        res.status(200).json({ detail: "Item removido com sucesso" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteListaEspera = deleteListaEspera;
//# sourceMappingURL=listaEspera.js.map