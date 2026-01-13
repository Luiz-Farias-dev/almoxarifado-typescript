"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const insumos_js_1 = require("../controllers/insumos.js");
// import authMiddleware from '../middleware/auth.js';
const router = express_1.default.Router();
router.post("/insumos", insumos_js_1.uploadInsumos);
router.post("/insumo", insumos_js_1.createInsumo);
router.get("/insumos", insumos_js_1.getAllInsumos);
exports.default = router;
//# sourceMappingURL=insumos.js.map