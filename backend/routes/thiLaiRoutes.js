import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { 
  getThiLaiBySinhVien, 
  getAllThiLai, 
  createThiLai, 
  updateThiLai, 
  deleteThiLai 
} from "../controllers/thiLaiController.js";

const router = express.Router();

// 📘 Sinh viên xem danh sách thi lại của mình
router.get("/", verifyToken, getThiLaiBySinhVien);

// 📘 Admin xem toàn bộ danh sách thi lại
router.get("/all", verifyToken, isAdmin, getAllThiLai);

// ➕ Admin hoặc Giảng viên ghi điểm thi lại
router.post("/", verifyToken, isAdmin, createThiLai);

// ✏️ Cập nhật điểm thi lại
router.put("/:id_thi_lai", verifyToken, isAdmin, updateThiLai);

// 🗑️ Xóa bản ghi thi lại
router.delete("/:id_thi_lai", verifyToken, isAdmin, deleteThiLai);

export default router;
