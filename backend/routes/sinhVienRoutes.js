import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { uploadSinhVien } from "../middleware/uploadSinhVien.js";
import {
  getAllSinhVien,
  createSinhVien,
  updateSinhVien,
  deleteSinhVien,
  getSinhVienByToken,
    getSinhVienByUsername, 
} from "../controllers/sinhVienController.js";

const router = express.Router();

// 📘 Lấy toàn bộ sinh viên (Admin, Giảng viên)
router.get("/", verifyToken, getAllSinhVien);

// 📘 Lấy thông tin sinh viên theo token đăng nhập
router.get("/me", verifyToken, getSinhVienByToken);
router.get("/by-username/:username", verifyToken, getSinhVienByUsername); 
// ➕ Thêm sinh viên (Admin, có upload ảnh)
router.post("/", verifyToken, isAdmin, uploadSinhVien.single("hinh_anh"), createSinhVien);

// ✏️ Cập nhật sinh viên (Admin, có upload ảnh)
router.put("/:ma_sinh_vien", verifyToken, isAdmin, uploadSinhVien.single("hinh_anh"), updateSinhVien);

// 🗑️ Xóa sinh viên + thư mục ảnh liên quan
router.delete("/:ma_sinh_vien", verifyToken, isAdmin, deleteSinhVien);

export default router;
