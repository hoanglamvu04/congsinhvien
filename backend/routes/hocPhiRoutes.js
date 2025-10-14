import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getHocPhiBySinhVien, upsertHocPhi } from "../controllers/hocPhiController.js";

const router = express.Router();

router.get("/", verifyToken, getHocPhiBySinhVien);
router.post("/", verifyToken, isAdmin, upsertHocPhi);

export default router;
