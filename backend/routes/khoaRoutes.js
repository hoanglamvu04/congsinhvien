import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllKhoa,
  getKhoaById,
  createKhoa,
  updateKhoa,
  deleteKhoa,
  getLopTheoKhoa,
} from "../controllers/khoaController.js";

const router = express.Router();

router.get("/", verifyToken, getAllKhoa);
router.get("/lop/:ma_khoa", verifyToken, getLopTheoKhoa);
router.get("/:ma_khoa", verifyToken, getKhoaById);
router.post("/", verifyToken, isAdmin, createKhoa);
router.put("/:ma_khoa", verifyToken, isAdmin, updateKhoa);
router.delete("/:ma_khoa", verifyToken, isAdmin, deleteKhoa);

export default router;
