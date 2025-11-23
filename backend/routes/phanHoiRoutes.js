import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, filterByDepartment } from "../middleware/roleCheck.js";
import {
  guiPhanHoi,
  traLoiPhanHoi,
  getAllPhanHoi,
  getPhanHoiTheoKhoa,
  getPhanHoiBySinhVien,
  createPhanHoiAdmin,
  updatePhanHoiAdmin,
  deletePhanHoi,
  getThongKePhanHoi,
} from "../controllers/phanHoiController.js";

const router = express.Router();

// 📩 Sinh viên gửi phản hồi
router.post("/", verifyToken, guiPhanHoi);

// 💬 Bộ phận trả lời phản hồi (Khoa / PĐT / Admin)
router.put("/traloi", verifyToken, filterByDepartment, traLoiPhanHoi);

// 📋 Lấy toàn bộ phản hồi (Admin / PĐT)
router.get("/", verifyToken, getAllPhanHoi);

// 📋 Lấy phản hồi theo khoa (lọc tự động)
router.get("/theo-khoa", verifyToken, filterByDepartment, getPhanHoiTheoKhoa);

// 📋 Lấy phản hồi của sinh viên đang đăng nhập
router.get("/sinhvien", verifyToken, getPhanHoiBySinhVien);

// ➕ Thêm phản hồi thủ công (Admin)
router.post("/admin", verifyToken, isAdmin, createPhanHoiAdmin);

// ✏️ Cập nhật phản hồi (Admin)
router.put("/:id_phan_hoi", verifyToken, isAdmin, updatePhanHoiAdmin);

// 🗑️ Xóa phản hồi (Admin)
router.delete("/:id_phan_hoi", verifyToken, isAdmin, deletePhanHoi);

// 📊 Thống kê phản hồi (Admin)
router.get("/thongke", verifyToken, isAdmin, getThongKePhanHoi);

export default router;
