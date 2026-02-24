"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const tabelaFinal_1 = require("../controllers/tabelaFinal");
const router = express_1.default.Router();
// Apply authentication middleware
router.use(auth_1.getCurrentUser);
router.post("/tabela-final", tabelaFinal_1.createTabelaFinal);
exports.default = router;
//# sourceMappingURL=tabelaFinal.js.map