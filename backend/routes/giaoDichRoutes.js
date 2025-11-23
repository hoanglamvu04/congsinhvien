import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllGiaoDichHocPhi,
  createGiaoDichHocPhi,
  deleteGiaoDichHocPhi,
} from "../controllers/giaoDichController.js";

const router = express.Router();

router.get("/", verifyToken, getAllGiaoDichHocPhi);
router.post("/", verifyToken, isAdmin, createGiaoDichHocPhi);
router.delete("/:id_gd", verifyToken, isAdmin, deleteGiaoDichHocPhi);

export default router;
