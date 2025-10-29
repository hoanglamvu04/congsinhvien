import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getMonDaDangKy,
  dangKyMon,
  huyDangKy,
  getAllDangKy,
  getSinhVienByLopHocPhan,
} from "../controllers/dangKyMonController.js";

const router = express.Router();

router.get("/", verifyToken, getMonDaDangKy);
router.get("/all", verifyToken, isPDTOrAdmin, getAllDangKy);
router.get("/lop/:ma_lop_hp", verifyToken, isPDTOrAdmin, getSinhVienByLopHocPhan);
router.post("/", verifyToken, dangKyMon);
router.put("/huy/:ma_lop_hp", verifyToken, huyDangKy);

export default router;
