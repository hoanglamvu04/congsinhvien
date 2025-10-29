import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  guiTinNhan,
  getHoiThoai,
  getAllTinNhan,
  getTinNhanCaNhan,
  danhDauDaDoc,
  deleteTinNhan,
  getThongKeTinNhan
} from "../controllers/tinNhanController.js";

const router = express.Router();

// 📨 Gửi tin nhắn
router.post("/", verifyToken, guiTinNhan);

// 📊 Thống kê & Admin (route tĩnh trước)
router.get("/thongke", verifyToken, getThongKeTinNhan);
router.get("/", verifyToken, isAdmin, getAllTinNhan);
router.delete("/:id_tin_nhan", verifyToken, isAdmin, deleteTinNhan);

// 📬 Lấy tin nhắn cá nhân (phải nằm TRƯỚC route động)
router.get("/my", verifyToken, getTinNhanCaNhan);

// ✅ Đánh dấu đã đọc
router.put("/danhdau/:nguoi_nhan", verifyToken, danhDauDaDoc);

// 💬 Lấy hội thoại cụ thể (đặt CUỐI CÙNG)
router.get("/:nguoi_nhan", verifyToken, getHoiThoai);

export default router;
