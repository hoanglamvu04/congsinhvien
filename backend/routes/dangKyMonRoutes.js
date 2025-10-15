import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getMonDaDangKy,
  dangKyMon,
  huyDangKy,
  getAllDangKy,
} from "../controllers/dangKyMonController.js";

const router = express.Router();

router.get("/", verifyToken, getMonDaDangKy);
router.get("/all", verifyToken, isAdmin, getAllDangKy);
router.post("/", verifyToken, dangKyMon);
router.put("/huy/:ma_lop_hp", verifyToken, huyDangKy);


export default router;
