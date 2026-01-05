"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObraById = exports.getAllObras = exports.createObra = void 0;
const obra_model_1 = __importDefault(require("./../models/obra.model"));
const obra_schema_1 = require("../schemas/obra/obra.schema");
const obra_response_1 = require("../schemas/obra/obra.response");
const createObra = (req, res, next) => {
    const dto = obra_schema_1.createObraBodySchema.parse(req.body);
    obra_model_1.default.create(dto)
        .then((obra) => {
        res.status(201).json(obra);
    })
        .catch((err) => {
        console.error("Erro ao criar obra:", err);
        res.status(500).json({ error: "Erro ao criar obra" });
    });
};
exports.createObra = createObra;
const getAllObras = (req, res, next) => {
    obra_model_1.default.findAll({ attributes: ["id", "nome"], raw: true })
        .then((obras) => {
        const dto = obra_response_1.getAllObraResponseSchema.parse(obras);
        res.status(200).json(dto);
    })
        .catch((err) => {
        console.error("Erro ao buscar obras:", err);
        res.status(500).json({ error: "Erro ao buscar obras" });
    });
};
exports.getAllObras = getAllObras;
const getObraById = (req, res, next) => {
    const obraId = Number(req.params.obraId);
    if (!Number.isInteger(obraId) || obraId <= 0) {
        res.status(400).json({ error: "obraId inválido" });
        return;
    }
    obra_model_1.default.findByPk(obraId, { attributes: ["id", "nome"], raw: true })
        .then((obra) => {
        if (!obra) {
            res.status(404).json({ error: "Obra não encontrada" });
            return;
        }
        const dto = obra_response_1.obraResponseSchema.parse(obra);
        res.status(200).json(dto);
    })
        .catch((err) => {
        console.error("Erro ao buscar obra:", err);
        res.status(500).json({ error: "Erro ao buscar obra" });
    });
};
exports.getObraById = getObraById;
//# sourceMappingURL=obra.js.map