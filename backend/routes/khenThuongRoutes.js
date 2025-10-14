import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getKhenThuongBySinhVien,
  createKhenThuong,
  deleteKhenThuong,
} from "../controllers/khenThuongController.js";

const router = express.Router();

router.get("/", verifyToken, getKhenThuongBySinhVien);
router.post("/", verifyToken, isAdmin, createKhenThuong);
router.delete("/:id_khen_thuong", verifyToken, isAdmin, deleteKhenThuong);

export default router;
