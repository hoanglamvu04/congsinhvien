import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllKhoa,
  getKhoaById,
  createKhoa,
  updateKhoa,
  deleteKhoa,
} from "../controllers/khoaController.js";

const router = express.Router();

// ✅ Public cho người dùng có token
router.get("/", verifyToken, getAllKhoa);
router.get("/:ma_khoa", verifyToken, getKhoaById);

// ✅ CRUD chỉ Admin
router.post("/", verifyToken, isAdmin, createKhoa);
router.put("/:ma_khoa", verifyToken, isAdmin, updateKhoa);
router.delete("/:ma_khoa", verifyToken, isAdmin, deleteKhoa);

export default router;
