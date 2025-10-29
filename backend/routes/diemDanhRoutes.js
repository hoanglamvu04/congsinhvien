import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isGiangVien } from "../middleware/roleCheck.js";
import {
  getDiemDanhByLopHp,
  getDiemDanhByBuoi,
  upsertDiemDanh,
  deleteDiemDanh,
  getThongKeChuyenCan,
} from "../controllers/diemDanhController.js";

const router = express.Router();

// 📘 Lấy danh sách điểm danh của 1 lớp học phần
router.get("/lop/:ma_lop_hp", verifyToken, getDiemDanhByLopHp);

// 📘 Lấy danh sách điểm danh của 1 buổi học
router.get("/buoi/:id_tkb", verifyToken, getDiemDanhByBuoi);

// ➕ Giảng viên cập nhật / thêm mới điểm danh
router.post("/", verifyToken, isGiangVien, upsertDiemDanh);

// 🗑️ Xóa điểm danh
router.delete("/:id_diem_danh", verifyToken, isAdmin, deleteDiemDanh);

// 📊 Thống kê chuyên cần lớp học phần
router.get("/thongke/:ma_lop_hp", verifyToken, getThongKeChuyenCan);

export default router;
    