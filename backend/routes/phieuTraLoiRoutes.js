import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  traLoiKhaoSat,
  getKetQuaKhaoSat,
  getAllPhieuTraLoi,
  getThongKeKhaoSat,
  deletePhieuTraLoi,
  createPhieuTraLoiAdmin,
  updatePhieuTraLoiAdmin,
} from "../controllers/phieuTraLoiController.js";

const router = express.Router();

router.post("/", verifyToken, traLoiKhaoSat);
router.get("/ketqua/:id_khao_sat", verifyToken, isAdmin, getKetQuaKhaoSat);
router.get("/thongke", verifyToken, isAdmin, getThongKeKhaoSat);
router.get("/", verifyToken, isAdmin, getAllPhieuTraLoi);
router.post("/admin", verifyToken, isAdmin, createPhieuTraLoiAdmin);
router.put("/:id_tra_loi", verifyToken, isAdmin, updatePhieuTraLoiAdmin);
router.delete("/:id_tra_loi", verifyToken, isAdmin, deletePhieuTraLoi);

export default router;
