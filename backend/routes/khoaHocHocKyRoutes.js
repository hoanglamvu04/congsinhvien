import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllKhoaHoc,
  createKhoaHoc,
  updateKhoaHoc,
  deleteKhoaHoc,
  getAllHocKy,
  createHocKy,
  updateHocKy,
  deleteHocKy,
} from "../controllers/khoaHocHocKyController.js";

const router = express.Router();

/* -------- KHÓA HỌC -------- */
router.get("/khoahoc", verifyToken, getAllKhoaHoc);
router.post("/khoahoc", verifyToken, isPDTOrAdmin, createKhoaHoc);
router.put("/khoahoc/:ma_khoa_hoc", verifyToken, isPDTOrAdmin, updateKhoaHoc);
router.delete("/khoahoc/:ma_khoa_hoc", verifyToken, isPDTOrAdmin, deleteKhoaHoc);

/* -------- HỌC KỲ -------- */
router.get("/hocky", verifyToken, getAllHocKy);
router.post("/hocky", verifyToken, isPDTOrAdmin, createHocKy);
router.put("/hocky/:ma_hoc_ky", verifyToken, isPDTOrAdmin, updateHocKy);
router.delete("/hocky/:ma_hoc_ky", verifyToken, isPDTOrAdmin, deleteHocKy);

export default router;
