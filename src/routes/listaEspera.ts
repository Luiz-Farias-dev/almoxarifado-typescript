import express from "express";
import { getCurrentUser } from "../middleware/auth";
import {
  createListaEspera,
  readListaEspera,
  deleteListaEspera,
} from "../controllers/listaEspera";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(getCurrentUser);

router.post("/lista-espera", createListaEspera);

router.get("/lista-espera", readListaEspera);

router.delete(
  "/lista-espera/:codigo_pedido/:Insumo_Cod/:SubInsumo_Cod",
  deleteListaEspera
);

export default router;
