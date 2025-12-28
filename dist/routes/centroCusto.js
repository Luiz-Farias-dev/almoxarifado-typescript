"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const centroCustoController_1 = require("../controllers/centroCustoController");
const router = (0, express_1.Router)();
router.get("/centroCusto", centroCustoController_1.getAllCentroCusto);
router.post("/centroCusto", centroCustoController_1.createCentroCusto);
exports.default = router;
//# sourceMappingURL=centroCusto.js.map