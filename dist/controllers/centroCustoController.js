"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCentroCusto = void 0;
const centroCusto_model_1 = __importDefault(require("./../models/centroCusto.model"));
const getAllCentroCusto = (req, res, next) => {
    centroCusto_model_1.default.findAll()
        .then((centroCustos) => {
        res.status(200).json(centroCustos);
    })
        .catch((err) => {
        console.error("Erro ao buscar centros de custo:", err);
        res.status(500).json({ error: "Erro ao buscar centros de custo" });
    });
};
exports.getAllCentroCusto = getAllCentroCusto;
//# sourceMappingURL=centroCustoController.js.map