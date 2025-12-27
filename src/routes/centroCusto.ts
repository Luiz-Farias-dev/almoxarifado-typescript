import { Router } from "express";

import {
  getAllCentroCusto,
  createCentroCusto,
} from "../controllers/centroCustoController";

const router = Router();

router.get("/centroCusto", getAllCentroCusto);

router.post("/centroCusto", createCentroCusto);

export default router;
