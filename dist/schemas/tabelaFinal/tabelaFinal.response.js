"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabelaFinalResponseSchema = void 0;
const zod_1 = require("zod");
exports.tabelaFinalResponseSchema = zod_1.z.object({
    detail: zod_1.z.string(),
    employee_name: zod_1.z.string().nullable(),
});
//# sourceMappingURL=tabelaFinal.response.js.map