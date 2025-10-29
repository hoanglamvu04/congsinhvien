import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isGiangVien } from "../middleware/roleCheck.js";
import {
  getAllGiangVien,
  createGiangVien,
  updateGiangVien,
  deleteGiangVien,
  getThongTinCaNhan,
  updateThongTinCaNhan,
} from "../controllers/giangVienController.js";

const router = express.Router();

// 🧑‍🏫 Giảng viên xem và sửa thông tin cá nhân
router.get("/me", verifyToken, isGiangVien, getThongTinCaNhan);
router.put("/me", verifyToken, isGiangVien, updateThongTinCaNhan);

// 🛠️ Admin CRUD
router.get("/", verifyToken, getAllGiangVien);
router.post("/", verifyToken, isAdmin, createGiangVien);
router.put("/:ma_giang_vien", verifyToken, isAdmin, updateGiangVien);
router.delete("/:ma_giang_vien", verifyToken, isAdmin, deleteGiangVien);

export default router;
