import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllDiemRenLuyen,
  getDiemRenLuyen,
  upsertDiemRenLuyen,
  deleteDiemRenLuyen,
  getDiemRenLuyenBySinhVien,
} from "../controllers/diemRenLuyenController.js";

const router = express.Router();

router.get("/", verifyToken, getDiemRenLuyen);
router.get("/sinhvien/:id", verifyToken, getDiemRenLuyenBySinhVien);
router.get("/all", verifyToken, isPDTOrAdmin, getAllDiemRenLuyen);
router.post("/", verifyToken, isPDTOrAdmin, upsertDiemRenLuyen);
router.delete("/:id_drl", verifyToken, isPDTOrAdmin, deleteDiemRenLuyen);

export default router;
