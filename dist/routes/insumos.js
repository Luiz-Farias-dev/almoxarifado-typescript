"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import { createInsumo, getAllInsumos, getInsumoById } from '../controllers/insumo.js';
// import authMiddleware from '../middleware/auth.js';
const router = express_1.default.Router();
router.post("/insumos");
router.get("/insumos");
router.get("/insumos/:id");
exports.default = router;
//# sourceMappingURL=insumos.js.map