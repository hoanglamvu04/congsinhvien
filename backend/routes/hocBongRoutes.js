import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getHocBongBySinhVien, createHocBong } from "../controllers/hocBongController.js";

const router = express.Router();

router.get("/", verifyToken, getHocBongBySinhVien);
router.post("/", verifyToken, isAdmin, createHocBong);

export default router;
