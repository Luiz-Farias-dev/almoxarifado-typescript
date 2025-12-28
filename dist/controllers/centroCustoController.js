"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCentroCusto = exports.getAllCentroCusto = void 0;
const centroCusto_model_1 = __importDefault(require("./../models/centroCusto.model"));
const centroCusto_schema_1 = require("../schemas/centroCusto/centroCusto.schema");
const centroCusto_response_1 = require("../schemas/centroCusto/centroCusto.response");
const getAllCentroCusto = (req, res, next) => {
    centroCusto_model_1.default.findAll({ attributes: ["id", "nome"], raw: true })
        .then((centroCustos) => {
        const dto = centroCusto_response_1.GetAllCentroCustoResponseSchema.parse(centroCustos);
        res.status(200).json(dto);
    })
        .catch((err) => {
        console.error("Erro ao buscar centros de custo:", err);
        res.status(500).json({ error: "Erro ao buscar centros de custo" });
    });
};
exports.getAllCentroCusto = getAllCentroCusto;
const createCentroCusto = (req, res, next) => {
    const dto = centroCusto_schema_1.createCentroCustoBodySchema.parse(req.body);
    centroCusto_model_1.default.create(dto)
        .then((centroCusto) => {
        res.status(201).json(centroCusto);
    })
        .catch((err) => {
        console.error("Erro ao criar centro de custo:", err);
        res.status(500).json({ error: "Erro ao criar centro de custo" });
    });
};
exports.createCentroCusto = createCentroCusto;
//# sourceMappingURL=centroCustoController.js.map