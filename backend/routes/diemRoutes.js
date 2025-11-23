import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isGiangVien, isPDTOrAdmin, filterByDepartment } from "../middleware/roleCheck.js";
import {
  getMyDiem,
  getMyDiemSummary,
  getDiemByGiangVien,
  updateDiemByGiangVien,
  getAllDiem,
  upsertDiem,
  deleteDiem,
  addLanThi,
  getLanThiByDiem,
  getDiemChiTiet,
  upsertDiemChiTiet,
  deleteDiemChiTiet,
  getDiemBySinhVien,
  getDiemTheoKhoa
} from "../controllers/diemController.js";

const router = express.Router();

// 🎓 Sinh viên
router.get("/me", verifyToken, getMyDiem);
router.get("/me/summary", verifyToken, getMyDiemSummary);

// 🧑‍🏫 Giảng viên
router.get("/giangvien", verifyToken, isGiangVien, getDiemByGiangVien);
router.post("/giangvien", verifyToken, isGiangVien, updateDiemByGiangVien);
router.get("/theo-khoa", verifyToken, filterByDepartment, getDiemTheoKhoa);

// 📘 Thi lại (Admin hoặc Phòng đào tạo)
router.post("/lan-thi/add", verifyToken, filterByDepartment, addLanThi);
router.get("/lan-thi/:id_diem", verifyToken, filterByDepartment, getLanThiByDiem);

// 📋 Admin + Phòng đào tạo
router.get("/all", verifyToken, isPDTOrAdmin, getAllDiem);
router.get("/sinhvien/:id", verifyToken, isPDTOrAdmin, getDiemBySinhVien);
router.post("/", verifyToken, isPDTOrAdmin, upsertDiem);
router.delete("/:id_diem", verifyToken, isPDTOrAdmin, deleteDiem);

// 📄 Chi tiết điểm
router.get("/chi-tiet/:id_diem", verifyToken, getDiemChiTiet);
router.post("/chi-tiet", verifyToken, isPDTOrAdmin, upsertDiemChiTiet);
router.delete("/chi-tiet/:id_ct", verifyToken, isPDTOrAdmin, deleteDiemChiTiet);

export default router;
