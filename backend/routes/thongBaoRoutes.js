import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  createThongBao,
  getThongBaoByUser,
  getAllThongBao,
} from "../controllers/thongBaoController.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, createThongBao);
router.get("/", verifyToken, getThongBaoByUser);
router.get("/all", verifyToken, isAdmin, getAllThongBao);
export default router;
