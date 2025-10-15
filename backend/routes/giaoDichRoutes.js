import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllGiaoDich,
  createGiaoDich,
  updateTrangThaiGiaoDich,
  deleteGiaoDich,
} from "../controllers/giaoDichController.js";

const router = express.Router();

// 📘 Lấy danh sách giao dịch (admin/sinh viên)
router.get("/", verifyToken, getAllGiaoDich);

// ➕ Tạo giao dịch mới
router.post("/", verifyToken, createGiaoDich);

// ✏️ Cập nhật trạng thái (Admin)
router.put("/", verifyToken, isAdmin, updateTrangThaiGiaoDich);

// 🗑️ Xóa giao dịch (Admin)
router.delete("/:id_giao_dich", verifyToken, isAdmin, deleteGiaoDich);

export default router;
