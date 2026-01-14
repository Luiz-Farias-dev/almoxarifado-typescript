import express from "express";
import { signUp, login } from "../controllers/auth";

const router = express.Router();

//Rorta de Signup
router.post("/signup", signUp);

//Rota de Login
router.post("/login", login);

export default router;
