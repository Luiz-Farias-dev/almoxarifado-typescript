"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCentroCustoResponseSchema = exports.centroCustoResponseSchema = void 0;
const zod_1 = require("zod");
exports.centroCustoResponseSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    nome: zod_1.z.string(),
});
exports.GetAllCentroCustoResponseSchema = zod_1.z.array(exports.centroCustoResponseSchema);
//# sourceMappingURL=centroCusto.response.js.map