import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, filterByDepartment } from "../middleware/roleCheck.js";
import {
  createThongBao,
  getThongBaoByUser,
  getAllThongBao,
  getThongBaoTheoKhoa,
  createThongBaoGiangVien,
  deleteThongBao,
} from "../controllers/thongBaoController.js";

const router = express.Router();

// 📩 Sinh viên xem thông báo
router.get("/me", verifyToken, getThongBaoByUser);

// 🧭 Khoa hoặc Phòng đào tạo xem thông báo theo khoa
router.get("/theo-khoa", verifyToken, filterByDepartment, getThongBaoTheoKhoa);

// 🧾 Admin xem toàn bộ
router.get("/", verifyToken, isAdmin, getAllThongBao);

// ➕ Tạo thông báo (Admin / PDT / Khoa)
router.post("/", verifyToken, filterByDepartment, createThongBao);

// 👨‍🏫 Giảng viên gửi cho lớp học phần
router.post("/giangvien", verifyToken, createThongBaoGiangVien);

// 🗑️ Xóa thông báo
router.delete("/:id_thong_bao", verifyToken, deleteThongBao);

export default router;
