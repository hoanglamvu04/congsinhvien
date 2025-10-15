import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  guiTinNhan,
  getHoiThoai,
  getAllTinNhan,
  danhDauDaDoc,
  deleteTinNhan,
  getThongKeTinNhan,
} from "../controllers/tinNhanController.js";

const router = express.Router();

router.post("/", verifyToken, guiTinNhan);
router.get("/", verifyToken, isAdmin, getAllTinNhan);
router.get("/thongke", verifyToken, getThongKeTinNhan);
router.get("/:nguoi_nhan", verifyToken, getHoiThoai);
router.put("/danhdau/:nguoi_nhan", verifyToken, danhDauDaDoc);
router.delete("/:id_tin_nhan", verifyToken, isAdmin, deleteTinNhan);

export default router;
