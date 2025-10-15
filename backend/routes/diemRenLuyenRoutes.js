import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllDiemRenLuyen,
  getDiemRenLuyen,
  upsertDiemRenLuyen,
  deleteDiemRenLuyen,
} from "../controllers/diemRenLuyenController.js";

const router = express.Router();

// Sinh viên xem của mình
router.get("/", verifyToken, getDiemRenLuyen);

// Admin xem tất cả
router.get("/all", verifyToken, isAdmin, getAllDiemRenLuyen);

// Thêm hoặc cập nhật
router.post("/", verifyToken, isAdmin, upsertDiemRenLuyen);

// Xóa
router.delete("/:id_drl", verifyToken, isAdmin, deleteDiemRenLuyen);

export default router;
