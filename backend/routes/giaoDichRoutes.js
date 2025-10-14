import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import { getGiaoDichBySinhVien, createGiaoDich, duyetGiaoDich } from "../controllers/giaoDichController.js";

const router = express.Router();

router.get("/", verifyToken, getGiaoDichBySinhVien);
router.post("/", verifyToken, createGiaoDich);
router.put("/duyet", verifyToken, isAdmin, duyetGiaoDich);

export default router;
