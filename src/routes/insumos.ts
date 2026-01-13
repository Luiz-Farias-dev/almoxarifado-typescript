import express from "express";

import {
  uploadInsumos,
  createInsumo,
  getAllInsumos,
} from "../controllers/insumos.js";
// import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post("/insumos", uploadInsumos);

router.post("/insumo", createInsumo);

router.get("/insumos", getAllInsumos);

export default router;
