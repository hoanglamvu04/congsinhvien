import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isSinhVien, isGiangVien, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllTkb,
  getTkbBySinhVien,
  getTkbByGiangVien,
  createTkb,
  updateTkb,
  deleteTkb,
  regenerateBuoiHoc,
} from "../controllers/thoiKhoaBieuController.js";

const router = express.Router();

// 🧭 Admin & Phòng Đào Tạo quản lý tất cả
router.get("/", verifyToken, isPDTOrAdmin, getAllTkb);
router.post("/", verifyToken, isPDTOrAdmin, createTkb);
router.post("/regenerate/:id_tkb", verifyToken, isPDTOrAdmin, regenerateBuoiHoc);
router.put("/:id_tkb", verifyToken, isPDTOrAdmin, updateTkb);
router.delete("/:id_tkb", verifyToken, isPDTOrAdmin, deleteTkb);

// 🧭 Sinh viên & Giảng viên xem riêng thời khóa biểu cá nhân
router.get("/sinhvien", verifyToken, isSinhVien, getTkbBySinhVien);
router.get("/giangvien", verifyToken, isGiangVien, getTkbByGiangVien);

export default router;
