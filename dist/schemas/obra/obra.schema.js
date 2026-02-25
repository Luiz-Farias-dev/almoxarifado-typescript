"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObraBodySchema = void 0;
const zod_1 = require("zod");
exports.createObraBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    initials: zod_1.z.string().min(1).max(50).optional().nullable(),
});
//# sourceMappingURL=obra.schema.js.map