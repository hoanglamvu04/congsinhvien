import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isGiangVien, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  createThongBao,
  getThongBaoByUser,
  getAllThongBao,
  createThongBaoGiangVien,
} from "../controllers/thongBaoController.js";

const router = express.Router();

router.get("/", verifyToken, getThongBaoByUser);
router.get("/all", verifyToken, isPDTOrAdmin, getAllThongBao);
router.post("/", verifyToken, isPDTOrAdmin, createThongBao);
router.post("/giangvien", verifyToken, isGiangVien, createThongBaoGiangVien);

export default router;
