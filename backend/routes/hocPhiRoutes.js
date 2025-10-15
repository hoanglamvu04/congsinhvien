import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllHocPhi,
  createHocPhi,
  updateHocPhi,
  deleteHocPhi,
} from "../controllers/hocPhiController.js";

const router = express.Router();

// 📘 Lấy danh sách học phí (admin/sinh viên)
router.get("/", verifyToken, getAllHocPhi);

// ➕ Thêm học phí (Admin)
router.post("/", verifyToken, isAdmin, createHocPhi);

// ✏️ Cập nhật học phí (Admin)
router.put("/:ma_sinh_vien/:ma_hoc_ky", verifyToken, isAdmin, updateHocPhi);

// 🗑️ Xóa học phí (Admin)
router.delete("/:ma_sinh_vien/:ma_hoc_ky", verifyToken, isAdmin, deleteHocPhi);

export default router;
