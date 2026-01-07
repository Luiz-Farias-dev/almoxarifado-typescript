import express from "express";

//import { createInsumo, getAllInsumos, getInsumoById } from '../controllers/insumo.js';
// import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post("/insumos");

router.get("/insumos");

router.get("/insumos/:id");

export default router;
