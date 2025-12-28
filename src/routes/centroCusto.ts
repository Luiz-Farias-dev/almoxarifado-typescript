import { Router } from "express";

import {
  getAllCentroCusto,
  createCentroCusto,
  deleteCentroCusto,
} from "../controllers/centroCustoController";

const router = Router();

router.get("/centroCusto", getAllCentroCusto);

router.post("/centroCusto", createCentroCusto);

router.delete("/centroCusto/:centroId", deleteCentroCusto);

export default router;
