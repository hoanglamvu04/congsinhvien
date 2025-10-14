import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { traLoiKhaoSat, getKetQuaKhaoSat } from "../controllers/phieuTraLoiController.js";

const router = express.Router();

// 📘 Sinh viên gửi phản hồi khảo sát
router.post("/", verifyToken, traLoiKhaoSat);

// 📘 Admin xem kết quả khảo sát
router.get("/:id_khao_sat", verifyToken, isAdmin, getKetQuaKhaoSat);

export default router;
