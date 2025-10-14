import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getKyLuatBySinhVien,
  createKyLuat,
  deleteKyLuat,
} from "../controllers/kyLuatController.js";

const router = express.Router();

router.get("/", verifyToken, getKyLuatBySinhVien);
router.post("/", verifyToken, isAdmin, createKyLuat);
router.delete("/:id_ky_luat", verifyToken, isAdmin, deleteKyLuat);

export default router;
