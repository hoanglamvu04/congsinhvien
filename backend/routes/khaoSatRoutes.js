import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllKhaoSat,
  createKhaoSat,
  updateKhaoSat,
  deleteKhaoSat,
} from "../controllers/khaoSatController.js";

const router = express.Router();

// 📘 Lấy danh sách (Admin / Giảng viên / Sinh viên)
router.get("/", verifyToken, getAllKhaoSat);

// ➕ Tạo khảo sát (Admin / Giảng viên)
router.post("/", verifyToken, createKhaoSat);

// ✏️ Cập nhật khảo sát (Admin)
router.put("/:id_khao_sat", verifyToken, isAdmin, updateKhaoSat);

// 🗑️ Xóa khảo sát (Admin)
router.delete("/:id_khao_sat", verifyToken, isAdmin, deleteKhaoSat);

export default router;
