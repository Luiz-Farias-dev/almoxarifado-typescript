"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import obrasController from '../controllers/workController.js';
const obra_js_1 = require("../controllers/obra.js");
// import authMiddleware from '../middleware/auth.js';
const router = express_1.default.Router();
// Endpoints para Obras (Works)
router.post("/obra", obra_js_1.createObra);
router.get("/obra", obra_js_1.getAllObras);
router.get("/obra/:obraId", obra_js_1.getObraById);
exports.default = router;
//# sourceMappingURL=obra.js.map