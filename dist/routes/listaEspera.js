"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const listaEspera_1 = require("../controllers/listaEspera");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.getCurrentUser);
router.post("/lista-espera", listaEspera_1.createListaEspera);
router.get("/lista-espera", listaEspera_1.readListaEspera);
router.delete("/lista-espera/:codigo_pedido/:Insumo_Cod/:SubInsumo_Cod", listaEspera_1.deleteListaEspera);
exports.default = router;
//# sourceMappingURL=listaEspera.js.map