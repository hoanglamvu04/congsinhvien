import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { createThongBao, getThongBaoByUser } from "../controllers/thongBaoController.js";

const router = express.Router();

// 📘 Admin tạo thông báo
router.post("/", verifyToken, isAdmin, createThongBao);

// 📘 Người dùng (SV / GV) xem thông báo dành cho họ
router.get("/", verifyToken, getThongBaoByUser);

export default router;
