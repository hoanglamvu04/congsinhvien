import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, filterByDepartment } from "../middleware/roleCheck.js";
import {
  getAllKhaoSat,
  getKhaoSatTheoKhoa,
  createKhaoSat,
  updateKhaoSat,
  deleteKhaoSat,
} from "../controllers/khaoSatController.js";

const router = express.Router();

router.get("/", verifyToken, getAllKhaoSat);
router.get("/theo-khoa", verifyToken, filterByDepartment, getKhaoSatTheoKhoa);
router.post("/", verifyToken, createKhaoSat);
router.put("/:id_khao_sat", verifyToken, updateKhaoSat);
router.delete("/:id_khao_sat", verifyToken, deleteKhaoSat);

export default router;
