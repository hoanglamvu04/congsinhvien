import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllHocPhi,
  getHocPhiByHocKy,
  createHocPhi,
  updateHocPhi,
  deleteHocPhi,
  getThongKeHocPhi
} from "../controllers/hocPhiController.js";

const router = express.Router();

router.get("/", verifyToken, getAllHocPhi);
router.get("/thongke", verifyToken, isPDTOrAdmin, getThongKeHocPhi);
router.get("/:ma_hoc_ky", verifyToken, getHocPhiByHocKy);
router.post("/", verifyToken, isAdmin, createHocPhi);
router.put("/:id_hoc_phi", verifyToken, isAdmin, updateHocPhi);
router.delete("/:id_hoc_phi", verifyToken, isAdmin, deleteHocPhi);

export default router;
