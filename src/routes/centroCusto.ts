import { Router } from "express";

import { getAllCentroCusto } from "../controllers/centroCustoController";

const router = Router();

router.get("/centroCusto", getAllCentroCusto);

export default router;
