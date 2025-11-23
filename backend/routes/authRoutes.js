import express from "express";
import { login, register, logout, getCurrentUser, refreshToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.post("/refresh", refreshToken);

export default router;
