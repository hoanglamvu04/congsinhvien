import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllMonHoc,
  getMonHocTheoKhoa,
  createMonHoc,
  updateMonHoc,
  deleteMonHoc,
} from "../controllers/monHocController.js";

const router = express.Router();

// 📘 Danh sách toàn bộ môn học (Admin, PĐT)
router.get("/", verifyToken, getAllMonHoc);

// 📘 Danh sách môn học theo khoa (lọc theo người đăng nhập)
router.get("/theo-khoa", verifyToken, getMonHocTheoKhoa);

// ➕ Thêm, sửa, xóa môn học (Admin)
router.post("/", verifyToken, isAdmin, createMonHoc);
router.put("/:ma_mon", verifyToken, isAdmin, updateMonHoc);
router.delete("/:ma_mon", verifyToken, isAdmin, deleteMonHoc);

export default router;
