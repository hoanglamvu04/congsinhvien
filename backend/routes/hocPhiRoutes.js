import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllHocPhi,
  createHocPhi,
  updateHocPhi,
  deleteHocPhi,
  getHocPhiBySinhVien,
} from "../controllers/hocPhiController.js";

const router = express.Router();

router.get("/", verifyToken, getAllHocPhi);
router.get("/me", verifyToken, getHocPhiBySinhVien);
router.post("/", verifyToken, isAdmin, createHocPhi);
router.put("/:ma_sinh_vien/:ma_hoc_ky", verifyToken, isAdmin, updateHocPhi);
router.delete("/:ma_sinh_vien/:ma_hoc_ky", verifyToken, isAdmin, deleteHocPhi);

export default router;
