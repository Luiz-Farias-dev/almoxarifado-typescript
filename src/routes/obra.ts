import express from "express";
// import obrasController from '../controllers/workController.js';
// import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Endpoints para Obras (Works)
router.post("/obra");
router.get("/obra");
router.get("/obra/:obraId");

export default router;
