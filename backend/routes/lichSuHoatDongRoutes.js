import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getAllLogs, getLogByUser } from "../controllers/lichSuHoatDongController.js";

const router = express.Router();

// 📘 Xem toàn bộ log (admin)
router.get("/", verifyToken, isAdmin, getAllLogs);

// 📘 Xem log theo tài khoản cụ thể
router.get("/:tai_khoan_thuc_hien", verifyToken, isAdmin, getLogByUser);

export default router;
