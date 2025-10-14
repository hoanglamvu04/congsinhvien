import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getDiemBySinhVien, upsertDiem } from "../controllers/diemController.js";

const router = express.Router();

router.get("/", verifyToken, getDiemBySinhVien);
router.post("/", verifyToken, isAdmin, upsertDiem);

export default router;
