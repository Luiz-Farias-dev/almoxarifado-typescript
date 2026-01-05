import express from "express";
// import obrasController from '../controllers/workController.js';
import { createObra } from "../controllers/obra.js";
// import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Endpoints para Obras (Works)
router.post("/obra", createObra);
// router.get("/obra");
// router.get("/obra/:obraId");

export default router;
