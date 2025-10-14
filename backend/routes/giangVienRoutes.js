import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllGiangVien,
  createGiangVien,
  updateGiangVien,
  deleteGiangVien,
} from "../controllers/giangVienController.js";

const router = express.Router();

router.get("/", verifyToken, getAllGiangVien);
router.post("/", verifyToken, isAdmin, createGiangVien);
router.put("/:ma_giang_vien", verifyToken, isAdmin, updateGiangVien);
router.delete("/:ma_giang_vien", verifyToken, isAdmin, deleteGiangVien);

export default router;
