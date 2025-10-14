import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getMonDaDangKy,
  dangKyMon,
  huyDangKy,
} from "../controllers/dangKyMonController.js";

const router = express.Router();

router.get("/", verifyToken, getMonDaDangKy);
router.post("/", verifyToken, dangKyMon);
router.put("/huy/:ma_lop_hp", verifyToken, huyDangKy);

export default router;
