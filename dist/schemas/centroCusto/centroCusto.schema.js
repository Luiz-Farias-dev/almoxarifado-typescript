"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCentroCustoBodySchema = void 0;
const zod_1 = require("zod");
exports.createCentroCustoBodySchema = zod_1.z.object({
    Centro_Negocio_Cod: zod_1.z.string().min(3, "Centro_Negocio_Cod é obrigatório"),
    Centro_Nome: zod_1.z.string().min(3, "Centro_Nome é obrigatório"),
    work_id: zod_1.z.number().int().positive("work_id deve ser um número positivo"),
});
//# sourceMappingURL=centroCusto.schema.js.map