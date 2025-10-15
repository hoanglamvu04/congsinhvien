import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  guiPhanHoi,
  traLoiPhanHoi,
  getAllPhanHoi,
  getPhanHoiBySinhVien,
  createPhanHoiAdmin,
  updatePhanHoiAdmin,
  deletePhanHoi,
  getThongKePhanHoi,
} from "../controllers/phanHoiController.js";

const router = express.Router();

router.post("/", verifyToken, guiPhanHoi);
router.put("/traloi", verifyToken, isAdmin, traLoiPhanHoi);
router.get("/", verifyToken, isAdmin, getAllPhanHoi);
router.get("/sinhvien", verifyToken, getPhanHoiBySinhVien);
router.post("/admin", verifyToken, isAdmin, createPhanHoiAdmin);
router.put("/:id_phan_hoi", verifyToken, isAdmin, updatePhanHoiAdmin);
router.delete("/:id_phan_hoi", verifyToken, isAdmin, deletePhanHoi);
router.get("/thongke", verifyToken, isAdmin, getThongKePhanHoi);

export default router;
