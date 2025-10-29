import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllMonHoc,
  createMonHoc,
  updateMonHoc,
  deleteMonHoc,
} from "../controllers/monHocController.js";

const router = express.Router();

/* -------- MÔN HỌC -------- */
router.get("/", verifyToken, getAllMonHoc); // Ai có token đều xem được danh sách
router.post("/", verifyToken, isPDTOrAdmin, createMonHoc);
router.put("/:ma_mon", verifyToken, isPDTOrAdmin, updateMonHoc);
router.delete("/:ma_mon", verifyToken, isPDTOrAdmin, deleteMonHoc);

export default router;
