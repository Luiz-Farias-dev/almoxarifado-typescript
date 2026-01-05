"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObra = void 0;
const obra_model_1 = __importDefault(require("./../models/obra.model"));
const obra_schema_1 = require("../schemas/obra/obra.schema");
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
//# sourceMappingURL=obra.js.map