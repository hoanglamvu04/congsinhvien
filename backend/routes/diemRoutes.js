import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isGiangVien, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getMyDiem,
  getMyDiemSummary,
  getDiemByGiangVien,
  updateDiemByGiangVien,
  getAllDiem,
  upsertDiem,
  deleteDiem,
  getDiemChiTiet,
  upsertDiemChiTiet,
  deleteDiemChiTiet
} from "../controllers/diemController.js";

const router = express.Router();

// 🎓 Sinh viên
router.get("/me", verifyToken, getMyDiem);
router.get("/me/summary", verifyToken, getMyDiemSummary);

// 🧑‍🏫 Giảng viên
router.get("/giangvien", verifyToken, isGiangVien, getDiemByGiangVien);
router.post("/giangvien", verifyToken, isGiangVien, updateDiemByGiangVien);

// 📋 Admin + Phòng đào tạo
router.get("/all", verifyToken, isPDTOrAdmin, getAllDiem);
router.post("/", verifyToken, isPDTOrAdmin, upsertDiem);
router.delete("/:id_diem", verifyToken, isPDTOrAdmin, deleteDiem);

// 📘 Chi tiết điểm
router.get("/chi-tiet/:id_diem", verifyToken, isPDTOrAdmin, getDiemChiTiet);
router.post("/chi-tiet", verifyToken, isPDTOrAdmin, upsertDiemChiTiet);
router.delete("/chi-tiet/:id_ct", verifyToken, isPDTOrAdmin, deleteDiemChiTiet);

export default router;
