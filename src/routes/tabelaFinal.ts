import express from "express";
import { getCurrentUser } from "../middleware/auth";
import { createTabelaFinal } from "../controllers/tabelaFinal";

const router = express.Router();

// Apply authentication middleware
router.use(getCurrentUser);

router.post("/tabela-final", createTabelaFinal);

export default router;

