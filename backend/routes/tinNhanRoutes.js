import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { guiTinNhan, getTinNhan } from "../controllers/tinNhanController.js";

const router = express.Router();

// 📘 Gửi tin nhắn giữa các người dùng
router.post("/", verifyToken, guiTinNhan);

// 📘 Lấy lịch sử hội thoại giữa 2 người
router.get("/:nguoi_nhan", verifyToken, getTinNhan);

export default router;
