import express from "express";

const router = express.Router();

router.post("/lista-espera");

router.get("/lista-espera");

router.delete("/lista-espera/:id");

export default router;
