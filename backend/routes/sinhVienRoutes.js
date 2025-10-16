import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllSinhVien,
  createSinhVien,
  updateSinhVien,
  deleteSinhVien,
  getSinhVienByToken,
} from "../controllers/sinhVienController.js";

const router = express.Router();

router.get("/", verifyToken, getAllSinhVien);
router.get("/me", verifyToken, getSinhVienByToken);
router.post("/", verifyToken, isAdmin, createSinhVien);
router.put("/:ma_sinh_vien", verifyToken, isAdmin, updateSinhVien);
router.delete("/:ma_sinh_vien", verifyToken, isAdmin, deleteSinhVien);

export default router;
