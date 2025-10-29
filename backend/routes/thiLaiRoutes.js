import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllThiLai,
  getThiLaiBySinhVien,
  createThiLai,
  autoDetectThiLai,
  updateThiLai,
  deleteThiLai,
} from "../controllers/thiLaiController.js";

const router = express.Router();

// 🧭 Admin & Phòng Đào Tạo thao tác chính
router.get("/all", verifyToken, isPDTOrAdmin, getAllThiLai);
router.post("/add", verifyToken, isPDTOrAdmin, createThiLai);
router.post("/auto", verifyToken, isPDTOrAdmin, autoDetectThiLai);
router.put("/:id_thi_lai", verifyToken, isPDTOrAdmin, updateThiLai);
router.delete("/:id_thi_lai", verifyToken, isPDTOrAdmin, deleteThiLai);

// 🎓 Sinh viên xem kết quả thi lại của mình
router.get("/me", verifyToken, getThiLaiBySinhVien);

export default router;
