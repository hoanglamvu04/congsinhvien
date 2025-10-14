import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getKhaoSat, createKhaoSat } from "../controllers/khaoSatController.js";

const router = express.Router();

// 📘 Lấy danh sách khảo sát (sinh viên / giảng viên / admin)
router.get("/", verifyToken, getKhaoSat);

// ➕ Tạo khảo sát mới (admin hoặc giảng viên)
router.post("/", verifyToken, isAdmin, createKhaoSat);

export default router;
