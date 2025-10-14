import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { guiPhanHoi, traLoiPhanHoi } from "../controllers/phanHoiController.js";

const router = express.Router();

// 📘 Sinh viên gửi phản hồi
router.post("/", verifyToken, guiPhanHoi);

// 📘 Giảng viên hoặc admin trả lời phản hồi
router.put("/", verifyToken, isAdmin, traLoiPhanHoi);

export default router;
