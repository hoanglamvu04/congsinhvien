import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllKyLuat,
  createKyLuat,
  updateKyLuat,
  deleteKyLuat,
} from "../controllers/kyLuatController.js";

const router = express.Router();

// 📘 Lấy danh sách (Admin hoặc SV)
router.get("/", verifyToken, getAllKyLuat);

// ➕ Thêm (Admin)
router.post("/", verifyToken, isAdmin, createKyLuat);

// ✏️ Cập nhật (Admin)
router.put("/:id_ky_luat", verifyToken, isAdmin, updateKyLuat);

// 🗑️ Xóa (Admin)
router.delete("/:id_ky_luat", verifyToken, isAdmin, deleteKyLuat);

export default router;
