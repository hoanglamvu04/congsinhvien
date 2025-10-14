import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllKhoa,
  createKhoa,
  updateKhoa,
  deleteKhoa,
} from "../controllers/khoaController.js";

const router = express.Router();

router.get("/", verifyToken, getAllKhoa);
router.post("/", verifyToken, isAdmin, createKhoa);
router.put("/:ma_khoa", verifyToken, isAdmin, updateKhoa);
router.delete("/:ma_khoa", verifyToken, isAdmin, deleteKhoa);

export default router;
