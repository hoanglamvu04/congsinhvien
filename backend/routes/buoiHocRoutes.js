import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getBuoiHocByLopHp } from "../controllers/buoiHocController.js";

const router = express.Router();
router.get("/:ma_lop_hp", verifyToken, getBuoiHocByLopHp);
export default router;
