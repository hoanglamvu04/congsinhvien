import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getAllMonHoc,
  createMonHoc,
  updateMonHoc,
  deleteMonHoc,
} from "../controllers/monHocController.js";

const router = express.Router();

router.get("/", verifyToken, getAllMonHoc);
router.post("/", verifyToken, isAdmin, createMonHoc);
router.put("/:ma_mon", verifyToken, isAdmin, updateMonHoc);
router.delete("/:ma_mon", verifyToken, isAdmin, deleteMonHoc);

export default router;
