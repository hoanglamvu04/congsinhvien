import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getThiLaiBySinhVien, createThiLai } from "../controllers/thiLaiController.js";

const router = express.Router();

router.get("/", verifyToken, getThiLaiBySinhVien);
router.post("/", verifyToken, isAdmin, createThiLai);

export default router;
