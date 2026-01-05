"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllObraResponseSchema = exports.obraResponseSchema = void 0;
const zod_1 = require("zod");
exports.obraResponseSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    nome: zod_1.z.string().min(2).max(100),
});
exports.getAllObraResponseSchema = zod_1.z.array(exports.obraResponseSchema);
//# sourceMappingURL=obra.response.js.map