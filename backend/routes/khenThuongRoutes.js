import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllKhenThuong,
  createKhenThuong,
  updateKhenThuong,
  deleteKhenThuong,
} from "../controllers/khenThuongController.js";

const router = express.Router();

// 📘 Lấy danh sách (admin hoặc sinh viên)
router.get("/", verifyToken, getAllKhenThuong);

// ➕ Thêm (admin)
router.post("/", verifyToken, isAdmin, createKhenThuong);

// ✏️ Cập nhật (admin)
router.put("/:id_khen_thuong", verifyToken, isAdmin, updateKhenThuong);

// 🗑️ Xóa (admin)
router.delete("/:id_khen_thuong", verifyToken, isAdmin, deleteKhenThuong);

export default router;
