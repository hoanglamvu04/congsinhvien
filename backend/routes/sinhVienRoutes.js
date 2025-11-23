import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, filterByDepartment } from "../middleware/roleCheck.js";
import { uploadSinhVien } from "../middleware/uploadSinhVien.js";
import {
  getAllSinhVien,
  createSinhVien,
  updateSinhVien,
  deleteSinhVien,
  getSinhVienByToken,
  getSinhVienByUsername,
  getSinhVienById,
  getSinhVienByLop,
  getSinhVienTheoKhoa, // ✅ mới thêm
} from "../controllers/sinhVienController.js";

const router = express.Router();

// 📘 Lấy toàn bộ sinh viên (Admin, Giảng viên)
router.get("/", verifyToken, getAllSinhVien);

// 📘 Lấy sinh viên theo khoa (lọc tự động theo phòng ban / khoa)
router.get("/theo-khoa", verifyToken, filterByDepartment, getSinhVienTheoKhoa); // ✅ mới thêm

// 📘 Lấy thông tin sinh viên theo token đăng nhập
router.get("/me", verifyToken, getSinhVienByToken);

// 📘 Lấy sinh viên theo tên đăng nhập (cho chat)
router.get("/by-username/:username", verifyToken, getSinhVienByUsername);

// 📘 Lấy sinh viên theo lớp
router.get("/by-lop/:ma_lop", verifyToken, getSinhVienByLop);

// 📘 Lấy chi tiết sinh viên (chỉ Admin)
router.get("/:id", verifyToken, isAdmin, getSinhVienById);

// ➕ Thêm sinh viên (Admin, có upload ảnh)
router.post("/", verifyToken, isAdmin, uploadSinhVien.single("hinh_anh"), createSinhVien);

// ✏️ Cập nhật sinh viên (Admin, có upload ảnh)
router.put("/:ma_sinh_vien", verifyToken, isAdmin, uploadSinhVien.single("hinh_anh"), updateSinhVien);

// 🗑️ Xóa sinh viên + thư mục ảnh liên quan
router.delete("/:ma_sinh_vien", verifyToken, isAdmin, deleteSinhVien);

export default router;
