import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin, isPDTOrAdmin } from "../middleware/roleCheck.js";
import {
  getAllKyLuat,
  createKyLuat,
  updateKyLuat,
  deleteKyLuat,
} from "../controllers/kyLuatController.js";

const router = express.Router();

router.get("/", verifyToken, getAllKyLuat);
router.post("/", verifyToken, isPDTOrAdmin, createKyLuat);
router.put("/:id_ky_luat", verifyToken, isPDTOrAdmin, updateKyLuat);
router.delete("/:id_ky_luat", verifyToken, isPDTOrAdmin, deleteKyLuat);

export default router;
