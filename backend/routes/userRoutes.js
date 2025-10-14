import express from "express";
import { getStudentInfo } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/info", verifyToken, getStudentInfo);

export default router;
