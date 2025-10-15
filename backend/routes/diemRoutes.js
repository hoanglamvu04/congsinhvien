import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { 
  getDiemBySinhVien, 
  upsertDiem, 
  getAllDiem, 
  deleteDiem 
} from "../controllers/diemController.js";

const router = express.Router();

// 📘 Sinh viên xem điểm cá nhân
router.get("/", verifyToken, getDiemBySinhVien);

// 📘 Admin xem toàn bộ điểm
router.get("/all", verifyToken, isAdmin, getAllDiem);

// ➕ Admin thêm hoặc cập nhật điểm
router.post("/", verifyToken, isAdmin, upsertDiem);

// 🗑️ Admin xoá điểm
router.delete("/:id_diem", verifyToken, isAdmin, deleteDiem);

export default router;
