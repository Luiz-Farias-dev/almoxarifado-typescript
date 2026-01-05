"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import obrasController from '../controllers/workController.js';
// import authMiddleware from '../middleware/auth.js';
const router = express_1.default.Router();
// Endpoints para Obras (Works)
router.post("/obra");
router.get("/obra");
router.get("/obra/:obraId");
exports.default = router;
//# sourceMappingURL=obra.js.map