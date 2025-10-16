import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  guiTinNhan,
  getHoiThoai,
  getAllTinNhan,
  getTinNhanCaNhan, // 👈 thêm mới
  danhDauDaDoc,
  deleteTinNhan,
  getThongKeTinNhan,
} from "../controllers/tinNhanController.js";

const router = express.Router();

// 📩 Gửi tin nhắn
router.post("/", verifyToken, guiTinNhan);

// 👤 Sinh viên xem tất cả tin nhắn liên quan đến mình
router.get("/my", verifyToken, getTinNhanCaNhan);

// 🧾 Admin xem tất cả
router.get("/", verifyToken, isAdmin, getAllTinNhan);

// 📊 Thống kê (admin)
router.get("/thongke", verifyToken, getThongKeTinNhan);

// 💬 Lấy hội thoại cụ thể
router.get("/:nguoi_nhan", verifyToken, getHoiThoai);

// ✅ Đánh dấu đã đọc
router.put("/danhdau/:nguoi_nhan", verifyToken, danhDauDaDoc);

// 🗑️ Xóa tin nhắn
router.delete("/:id_tin_nhan", verifyToken, isAdmin, deleteTinNhan);

export default router;
