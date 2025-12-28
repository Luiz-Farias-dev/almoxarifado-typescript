"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCentroCustoBodySchema = void 0;
const zod_1 = require("zod");
exports.createCentroCustoBodySchema = zod_1.z.object({
    nome: zod_1.z.string().min(3, "nome é obrigatório"),
});
//# sourceMappingURL=centroCusto.schema.js.map