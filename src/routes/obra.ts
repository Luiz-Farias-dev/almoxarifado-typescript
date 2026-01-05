import express from "express";
// import obrasController from '../controllers/workController.js';
import { createObra, getAllObras, getObraById } from "../controllers/obra.js";
// import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Endpoints para Obras (Works)
router.post("/obra", createObra);
router.get("/obra", getAllObras);
router.get("/obra/:obraId", getObraById);

export default router;
