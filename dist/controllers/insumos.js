"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllInsumos = exports.createInsumo = exports.uploadInsumos = void 0;
const XLSX = __importStar(require("xlsx"));
const sync_1 = require("csv-parse/sync");
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const sequelize_1 = require("sequelize");
const insumos_model_1 = __importDefault(require("../models/insumos.model"));
const insumosHelpers_1 = require("../utils/insumosHelpers");
const insumos_schema_1 = require("../schemas/insumos/insumos.schema");
const insumos_response_1 = require("../schemas/insumos/insumos.response");
const uploadInsumos = async (req, res, next) => {
    const file = req.file;
    if (!file?.originalname) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }
    const name = file.originalname.toLowerCase();
    const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls");
    const isCsv = name.endsWith(".csv");
    if (!isXlsx && !isCsv) {
        return res.status(400).json({
            error: "Formato de arquivo não suportado. Use .xlsx, .xls ou .csv.",
        });
    }
    const fileType = isCsv ? "CSV" : "Excel";
    try {
        //Ler arquivos -> rows
        let rows = [];
        if (isXlsx) {
            const workbook = XLSX.read(file.buffer, { type: "buffer" });
            if (!workbook.SheetNames.length) {
                return res.status(400).json({
                    error: "O arquivo Excel não contém planilhas.",
                });
            }
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            if (!worksheet) {
                return res.status(400).json({
                    error: `A planilha "${firstSheetName}" não foi encontrada. O arquivo pode estar corrompido.`,
                });
            }
            rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        }
        else {
            const { encoding, delimiter } = (0, insumosHelpers_1.detectarEncodingEDelimitador)(file.buffer);
            let decoded = "";
            try {
                decoded = iconv_lite_1.default.decode(file.buffer, encoding);
            }
            catch {
                decoded = file.buffer.toString("utf-8");
            }
            try {
                rows = (0, sync_1.parse)(decoded, {
                    columns: true,
                    delimiter,
                    skip_empty_lines: true,
                    trim: true,
                    bom: true,
                });
            }
            catch (err) {
                //fallback simples
                const attempts = [
                    { encoding: "utf-8", delimiter: "," },
                    { encoding: "utf-8", delimiter: ";" },
                    { encoding: "latin1", delimiter: "," },
                    { encoding: "latin1", delimiter: ";" },
                ];
                let ok = false;
                for (const attempt of attempts) {
                    try {
                        const d = file.buffer.toString(attempt.encoding === "latin1" ? "latin1" : attempt.encoding);
                        rows = (0, sync_1.parse)(d, {
                            columns: true,
                            delimiter: attempt.delimiter,
                            skip_empty_lines: true,
                            trim: true,
                            bom: true,
                        });
                        ok = rows.length > 0;
                        if (ok)
                            break;
                    }
                    catch {
                        //tentar próximo
                    }
                }
                if (!ok) {
                    return res.status(400).json({
                        error: "Não foi possível analisar o arquivo CSV. Verifique o formato e o conteúdo do arquivo.",
                    });
                }
            }
        }
        if (!rows.length) {
            return res.status(400).json({ error: "O arquivo enviado está vazio." });
        }
        //Mapear colunas
        let mappedRows = rows.map((r) => (0, insumosHelpers_1.renomearColunas)(r, insumosHelpers_1.columnMapping));
        //Insumo_ItemObsoleto normalização
        mappedRows = mappedRows.map((r) => {
            if (r.Insumo_ItemObsoleto !== undefined &&
                r.INSUMO_ITEMOBSOLETO === undefined) {
                r.INSUMO_ITEMOBSOLETO = r.Insumo_ItemObsoleto;
                delete r.Insumo_ItemObsoleto;
            }
            return r;
        });
        const columns = new Set(Object.keys(mappedRows ?? {}));
        const hasInsumoCodigo = columns.has("Insumo_Cod");
        const hasSeparateCodes = columns.has("Insumo_Cod") && columns.has("SubInsumo_Cod");
        const hasInsumoEspecificacao = columns.has("Insumo_Especificacao");
        const hasSubInsumoEspecificacao = columns.has("SubInsumo_Especificacao");
        if (!hasInsumoCodigo && !hasSeparateCodes) {
            return res.status(400).json({
                error: "O arquivo deve conter a coluna 'Insumo_Cod' ou ambas 'Insumo_Cod' e 'SubInsumo_Cod'.",
                colunasEncontradas: Array.from(columns),
            });
        }
        for (const required of ["Unid_Cod", "INSUMO_ITEMOBSOLETO"]) {
            if (!columns.has(required)) {
                return res.status(400).json({
                    error: `O arquivo deve conter a coluna obrigatória '${required}'.`,
                    colunasEncontradas: Array.from(columns),
                });
            }
        }
        //Insumo_Codigo -> Insumo_Cod + SubInsumo_Cod
        if (hasInsumoCodigo) {
            mappedRows = mappedRows.map((r) => {
                const { insumo, sub } = (0, insumosHelpers_1.separarCodigo)(String(r.Insumo_Codigo || ""));
                r.Insumo_Cod = insumo;
                r.SubInsumo_Cod = sub;
                delete r.Insumo_Codigo;
                return r;
            });
        }
        //Insumo_Especificacao -> SubInsumo_Especificacao
        if (hasInsumoEspecificacao) {
            mappedRows = mappedRows.map((r) => {
                r.SubInsumo_Especificacao = r.Insumo_Especificacao;
                delete r.Insumo_Especificacao;
                return r;
            });
        }
        //Limpeza + Normalização
        const cleaned = mappedRows
            .map((r) => ({
            Insumo_Cod: r.Insumo_Cod != null ? String(r.Insumo_Cod).trim() : null,
            SubInsumo_Cod: r.SubInsumo_Cod != null && String(r.SubInsumo_Cod).trim() !== ""
                ? String(r.SubInsumo_Cod).trim()
                : null,
            Unid_Cod: r.Unid_Cod != null && String(r.Unid_Cod).trim() !== ""
                ? String(r.Unid_Cod).trim()
                : "",
            SubInsumo_Especificacao: r.SubInsumo_Especificacao != null
                ? String(r.SubInsumo_Especificacao).trim()
                : null,
            INSUMO_ITEMOBSOLETO: (0, insumosHelpers_1.normalizarObsoleto)(r.INSUMO_ITEMOBSOLETO),
        }))
            .filter((r) => r.Insumo_Cod != null && r.SubInsumo_Especificacao != null)
            .map((r) => ({
            Insumo_Cod: r.Insumo_Cod,
            SubInsumo_Cod: r.SubInsumo_Cod,
            Unid_Cod: r.Unid_Cod,
            SubInsumo_Especificacao: r.SubInsumo_Especificacao,
            INSUMO_ITEMOBSOLETO: r.INSUMO_ITEMOBSOLETO,
        }));
        //Dedupe no payload(Remove duplicadas mantendo a primeira ocorrência)
        const uniqueMap = new Map();
        for (const r of cleaned) {
            const key = `${r.Insumo_Cod}::${r.SubInsumo_Cod ?? "NULL"}::${r.SubInsumo_Especificacao} `;
            if (!uniqueMap.has(key))
                uniqueMap.set(key, r);
        }
        const uniqueRows = Array.from(uniqueMap.values());
        //Checar existentes em lotes
        const batchSize = 500;
        const existingKeys = new Set();
        for (let i = 0; i < uniqueRows.length; i += batchSize) {
            const batch = uniqueRows.slice(i, i + batchSize);
            const orConditions = batch.map((b) => ({
                Insumo_Cod: b.Insumo_Cod,
                SubInsumo_Cod: b.SubInsumo_Cod,
                SubInsumo_Especificacao: b.SubInsumo_Especificacao,
            }));
            const existing = await insumos_model_1.default.findAll({
                attributes: ["Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao"],
                where: { [sequelize_1.Op.or]: orConditions },
                raw: true,
            });
            for (const e of existing) {
                const key = `${String(e.Insumo_Cod)}::${e.SubInsumo_Cod ?? "NULL"}::${String(e.SubInsumo_Especificacao)} `;
                existingKeys.add(key);
            }
        }
        const newRecords = uniqueRows.filter((r) => {
            const key = `${r.Insumo_Cod}::${r.SubInsumo_Cod ?? "NULL"}::${r.SubInsumo_Especificacao} `;
            return !existingKeys.has(key);
        });
        if (!newRecords.length) {
            const dto = insumos_response_1.uploadResumoResponseSchema.parse({
                message: "Nenhum novo insumo para adicionar. Todos os registros já existem na base de dados.",
                total_rows: uniqueRows.length,
                new_rows: 0,
                ignored_rows: uniqueRows.length,
                file_type: fileType,
            });
            return res.status(200).json(dto);
        }
        //Inserir em lotes
        for (let i = 0; i < newRecords.length; i += batchSize) {
            const batch = newRecords.slice(i, i + batchSize);
            await insumos_model_1.default.bulkCreate(batch, { ignoreDuplicates: true });
        }
        //SQL de limpeza de duplicados (postgres)
        try {
            await insumos_model_1.default.sequelize?.query(`
      DELETE FROM "Insumos"
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM "Insumos"
        GROUP BY "Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao"
      );
    `);
        }
        catch (err) {
            console.error("Erro ao remover duplicados após upload de insumos:", err);
        }
        const total_rows = uniqueRows.length;
        const new_rows = newRecords.length;
        const ignored_rows = total_rows - new_rows;
        const processamento = [];
        if (hasInsumoCodigo) {
            processamento.push("Separação do código do insumo em 'Insumo_Cod' e 'SubInsumo_Cod'.");
        }
        if (hasInsumoEspecificacao) {
            processamento.push("Renomeação da coluna 'Insumo_Especificacao' para 'SubInsumo_Especificacao'.");
        }
        const dto = insumos_response_1.uploadResumoResponseSchema.parse({
            message: `Processamento concluído. ${new_rows} novos insumos adicionados, ${ignored_rows} registros ignorados(já existiam). Limpeza de duplicados executada.`,
            total_rows,
            new_rows,
            ignored_rows,
            file_type: fileType,
            processamento: processamento.join(", "),
        });
        res.status(200).json(dto);
    }
    catch (error) {
        console.error("Erro ao processar o upload de insumos:", error);
        res
            .status(500)
            .json({ error: "Ocorreu um erro ao processar o arquivo enviado." });
    }
};
exports.uploadInsumos = uploadInsumos;
const createInsumo = async (req, res, next) => {
    try {
        const dto = insumos_schema_1.produtoBaseSchema.parse(req.body);
        const novoInsumo = await insumos_model_1.default.create(dto);
        const responseDto = insumos_response_1.produtoResponseSchema.parse(novoInsumo.toJSON());
        res.status(201).json(responseDto);
    }
    catch (error) {
        console.error("Erro ao criar novo insumo:", error);
        res.status(500).json({ error: "Ocorreu um erro ao criar o insumo." });
    }
};
exports.createInsumo = createInsumo;
const getAllInsumos = async (req, res, next) => {
    try {
        const insumos = await insumos_model_1.default.findAll();
        const responseDto = insumos_response_1.getAllProdutosResponseSchema.parse(insumos.map((insumo) => insumo.toJSON()));
        res.status(200).json(responseDto);
    }
    catch (error) {
        console.error("Erro ao buscar todos os insumos:", error);
        res.status(500).json({ error: "Ocorreu um erro ao buscar os insumos." });
    }
};
exports.getAllInsumos = getAllInsumos;
//# sourceMappingURL=insumos.js.map