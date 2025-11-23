import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllLopHocPhan,
  getLopHocPhanTheoKhoa,
  getLopHocPhanByGiangVien,
  getChiTietLopHocPhan,
  createLopHocPhan,
  updateLopHocPhan,
  deleteLopHocPhan,
} from "../controllers/lopHocPhanController.js";

const router = express.Router();

// 📘 Danh sách toàn bộ lớp học phần (Admin, Phòng ĐT)
router.get("/", verifyToken, getAllLopHocPhan);

// 📘 Danh sách lớp học phần theo khoa (lọc theo người đăng nhập)
router.get("/theo-khoa", verifyToken, getLopHocPhanTheoKhoa);

// 📘 Giảng viên xem lớp học phần của mình
router.get("/by-giangvien", verifyToken, getLopHocPhanByGiangVien);

// 📘 Chi tiết lớp học phần
router.get("/:ma_lop_hp", verifyToken, getChiTietLopHocPhan);

// ➕ CRUD (Admin)
router.post("/", verifyToken, isAdmin, createLopHocPhan);
router.put("/:ma_lop_hp", verifyToken, isAdmin, updateLopHocPhan);
router.delete("/:ma_lop_hp", verifyToken, isAdmin, deleteLopHocPhan);

export default router;
