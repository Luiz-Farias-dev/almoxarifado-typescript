"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnMapping = exports.renomearColunas = exports.normalizarObsoleto = exports.detectarEncodingEDelimitador = exports.separarCodigo = void 0;
const jschardet_1 = __importDefault(require("jschardet"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
//A função extrai os 3 últimos caracteres como "sub" e o restante como "insumo", com tratamentos especiais para valores vazios ou muito curtos.
const separarCodigo = (insumoCodigo) => {
    if (insumoCodigo === null || insumoCodigo === undefined)
        return { insumo: null, sub: null };
    const codigoStr = String(insumoCodigo).trim();
    if (!codigoStr)
        return { insumo: null, sub: null };
    if (codigoStr.length <= 3)
        return { insumo: codigoStr, sub: null };
    return { insumo: codigoStr.slice(0, -3), sub: codigoStr.slice(-3) };
};
exports.separarCodigo = separarCodigo;
// A função detecta a codificação e o delimitador de um buffer de arquivo CSV.
const detectarEncodingEDelimitador = (buf) => {
    const det = jschardet_1.default.detect(buf);
    const encoding = (det.encoding || "utf-8").toLowerCase();
    let sample = "";
    try {
        sample = iconv_lite_1.default.decode(buf.subarray(0, 10000), encoding);
    }
    catch {
        sample = buf.subarray(0, 10000).toString("utf-8");
    }
    const delimiters = [",", ";", "\t", "|"];
    const counts = delimiters.map((delim) => ({
        delim,
        count: (sample.match(new RegExp(`\\${delim}`, "g")) || []).length,
    }));
    counts.sort((a, b) => b.count - a.count);
    return { encoding, delimiter: counts[0]?.delim ?? "," };
};
exports.detectarEncodingEDelimitador = detectarEncodingEDelimitador;
// A função normaliza valores booleanos para "S" ou "N".
const normalizarObsoleto = (value) => {
    const v = String(value ?? "")
        .trim()
        .toUpperCase();
    if (["SIM", "S", "YES", "Y", "TRUE", "1", "OBSOLETO", "OBSSOLETO"].includes(v))
        return "S";
    if (["NAO", "NÃO", "N", "NO", "FALSE", "0", ""].includes(v))
        return "N";
    return v || "N";
};
exports.normalizarObsoleto = normalizarObsoleto;
const renomearColunas = (row, mapping) => {
    const out = { ...row };
    for (const [oldKey, newKey] of Object.entries(mapping)) {
        if (Object.prototype.hasOwnProperty.call(out, oldKey)) {
            out[newKey] = out[oldKey];
            if (newKey !== oldKey)
                delete out[oldKey];
        }
    }
    return out;
};
exports.renomearColunas = renomearColunas;
exports.columnMapping = {
    // formato antigo
    Insumo_Cod: "Insumo_Cod",
    SubInsumo_Cod: "SubInsumo_Cod",
    Unid_Cod: "Unid_Cod",
    SubInsumo_Especificacao: "SubInsumo_Especificacao",
    INSUMO_ITEMOBSOLETO: "INSUMO_ITEMOBSOLETO",
    Insumo_ItemObsoleto: "Insumo_ItemObsoleto",
    // novas colunas unificadas
    Insumo_Codigo: "Insumo_Codigo",
    Insumo_Especificacao: "Insumo_Especificacao",
    // alternativos
    "Código Insumo": "Insumo_Codigo",
    "Código do Insumo": "Insumo_Codigo",
    "Codigo Insumo": "Insumo_Codigo",
    Código: "Insumo_Codigo",
    "Código Produto": "Insumo_Codigo",
    "Código Material": "Insumo_Codigo",
    "Especificação Insumo": "Insumo_Especificacao",
    "Especificação do Insumo": "Insumo_Especificacao",
    "Especificacao Insumo": "Insumo_Especificacao",
    "Código SubInsumo": "SubInsumo_Cod",
    "Código do SubInsumo": "SubInsumo_Cod",
    "Codigo SubInsumo": "SubInsumo_Cod",
    Unidade: "Unid_Cod",
    "Unidade de Medida": "Unid_Cod",
    Especificação: "SubInsumo_Especificacao",
    Descrição: "SubInsumo_Especificacao",
    Especificacao: "SubInsumo_Especificacao",
    Obsoleto: "Insumo_ItemObsoleto",
    "Item Obsoleto": "Insumo_ItemObsoleto",
    "Status Obsoleto": "Insumo_ItemObsoleto",
};
//# sourceMappingURL=insumosHelpers.js.map