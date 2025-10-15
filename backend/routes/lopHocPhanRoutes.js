import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllLopHocPhan,
  createLopHocPhan,
  updateLopHocPhan,
  deleteLopHocPhan,
} from "../controllers/lopHocPhanController.js";

const router = express.Router();

router.get("/", verifyToken, getAllLopHocPhan);
router.post("/", verifyToken, isAdmin, createLopHocPhan);
router.put("/:ma_lop_hp", verifyToken, isAdmin, updateLopHocPhan);
router.delete("/:ma_lop_hp", verifyToken, isAdmin, deleteLopHocPhan);

export default router;
