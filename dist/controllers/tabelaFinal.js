"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTabelaFinal = void 0;
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const tabelaFinal_model_1 = __importDefault(require("../models/tabelaFinal.model"));
const insumos_model_1 = __importDefault(require("../models/insumos.model"));
const listaEspera_model_1 = __importDefault(require("../models/listaEspera.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const tabelaFinal_schema_1 = require("../schemas/tabelaFinal/tabelaFinal.schema");
const createTabelaFinal = async (req, res, next) => {
    try {
        const dto = tabelaFinal_schema_1.tabelaFinalBodySchema.parse(req.body);
        if (!req.currentUser) {
            res.status(401).json({ error: "Usuário não autenticado" });
            return;
        }
        let receptor_nome = null;
        if (dto.cpf) {
            const funcionario = await user_model_1.default.findOne({
                where: { cpf: dto.cpf },
                raw: true,
            });
            if (!funcionario) {
                res
                    .status(403)
                    .json({ error: "CPF não corresponde a nenhum registro válido" });
                return;
            }
            receptor_nome = funcionario.nome;
        }
        const transaction = await dbConfig_1.default.transaction();
        try {
            for (const produtoData of dto.produtos) {
                const codParts = String(produtoData.Insumo_e_SubInsumo_Cod || "")
                    .split("-")
                    .map((s) => s.trim());
                const insumoCod = codParts[0];
                const subinsumoCod = codParts.length >= 2 && codParts[1] !== "" ? codParts[1] : null;
                const produto = await insumos_model_1.default.findOne({
                    where: {
                        Insumo_Cod: Number(insumoCod),
                        SubInsumo_Cod: subinsumoCod ? Number(subinsumoCod) : null,
                    },
                    transaction,
                });
                if (!produto) {
                    await transaction.rollback();
                    res.status(404).json({
                        error: `Produto não encontrado para o código '${produtoData.Insumo_e_SubInsumo_Cod}'`,
                    });
                    return;
                }
                const itemData = {
                    Centro_Negocio_Cod: (produtoData.Centro_Negocio_Cod || "").trim(),
                    Insumo_e_SubInsumo_Cod: produtoData.Insumo_e_SubInsumo_Cod,
                    Num_Doc: produtoData.codigo_pedido
                        ? Number(produtoData.codigo_pedido)
                        : 0,
                    Tipo_Doc: produtoData.Tipo_Doc || "ND",
                    quantidade: produtoData.quantidade,
                    destino: produtoData.destino,
                    Observacao: produtoData.Observacao,
                    almoxarife_nome: produtoData.almoxarife_nome,
                    receptor_nome: receptor_nome,
                };
                await tabelaFinal_model_1.default.create(itemData, { transaction });
                // Remove from lista_espera if exists
                await listaEspera_model_1.default.destroy({
                    where: {
                        Insumo_Cod: Number(insumoCod),
                        SubInsumo_Cod: subinsumoCod ? Number(subinsumoCod) : null,
                    },
                    transaction,
                });
            }
            await transaction.commit();
            res
                .status(201)
                .json({ detail: "Itens adicionados com sucesso!", employee_name: receptor_nome });
        }
        catch (err) {
            await transaction.rollback();
            next(err);
        }
    }
    catch (err) {
        next(err);
    }
};
exports.createTabelaFinal = createTabelaFinal;
exports.default = exports.createTabelaFinal;
//# sourceMappingURL=tabelaFinal.js.map