import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isGiangVien, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllLopHocPhan,
  getLopHocPhanByGiangVien,
  getChiTietLopHocPhan,
  createLopHocPhan,
  updateLopHocPhan,
  deleteLopHocPhan,
} from "../controllers/lopHocPhanController.js";

const router = express.Router();

router.get("/", verifyToken, getAllLopHocPhan);
router.get("/giangvien", verifyToken, isGiangVien, getLopHocPhanByGiangVien);
router.get("/:ma_lop_hp", verifyToken, getChiTietLopHocPhan);
router.get("/giangvien/:ma_lop_hp", verifyToken, isGiangVien, getChiTietLopHocPhan);
router.post("/", verifyToken, isPDTOrAdmin, createLopHocPhan);
router.put("/:ma_lop_hp", verifyToken, isPDTOrAdmin, updateLopHocPhan);
router.delete("/:ma_lop_hp", verifyToken, isPDTOrAdmin, deleteLopHocPhan);

export default router;
